"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentOpsUser } from "@/lib/auth";
import { definitionProblems, isFormId, normalizeForm } from "@/lib/forms/schema";
import { FORMS_TAG } from "@/lib/forms/store";

const PUBLIC_PATH = { quote: "/request-transport", truck: "/register-truck", contact: "/contact" } as const;

// Publishes a form definition from the builder. Admin-only. The posted fields
// are normalised (built-in fields keep their type and lock) and checked before
// anything is saved, and the public form updates immediately.
export async function publishFormAction(
  formId: string,
  fields: unknown
): Promise<{ error: string | null; problems?: string[] }> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) return { error: "Only administrators can change forms." };
  if (!isFormId(formId)) return { error: "Unknown form." };

  const def = normalizeForm(formId, fields);
  const problems = definitionProblems(def);
  if (problems.length) return { error: "Fix these before publishing.", problems };

  const actor = await getCurrentOpsUser();
  await prisma.$transaction([
    prisma.formDefinition.upsert({
      where: { formId },
      create: {
        formId,
        name: def.name,
        publicPath: PUBLIC_PATH[formId],
        fields: def.fields as unknown as Prisma.InputJsonValue,
      },
      update: { fields: def.fields as unknown as Prisma.InputJsonValue },
    }),
    prisma.auditLog.create({
      data: {
        userName: actor?.name ?? "ABRIA Staff",
        action: "Published",
        resource: "Form",
        description: `Published the ${def.name} form (${def.fields.filter((f) => f.enabled && f.type !== "section").length} fields shown)`,
      },
    }),
  ]);

  revalidateTag(FORMS_TAG);
  revalidatePath(PUBLIC_PATH[formId]);
  revalidatePath("/admin/forms", "layout");
  return { error: null };
}

const MESSAGE_STATUSES = ["OPEN", "IN_REVIEW", "CLOSED"];

// Moves a contact message through Open → In review → Closed. Admin-only.
export async function setMessageStatusAction(id: string, status: string): Promise<void> {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed || !MESSAGE_STATUSES.includes(status)) return;
  const sub = await prisma.formSubmission.findUnique({ where: { id } });
  if (!sub || sub.status === status) return;
  const actor = await getCurrentOpsUser();
  await prisma.$transaction([
    prisma.formSubmission.update({ where: { id }, data: { status } }),
    prisma.auditLog.create({
      data: {
        userName: actor?.name ?? "ABRIA Staff",
        action: "Updated",
        resource: "Message",
        description: `Message from ${sub.name} marked ${status.replace("_", " ").toLowerCase()}`,
      },
    }),
  ]);
  revalidatePath("/admin/forms/submissions", "layout");
}
