"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentOpsUser } from "@/lib/auth";
import { isSupabaseConfigured, supabaseSecretKey } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/server";
import { OPS_ROLES, type OpsRole } from "@/lib/roles";
import { mediaSlot } from "@/lib/media-slots";
import { passwordProblem, inviteDomainProblem } from "@/lib/password-policy";

async function actorName() {
  const actor = await getCurrentOpsUser();
  return actor?.name ?? (isSupabaseConfigured ? "ABRIA Staff" : "Local Dev");
}

// --- Website pages ---

export async function togglePageStatusAction(slug: string): Promise<void> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return;

  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  if (!page) return;

  const status = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.$transaction([
    prisma.cmsPage.update({ where: { slug }, data: { status } }),
    prisma.auditLog.create({
      data: {
        userName: await actorName(),
        action: status === "PUBLISHED" ? "Published" : "Unpublished",
        resource: "Page",
        description: `${status === "PUBLISHED" ? "Published" : "Unpublished"} ${page.title} (${page.url})`,
      },
    }),
  ]);

  revalidatePath("/admin/website/pages");
}

// --- Media library ---

const MEDIA_BUCKET = "media";
const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// Uploads go straight from the browser to Supabase Storage via a signed URL, so
// large photos never pass through the Netlify function. Without Supabase (local
// dev only) the file is posted to uploadLocalMediaAction instead.
const useStorage = isSupabaseConfigured && Boolean(supabaseSecretKey);

export type PrepareUploadResult =
  | { mode: "supabase"; path: string; token: string; publicUrl: string }
  | { mode: "local" }
  | { mode: "error"; error: string };

function safeObjectName(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = (dot > 0 ? fileName.slice(0, dot) : fileName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext ? `.${ext}` : ""}`;
}

function validateImage(type: string, size: number): string | null {
  if (!IMAGE_TYPES.includes(type)) return "Only JPG, PNG, WebP, GIF or AVIF images can be uploaded.";
  if (size > MAX_MEDIA_BYTES) return "Images must be 10 MB or smaller.";
  return null;
}

export async function prepareMediaUploadAction(
  fileName: string,
  type: string,
  size: number,
): Promise<PrepareUploadResult> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return { mode: "error", error: "Not allowed." };

  const invalid = validateImage(type, size);
  if (invalid) return { mode: "error", error: invalid };

  if (!useStorage) {
    return process.env.NODE_ENV === "production"
      ? { mode: "error", error: "Media storage is not configured." }
      : { mode: "local" };
  }

  const storage = createAdminClient().storage;
  const { data: bucket } = await storage.getBucket(MEDIA_BUCKET);
  if (!bucket) {
    const { error } = await storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MAX_MEDIA_BYTES,
      allowedMimeTypes: IMAGE_TYPES,
    });
    if (error && !/already exists/i.test(error.message)) {
      return { mode: "error", error: `Could not create media bucket: ${error.message}` };
    }
  }

  const path = safeObjectName(fileName);
  const { data, error } = await storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { mode: "error", error: error?.message ?? "Could not start upload." };

  const publicUrl = storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  return { mode: "supabase", path: data.path, token: data.token, publicUrl };
}

// Dev-only fallback: writes the file under public/uploads.
export async function uploadLocalMediaAction(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return { error: "Not allowed." };
  if (useStorage || process.env.NODE_ENV === "production") {
    return { error: "Local uploads are only available in development." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file received." };
  const invalid = validateImage(file.type, file.size);
  if (invalid) return { error: invalid };

  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = safeObjectName(file.name);
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}

function revalidateSlot(placement: string | null | undefined) {
  const slot = placement ? mediaSlot(placement) : undefined;
  if (slot) revalidatePath(slot.path);
}

export async function addMediaAction(formData: FormData): Promise<{ error: string | null }> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return { error: "Not allowed." };

  const fileName = String(formData.get("fileName") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const category = String(formData.get("category") ?? "General").trim() || "General";
  const alt = String(formData.get("alt") ?? "").trim();
  const storagePath = String(formData.get("storagePath") ?? "").trim() || null;
  const size = String(formData.get("size") ?? "").trim() || null;
  const dimensions = String(formData.get("dimensions") ?? "").trim() || null;
  const rawPlacement = String(formData.get("placement") ?? "").trim();
  const placement = rawPlacement && mediaSlot(rawPlacement) ? rawPlacement : null;

  if (!fileName || !url) return { error: "File name and URL are required." };
  if (!/^(https:\/\/|\/)/.test(url)) return { error: "URL must start with https:// or /." };

  const actor = await actorName();
  await prisma.$transaction([
    // A slot shows one image: free it from whichever asset held it.
    ...(placement
      ? [prisma.mediaAsset.updateMany({ where: { placement }, data: { placement: null } })]
      : []),
    prisma.mediaAsset.create({
      data: {
        fileName,
        url,
        category,
        alt: alt || null,
        size,
        dimensions,
        storagePath,
        placement,
        uploadedBy: actor,
      },
    }),
    prisma.auditLog.create({
      data: {
        userName: actor,
        action: "Uploaded",
        resource: "Media",
        description: placement
          ? `Added media asset ${fileName} to ${mediaSlot(placement)!.label}`
          : `Added media asset ${fileName}`,
      },
    }),
  ]);

  revalidateSlot(placement);
  revalidatePath("/admin/website/media");
  return { error: null };
}

export async function setMediaPlacementAction(id: string, placement: string): Promise<void> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return;

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return;
  const next = placement && mediaSlot(placement) ? placement : null;
  if (next === asset.placement) return;

  await prisma.$transaction([
    ...(next
      ? [prisma.mediaAsset.updateMany({ where: { placement: next }, data: { placement: null } })]
      : []),
    prisma.mediaAsset.update({ where: { id }, data: { placement: next } }),
    prisma.auditLog.create({
      data: {
        userName: await actorName(),
        action: "Updated",
        resource: "Media",
        description: next
          ? `Showing ${asset.fileName} on ${mediaSlot(next)!.label}`
          : `Removed ${asset.fileName} from ${mediaSlot(asset.placement ?? "")?.label ?? "the website"}`,
      },
    }),
  ]);

  revalidateSlot(asset.placement);
  revalidateSlot(next);
  revalidatePath("/admin/website/media");
}

export async function deleteMediaAction(id: string): Promise<void> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return;

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return;

  await prisma.$transaction([
    prisma.mediaAsset.delete({ where: { id } }),
    prisma.auditLog.create({
      data: {
        userName: await actorName(),
        action: "Deleted",
        resource: "Media",
        description: `Removed media asset ${asset.fileName}`,
      },
    }),
  ]);

  if (asset.storagePath && useStorage) {
    await createAdminClient().storage.from(MEDIA_BUCKET).remove([asset.storagePath]);
  }

  revalidateSlot(asset.placement);
  revalidatePath("/admin/website/media");
}

// --- Users ---

export type CreateUserState = { error: string | null };

export async function createUserAction(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return { error: "Forbidden." };

  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "OPERATIONS").trim();

  if (!email || !name || !password) {
    return { error: "Name, email and password are required." };
  }
  const pwProblem = await passwordProblem(password);
  if (pwProblem) return { error: pwProblem };
  const domainProblem = await inviteDomainProblem(email);
  if (domainProblem) return { error: domainProblem };
  if (!OPS_ROLES.includes(role as OpsRole)) {
    return { error: "Invalid role." };
  }

  const existing = await prisma.opsUser.findUnique({ where: { email } });
  if (existing) {
    return { error: `A user with email ${email} already exists.` };
  }

  const admin = createAdminClient();
  const { data, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authError) {
    const duplicate =
      typeof authError.message === "string" && /already registered/i.test(authError.message);
    return { error: duplicate ? `A user with email ${email} already exists.` : authError.message };
  }

  await prisma.$transaction([
    prisma.opsUser.create({ data: { id: data.user.id, email, name, role } }),
    prisma.auditLog.create({
      data: {
        userName: await actorName(),
        action: "Created",
        resource: "User",
        description: `Created ${email} with role ${role}`,
      },
    }),
  ]);

  revalidatePath("/admin/users");
  return { error: null };
}

export type ResetPasswordState = { error: string | null };

export async function resetUserPasswordAction(
  id: string,
  password: string
): Promise<ResetPasswordState> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return { error: "Forbidden." };

  const pwProblem = await passwordProblem(password);
  if (pwProblem) return { error: pwProblem };

  const user = await prisma.opsUser.findUnique({ where: { id } });
  if (!user) return { error: "User not found." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return { error: error.message };

  await prisma.auditLog.create({
    data: {
      userName: await actorName(),
      action: "Reset password",
      resource: "User",
      description: `Reset password for ${user.email}`,
    },
  });

  return { error: null };
}

export async function updateUserAction(id: string, role: string, active: boolean): Promise<void> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return;

  if (!OPS_ROLES.includes(role as OpsRole)) return;

  const user = await prisma.opsUser.findUnique({ where: { id } });
  if (!user) return;

  // Never demote or disable the last active admin: nobody could undo it.
  const losesAdmin = user.role === "ADMIN" && user.active && (role !== "ADMIN" || !active);
  if (losesAdmin) {
    const otherAdmins = await prisma.opsUser.count({
      where: { role: "ADMIN", active: true, id: { not: id } },
    });
    if (otherAdmins === 0) return;
  }

  await prisma.$transaction([
    prisma.opsUser.update({ where: { id }, data: { role, active } }),
    prisma.auditLog.create({
      data: {
        userName: await actorName(),
        action: "Updated",
        resource: "User",
        description: `Updated ${user.email} to role ${role}${active ? "" : " (disabled)"}`,
      },
    }),
  ]);

  revalidatePath("/admin/users");
}
