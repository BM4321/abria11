import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { requestUiStatus, shipmentUiStatus } from "@/lib/console";

export const dynamic = "force-dynamic";

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: 18, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", minWidth: 0 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
      {sub && <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--app-muted)" }}>{sub}</p>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d) => (
        <li key={d.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 5 }}>
            <span>{d.label}</span>
            <strong style={{ fontWeight: 600 }}>{d.value}</strong>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "var(--app-line)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(d.value / max) * 100}%`, borderRadius: 999, background: "var(--color-accent)" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function ReportsPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const [requests, shipments] = await Promise.all([
    prisma.request.findMany(),
    prisma.shipment.findMany(),
  ]);

  const byStatus = ["New", "Reviewing", "Quoted", "Confirmed", "Rejected"].map((s) => ({
    label: s,
    value: requests.filter((r) => requestUiStatus(r.status) === s).length,
  }));

  const routeCounts = new Map<string, number>();
  for (const r of requests) {
    const k = `${r.pickupLocation} → ${r.deliveryLocation}`;
    routeCounts.set(k, (routeCounts.get(k) ?? 0) + 1);
  }
  const routes = [...routeCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const regionCounts = new Map<string, number>();
  for (const s of shipments) {
    regionCounts.set(s.deliveryLocation, (regionCounts.get(s.deliveryLocation) ?? 0) + 1);
  }
  const regions = [...regionCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const cargoCounts = new Map<string, number>();
  for (const r of requests) {
    cargoCounts.set(r.cargoType, (cargoCounts.get(r.cargoType) ?? 0) + 1);
  }
  const cargo = [...cargoCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const shipmentStatus = ["Assigned", "Picked Up", "In Transit", "Out for Delivery", "Delivered"].map((s) => ({
    label: s,
    value: shipments.filter((x) => shipmentUiStatus(x.status) === s).length,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Reports" subtitle="Requests, routes and delivery performance drawn from live records." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 20 }}>
        <Card title="Requests by status" sub="All time">
          <Bars data={byStatus} />
        </Card>
        <Card title="Shipments by status" sub="All time">
          <Bars data={shipmentStatus} />
        </Card>
        <Card title="Popular routes" sub="Requests">
          {routes.length ? <Bars data={routes} /> : <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No route data yet.</p>}
        </Card>
        <Card title="Deliveries by region" sub="Shipment destinations">
          {regions.length ? <Bars data={regions} /> : <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No shipment data yet.</p>}
        </Card>
        <Card title="Cargo types" sub="Requests">
          {cargo.length ? <Bars data={cargo} /> : <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No cargo data yet.</p>}
        </Card>
      </div>
    </div>
  );
}
