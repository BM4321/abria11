import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { shipmentRow, SHIPMENT_COLUMNS_FULL } from "@/lib/shipment-view";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { partner: true, truck: true },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Shipments"
        subtitle="Track every shipment from assignment to proof of delivery."
      />
      <DataTable
        columns={SHIPMENT_COLUMNS_FULL}
        rows={shipments.map(shipmentRow)}
        filters={[
          { key: "status", label: "Status", options: ["Assigned", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Delayed"] },
          { key: "region", label: "Region", options: [...new Set(shipments.map((s) => s.deliveryLocation))].sort() },
        ]}
        search="Search by shipment, customer, route, carrier or truck"
        dateFilter
        noun="shipments"
        pageSize={10}
        emptyTitle="No shipments yet"
        emptyText="Convert a confirmed request into a shipment to see it here."
        emptyIcon="ph-package"
      />
    </div>
  );
}
