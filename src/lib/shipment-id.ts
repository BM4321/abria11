import { prisma } from "./prisma";

// Generates an atomic, per-year shipment id in the form SHP-YYYY-NNNNNN.
export async function generateShipmentId(): Promise<string> {
  const year = new Date().getFullYear();

  return prisma.$transaction(async (tx) => {
    const counter = await tx.shipmentCounter.upsert({
      where: { year },
      create: { year, seq: 1 },
      update: { seq: { increment: 1 } },
    });

    return `SHP-${year}-${String(counter.seq).padStart(6, "0")}`;
  });
}
