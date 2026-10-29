import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import DataTable, { type Row } from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { fmtDateShort } from "@/lib/console";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { partner: true },
  });

  const rows: Row[] = shipments.map((s) => {
    const status =
      s.status === "DELIVERED"
        ? "Delivered"
        : s.delayed
          ? "Delayed"
          : s.status === "OUT_FOR_DELIVERY"
            ? "Out for Delivery"
            : "Scheduled";
    return {
      id: s.shipmentId,
      href: `/operations/shipments/${s.id}`,
      date: s.eta?.toISOString() ?? s.createdAt.toISOString(),
      search: [s.shipmentId, s.customerCompany ?? "", s.deliveryLocation, s.partner?.companyName ?? ""].join(" "),
      f: { status, carrier: s.partner?.companyName ?? "" },
      s: { expected: s.eta?.toISOString() ?? "", delivered: s.deliveredAt?.toISOString() ?? "" },
      cells: {
        id: { t: s.shipmentId, href: `/operations/shipments/${s.id}`, sub: "shipment" },
        cust: { t: s.customerCompany ?? s.customerName ?? "—" },
        dest: { t: s.deliveryLocation },
        carrier: { t: s.partner?.companyName ?? "Unassigned" },
        expected: { t: s.eta ? fmtDateShort(s.eta) : "—" },
        delivered: {
          t: s.deliveredAt ? fmtDateShort(s.deliveredAt) : "—",
          sub: s.status === "DELIVERED" ? "POD received" : "",
        },
        status: { badge: status },
      },
      actions: [{ label: "Open", icon: "ph-arrow-right", href: `/operations/shipments/${s.id}` }],
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Deliveries"
        subtitle="Expected and completed deliveries with proof of delivery."
      />
      <DataTable
        columns={[
          { key: "id", label: "Delivery" },
          { key: "cust", label: "Customer" },
          { key: "dest", label: "Destination" },
          { key: "carrier", label: "Carrier" },
          { key: "expected", label: "Expected" },
          { key: "delivered", label: "Delivered" },
          { key: "status", label: "Status" },
        ]}
        rows={rows}
        filters={[
          { key: "status", label: "Status", options: ["Scheduled", "Out for Delivery", "Delivered", "Delayed"] },
        ]}
        search="Search by shipment, customer, destination or carrier"
        dateFilter
        noun="deliveries"
        pageSize={10}
        emptyTitle="No deliveries yet"
        emptyText="Deliveries appear here as shipments progress."
        emptyIcon="ph-seal-check"
      />
    </div>
  );
}
