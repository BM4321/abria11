"use client";

import {
  addMediaAction,
  prepareMediaUploadAction,
  uploadLocalMediaAction,
} from "@/app/admin/actions";
import { createBrowserClientFn } from "@/lib/supabase/client";

// Uploads one image to the media store (Supabase Storage, or public/uploads in
// local dev) and records it in the media library. Returns the public URL.
// Shared by the media library and the branding settings.

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function fmtSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function readDimensions(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(`${img.naturalWidth}×${img.naturalHeight}`);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function checkImage(file: File, maxBytes = MAX_IMAGE_BYTES): string | null {
  if (!IMAGE_ACCEPT.split(",").includes(file.type)) return "Only JPG, PNG, WebP, GIF or AVIF images can be uploaded.";
  if (file.size > maxBytes) return `Images must be ${fmtSize(maxBytes)} or smaller.`;
  return null;
}

export async function uploadImage(
  file: File,
  opts: { alt?: string; category?: string; placement?: string; onSaving?: () => void } = {}
): Promise<{ url: string; dimensions: string | null }> {
  const invalid = checkImage(file);
  if (invalid) throw new Error(invalid);

  const prep = await prepareMediaUploadAction(file.name, file.type, file.size);
  let url: string;
  let storagePath = "";
  if (prep.mode === "error") throw new Error(prep.error);
  if (prep.mode === "supabase") {
    const { error } = await createBrowserClientFn()
      .storage.from("media")
      .uploadToSignedUrl(prep.path, prep.token, file, { contentType: file.type });
    if (error) throw new Error(error.message);
    url = prep.publicUrl;
    storagePath = prep.path;
  } else {
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadLocalMediaAction(fd);
    if ("error" in res) throw new Error(res.error);
    url = res.url;
  }

  opts.onSaving?.();
  const preview = URL.createObjectURL(file);
  const dimensions = await readDimensions(preview);
  URL.revokeObjectURL(preview);

  const fd = new FormData();
  fd.set("fileName", file.name);
  fd.set("url", url);
  fd.set("storagePath", storagePath);
  fd.set("alt", opts.alt ?? "");
  fd.set("category", opts.category ?? "General");
  fd.set("placement", opts.placement ?? "");
  fd.set("size", fmtSize(file.size));
  fd.set("dimensions", dimensions ?? "");
  const saved = await addMediaAction(fd);
  if (saved.error) throw new Error(saved.error);
  return { url, dimensions };
}
