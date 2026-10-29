import { prisma } from "@/lib/prisma";

export type SlotImage = { src: string; alt: string } | null;

// Image assigned to a public-site slot. Never throws: a missing or unreachable
// database (e.g. at build time) falls back to the slot's placeholder.
export async function getSlotImage(slot: string): Promise<SlotImage> {
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { placement: slot } });
    return asset ? { src: asset.url, alt: asset.alt ?? "" } : null;
  } catch {
    return null;
  }
}
