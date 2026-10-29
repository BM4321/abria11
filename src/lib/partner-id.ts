import { prisma } from "./prisma";

// Generates an atomic, per-year partner id in the form ABP-YYYY-NNNNNN.
export async function generatePartnerId(): Promise<string> {
  const year = new Date().getFullYear();

  return prisma.$transaction(async (tx) => {
    const counter = await tx.partnerCounter.upsert({
      where: { year },
      create: { year, seq: 1 },
      update: { seq: { increment: 1 } },
    });

    return `ABP-${year}-${String(counter.seq).padStart(6, "0")}`;
  });
}
