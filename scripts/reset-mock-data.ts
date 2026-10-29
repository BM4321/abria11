import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Removes all seeded/demo transactional data so the console reflects only real
// records. Preserves configuration and access data: OpsUser, Setting, CmsPage
// and FormDefinition. Safe to re-run.

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$transaction([
    prisma.internalNote.deleteMany(),
    prisma.requestStatusHistory.deleteMany(),
    prisma.shipment.deleteMany(),
    prisma.quotation.deleteMany(),
    prisma.shipmentCounter.deleteMany(),
    prisma.truck.deleteMany(),
    prisma.partner.deleteMany(),
    prisma.request.deleteMany(),
    prisma.requestCounter.deleteMany(),
    prisma.partnerCounter.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.mediaAsset.deleteMany(),
  ]);

  const [
    notes,
    history,
    shipments,
    quotations,
    shipmentCounters,
    trucks,
    partners,
    requests,
    requestCounters,
    partnerCounters,
    notifications,
    audit,
    media,
  ] = result;

  console.log("[reset] Removed demo data:");
  console.log(`  internal notes      ${notes.count}`);
  console.log(`  status history      ${history.count}`);
  console.log(`  shipments           ${shipments.count}`);
  console.log(`  quotations          ${quotations.count}`);
  console.log(`  shipment counters   ${shipmentCounters.count}`);
  console.log(`  trucks              ${trucks.count}`);
  console.log(`  partners            ${partners.count}`);
  console.log(`  requests            ${requests.count}`);
  console.log(`  request counters    ${requestCounters.count}`);
  console.log(`  partner counters    ${partnerCounters.count}`);
  console.log(`  notifications       ${notifications.count}`);
  console.log(`  audit logs          ${audit.count}`);
  console.log(`  media assets        ${media.count}`);
  console.log("[reset] Kept: OpsUser, Setting, CmsPage, FormDefinition.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
