import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import DataTable, { type Row } from "@/components/DataTable";
import { requestRow, REQUEST_COLUMNS_FULL } from "@/lib/request-view";
import { requestUiStatus } from "@/lib/console";

export const dynamic = "force-dynamic";

const CHIPS = [
  { key: "", label: "All" },
  { key: "New", label: "New" },
  { key: "Reviewing", label: "Reviewing" },
  { key: "Quoted", label: "Quoted" },
  { key: "Confirmed", label: "Confirmed" },
  { key: "Rejected", label: "Rejected" },
];

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const { status: statusParam } = await searchParams;
  const active = statusParam ?? "";

  const requests = await prisma.request.findMany({ orderBy: { createdAt: "desc" } });
  const rows: Row[] = requests.map(requestRow);

  const count = (s: string) =>
    s ? requests.filter((r) => requestUiStatus(r.status) === s).length : requests.length;

  const chips = CHIPS.map((c) => ({
    ...c,
    n: count(c.key),
    on: active === c.key,
    href: c.key ? `/operations/requests?status=${c.key}` : "/operations/requests",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "12px 24px" }}>
        <div style={{ marginRight: "auto" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Transport requests
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 15, color: "var(--app-muted)" }}>
            Review incoming requests, prepare quotes and assign carriers.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {chips.map((c) => (
          <a
            key={c.key}
            href={c.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 36,
              padding: "0 14px",
              borderRadius: 999,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: 500,
              background: c.on ? "var(--color-accent)" : "var(--app-card)",
              color: c.on ? "var(--color-bg)" : "var(--color-text)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {c.label}
            <span style={{ fontWeight: 600 }}>{c.n}</span>
          </a>
        ))}
      </div>

      <DataTable
        columns={REQUEST_COLUMNS_FULL}
        rows={rows}
        filters={[
          { key: "status", label: "Status", options: ["New", "Reviewing", "Quoted", "Confirmed", "Rejected"] },
          { key: "cargo", label: "Cargo", options: [...new Set(requests.map((r) => r.cargoType))].sort() },
        ]}
        initial={active ? { status: active } : {}}
        search="Search by ID, customer, route or cargo"
        dateFilter
        primary={{ label: "New request", href: "/request-transport" }}
        noun="requests"
        pageSize={10}
        emptyTitle="No transport requests yet"
        emptyText="Requests submitted through the website and WhatsApp will appear here."
        emptyIcon="ph-clipboard-text"
      />
    </div>
  );
}
