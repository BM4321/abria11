import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { customerRows, CUSTOMER_COLUMNS, type CustomerGroup } from "@/lib/console-views";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const requests = await prisma.request.findMany({ orderBy: { createdAt: "desc" } });
  const shipments = await prisma.shipment.findMany({ orderBy: { createdAt: "desc" } });

  const groups = new Map<string, CustomerGroup>();
  for (const r of requests) {
    const key = (r.phone || r.contactPerson).replace(/\s/g, "") || r.contactPerson;
    const existing = groups.get(key);
    if (existing) {
      existing.requests += 1;
    } else {
      groups.set(key, {
        key,
        name: r.contactPerson,
        company: r.companyName,
        phone: r.phone,
        email: r.email,
        region: r.pickupLocation,
        requests: 1,
        shipments: 0,
        last: r.createdAt.toISOString(),
      });
    }
  }
  for (const s of shipments) {
    const key = (s.customerPhone ?? s.customerName ?? "").replace(/\s/g, "");
    const existing = [...groups.values()].find(
      (g) => g.name === s.customerName || (s.customerPhone && g.phone === s.customerPhone)
    );
    if (existing) {
      existing.shipments += 1;
      if (s.createdAt.toISOString() > existing.last) existing.last = s.createdAt.toISOString();
    } else if (key) {
      groups.set(key, {
        key,
        name: s.customerName ?? "—",
        company: s.customerCompany,
        phone: s.customerPhone ?? "—",
        email: null,
        region: s.pickupLocation,
        requests: 0,
        shipments: 1,
        last: s.createdAt.toISOString(),
      });
    }
  }

  const list = [...groups.values()].sort((a, b) => (a.last < b.last ? 1 : -1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Customers"
        subtitle="Businesses and cargo owners who have requested transport."
      />
      <DataTable
        columns={CUSTOMER_COLUMNS}
        rows={customerRows(list)}
        filters={[{ key: "region", label: "Region", options: [...new Set(list.map((c) => c.region))].sort() }]}
        search="Search by name, company, email or phone"
        noun="customers"
        pageSize={10}
        emptyTitle="No customers yet"
        emptyText="Customers appear here once they submit a request."
        emptyIcon="ph-users"
      />
    </div>
  );
}
