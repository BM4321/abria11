import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { REPORT_EXPORTS, buildSummary, parseRange, presetRanges, rangeLabel } from "@/lib/reports";

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

function rangeQuery(from: string, to: string, extra: Record<string, string> = {}) {
  const q = new URLSearchParams(extra);
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  const str = q.toString();
  return str ? `?${str}` : "";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const params = await searchParams;
  const range = parseRange(params.from, params.to);
  const period = rangeLabel(range);

  const [requests, shipments] = await Promise.all([
    prisma.request.findMany({ where: { createdAt: range.where } }),
    prisma.shipment.findMany({ where: { createdAt: range.where } }),
  ]);

  const summary = buildSummary(requests, shipments);
  const { byStatus, shipmentStatus, cargo } = summary;
  const routes = summary.routes.slice(0, 8);
  const regions = summary.regions.slice(0, 8);

  const presets = presetRanges().map((p) => ({
    ...p,
    on: p.from === range.from && p.to === range.to,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Reports" subtitle="Requests, routes and delivery performance drawn from live records." />

      <Card title="Period" sub={`Showing records created: ${period}. Dates are in Tanzania time.`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {presets.map((p) => (
              <a
                key={p.label}
                href={`/operations/reports${rangeQuery(p.from, p.to)}`}
                aria-current={p.on ? "true" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 36,
                  padding: "0 14px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontSize: 13.5,
                  fontWeight: 500,
                  background: p.on ? "var(--color-accent)" : "var(--app-card)",
                  color: p.on ? "var(--color-bg)" : "var(--color-text)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {p.label}
              </a>
            ))}
          </div>
          <form method="get" action="/operations/reports" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
            <div className="field" style={{ minWidth: 0, flex: "1 1 160px", maxWidth: 220 }}>
              <label htmlFor="report-from">From</label>
              <input id="report-from" name="from" type="date" className="input" defaultValue={range.from} max={range.to || undefined} />
            </div>
            <div className="field" style={{ minWidth: 0, flex: "1 1 160px", maxWidth: 220 }}>
              <label htmlFor="report-to">To</label>
              <input id="report-to" name="to" type="date" className="input" defaultValue={range.to} min={range.from || undefined} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ minHeight: 42 }}>
              Apply
            </button>
          </form>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 20 }}>
        <Card title="Requests by status" sub={`${period} · ${requests.length} total`}>
          <Bars data={byStatus} />
        </Card>
        <Card title="Shipments by status" sub={`${period} · ${shipments.length} total`}>
          <Bars data={shipmentStatus} />
        </Card>
        <Card title="Popular routes" sub="Requests">
          {routes.length ? <Bars data={routes} /> : <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No route data for this period.</p>}
        </Card>
        <Card title="Deliveries by region" sub="Shipment destinations">
          {regions.length ? <Bars data={regions} /> : <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No shipment data for this period.</p>}
        </Card>
        <Card title="Cargo types" sub="Requests">
          {cargo.length ? <Bars data={cargo} /> : <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No cargo data for this period.</p>}
        </Card>
      </div>

      <Card title="Download reports" sub={`CSV files for ${period}. They open in Excel, Google Sheets or Numbers.`}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
          {REPORT_EXPORTS.map((r, i) => (
            <li
              key={r.key}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px 16px",
                padding: "12px 0",
                borderTop: i ? "1px solid var(--app-line)" : undefined,
              }}
            >
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{r.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--app-muted)" }}>{r.description}</p>
              </div>
              <a
                className="btn btn-secondary"
                href={`/api/reports/export${rangeQuery(range.from, range.to, { type: r.key })}`}
                download
                style={{ minHeight: 38, gap: 8, textDecoration: "none" }}
              >
                <i className="ph-duotone ph-download-simple" aria-hidden="true" style={{ fontSize: 17 }} />
                Download CSV
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
