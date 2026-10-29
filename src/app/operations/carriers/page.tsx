import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { partnerRow, CARRIER_COLUMNS } from "@/lib/console-views";

export const dynamic = "force-dynamic";

export default async function CarriersPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { trucks: true, shipments: true },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Carriers"
        subtitle="Truck owners and transport providers in the ABRIA network."
      />
      <DataTable
        columns={CARRIER_COLUMNS}
        rows={partners.map(partnerRow)}
        filters={[
          { key: "status", label: "Verification", options: ["Verified", "Pending Verification", "Suspended"] },
          { key: "location", label: "Location", options: [...new Set(partners.map((p) => p.currentLocation).filter(Boolean) as string[])].sort() },
        ]}
        search="Search by name, company, location or route"
        noun="carriers"
        pageSize={10}
        emptyTitle="No carriers registered"
        emptyText="Carrier registrations will appear here."
        emptyIcon="ph-truck"
      />
    </div>
  );
}
