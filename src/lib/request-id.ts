import { prisma } from "./prisma";

// Generates an atomic, per-year request id in the form ABR-YYYY-NNNNNN.
// Uses an upsert increment on a counter row to avoid collisions under concurrency.
export async function generateRequestId(): Promise<string> {
  const year = new Date().getFullYear();

  return prisma.$transaction(async (tx) => {
    const counter = await tx.requestCounter.upsert({
      where: { year },
      create: { year, seq: 1 },
      update: { seq: { increment: 1 } },
    });

    return `ABR-${year}-${String(counter.seq).padStart(6, "0")}`;
  });
}
