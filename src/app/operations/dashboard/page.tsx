import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import { STATUS_LABELS, type RequestStatus } from "@/lib/status";
import DataTable, { type Row } from "@/components/DataTable";
import { requestRow, REQUEST_COLUMNS_SHORT } from "@/lib/request-view";
import { shipmentRow, SHIPMENT_COLUMNS_SHORT } from "@/lib/shipment-view";
import {
  fmtRelative,
  fmtTime,
  tone,
} from "@/lib/console";

export const dynamic = "force-dynamic";

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        padding: 18,
        borderRadius: 16,
        background: "var(--app-card)",
        boxShadow: "var(--shadow-sm)",
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export default async function OperationsDashboardPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const [
    totalRequests,
    newReq,
    totalPartners,
    verifiedCarriers,
    pendingCar,
    pendingQuotes,
    activeShip,
    completed,
    delayed,
    shipmentStatusCounts,
    recentRequests,
    recentShipments,
    notes,
  ] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({ where: { status: "NEW_REQUEST" } }),
    prisma.partner.count(),
    prisma.partner.count({ where: { status: "VERIFIED" } }),
    prisma.partner.count({ where: { status: "PENDING" } }),
    prisma.quotation.count({ where: { sentAt: { not: null }, validUntil: null } }),
    prisma.shipment.count({ where: { status: { not: "DELIVERED" } } }),
    prisma.shipment.count({ where: { status: "DELIVERED" } }),
    prisma.shipment.count({ where: { delayed: true, status: { not: "DELIVERED" } } }),
    prisma.shipment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.request.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.shipment.findMany({
      where: { status: { not: "DELIVERED" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.requestStatusHistory.findMany({
      orderBy: { changedAt: "desc" },
      take: 6,
      include: { request: { select: { requestId: true } } },
    }),
  ]);

  const shipmentStatusMap = Object.fromEntries(
    shipmentStatusCounts.map((s) => [s.status, s._count._all])
  );

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = (access.user?.name ?? "there").split(" ")[0];

  const kpis = [
    { label: "Transport requests", icon: "ph-duotone ph-clipboard-text", value: totalRequests, href: "/operations/requests", note: `${newReq} new` },
    { label: "Active shipments", icon: "ph-duotone ph-package", value: activeShip, href: "/operations/shipments", note: "on the road now" },
    { label: "Pending quotes", icon: "ph-duotone ph-receipt", value: pendingQuotes, href: "/operations/quotes", note: "awaiting response" },
    { label: "Completed deliveries", icon: "ph-duotone ph-seal-check", value: completed, href: "/operations/deliveries", note: "all time" },
    { label: "Registered carriers", icon: "ph-duotone ph-truck", value: totalPartners, href: "/operations/carriers", note: `${verifiedCarriers} verified` },
    { label: "Pending verification", icon: "ph-duotone ph-shield-warning", value: pendingCar, href: "/operations/carriers", note: "carrier registrations" },
  ];

  const attention = [
    {
      icon: "ph-duotone ph-shield-warning",
      title: `${pendingCar} carrier registrations awaiting verification`,
      sub: "Review new carrier submissions",
      href: "/operations/carriers",
      tag: "warn" as const,
      n: pendingCar,
    },
    {
      icon: "ph-duotone ph-clock-countdown",
      title: `${delayed} shipments delayed`,
      sub: "Past their ETA",
      href: "/operations/shipments",
      tag: "bad" as const,
      n: delayed,
    },
    {
      icon: "ph-duotone ph-clipboard-text",
      title: `${newReq} requests have not been reviewed`,
      sub: "Status: New",
      href: "/operations/requests",
      tag: "info" as const,
      n: newReq,
    },
  ].filter((a) => a.n > 0);

  const reqRows: Row[] = recentRequests.map(requestRow);
  const shipRows: Row[] = recentShipments.map(shipmentRow);

  const activity = notes.map((h, i, arr) => ({
    time: fmtTime(h.changedAt),
    // Precise stage names: the UI buckets collapse every post-approval stage
    // into "Confirmed", which produced "moved from Confirmed to Confirmed".
    text: `${h.request.requestId} moved from ${STATUS_LABELS[h.fromStatus as RequestStatus] ?? h.fromStatus} to ${STATUS_LABELS[h.toStatus as RequestStatus] ?? h.toStatus}`,
    by: h.changedByName ?? "System",
    when: fmtRelative(h.changedAt),
    line: i === arr.length - 1 ? "transparent" : "var(--app-line)",
  }));

  const statusBuckets = [
    { label: "In transit", value: shipmentStatusMap["IN_TRANSIT"] ?? 0, color: "var(--color-accent)" },
    { label: "Assigned", value: shipmentStatusMap["ASSIGNED"] ?? 0, color: "var(--color-accent-300)" },
    { label: "Picked up", value: shipmentStatusMap["PICKED_UP"] ?? 0, color: "var(--color-process-yellow)" },
    { label: "Out for delivery", value: shipmentStatusMap["OUT_FOR_DELIVERY"] ?? 0, color: "var(--color-accent-2)" },
  ];
  const donutTotal = statusBuckets.reduce((a, b) => a + b.value, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "12px 24px" }}>
        <div style={{ marginRight: "auto" }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--app-muted)" }}>{today} · Operations</p>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>
            {greet}, {name}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 15, color: "var(--app-muted)" }}>
            Here&apos;s what&apos;s happening across ABRIA today.
          </p>
        </div>
        <Link className="btn btn-primary" href="/request-transport" style={{ minHeight: 40, borderRadius: 10 }}>
          <i className="ph ph-plus" aria-hidden="true" />
          New request
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,196px),1fr))", gap: 16 }}>
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            data-ripple="1"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: 18,
              borderRadius: 16,
              background: "var(--app-card)",
              boxShadow: "var(--shadow-sm)",
              textDecoration: "none",
              color: "var(--color-text)",
              minWidth: 0,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--app-muted)" }}>{k.label}</span>
              <i className={k.icon} aria-hidden="true" style={{ fontSize: 20, color: "var(--color-accent)" }} />
            </span>
            <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em", fontFeatureSettings: "'tnum' 1" }}>
              {k.value}
            </span>
            <span style={{ fontSize: 12, color: "var(--app-muted)" }}>{k.note}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <Card style={{ flex: "1 1 320px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Needs attention</h2>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: "color-mix(in srgb,var(--color-accent-2) 14%,transparent)",
                color: "var(--color-accent-2-800)",
              }}
            >
              {attention.reduce((a, x) => a + x.n, 0)}
            </span>
          </div>
          {attention.length === 0 ? (
            <p style={{ margin: 0, padding: "12px 0", fontSize: 14, color: "var(--app-muted)" }}>
              Nothing needs attention right now.
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {attention.map((a) => {
                const t = tone(a.tag === "warn" ? "Reviewing" : a.tag === "bad" ? "Delayed" : "New");
                return (
                  <li key={a.title}>
                    <Link
                      href={a.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        borderRadius: 12,
                        textDecoration: "none",
                        color: "var(--color-text)",
                      }}
                    >
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          flex: "none",
                          display: "grid",
                          placeItems: "center",
                          background: t.bg,
                          color: t.fg,
                        }}
                      >
                        <i className={a.icon} aria-hidden="true" style={{ fontSize: 20 }} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 500 }}>{a.title}</span>
                        <span style={{ display: "block", fontSize: 12.5, color: "var(--app-muted)" }}>{a.sub}</span>
                      </span>
                      <i className="ph ph-caret-right" aria-hidden="true" style={{ color: "var(--app-muted)" }} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card style={{ flex: "2 1 520px" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Shipments by status</h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--app-muted)" }}>
            Active shipments across the network
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, marginTop: 16 }}>
            <div style={{ position: "relative", width: 160, height: 160, flex: "none" }}>
              <Donut buckets={statusBuckets} total={donutTotal} />
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 600 }}>{donutTotal}</div>
                  <div style={{ fontSize: 12, color: "var(--app-muted)" }}>active</div>
                </div>
              </div>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 140 }}>
              {statusBuckets.map((s) => (
                <li key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <strong style={{ fontWeight: 600 }}>{s.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <DataTable
        title="Recent transport requests"
        subtitle="Latest submissions from the website and WhatsApp"
        columns={REQUEST_COLUMNS_SHORT}
        rows={reqRows}
        noun="requests"
        pageSize={5}
        footLink={{ label: "View all requests", href: "/operations/requests" }}
        emptyTitle="No requests yet"
        emptyText="Requests submitted through the website and WhatsApp will appear here."
        emptyIcon="ph-clipboard-text"
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: "2 1 560px", minWidth: 0 }}>
          <DataTable
            title="Active shipments"
            columns={SHIPMENT_COLUMNS_SHORT}
            rows={shipRows}
            noun="shipments"
            pageSize={5}
            footLink={{ label: "View all shipments", href: "/operations/shipments" }}
            emptyTitle="No active shipments"
            emptyText="Converted requests appear here once carriers are assigned."
            emptyIcon="ph-package"
          />
        </div>
        <Card style={{ flex: "1 1 320px" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>Activity</h2>
          {activity.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>
              Status changes will appear here.
            </p>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {activity.map((a, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "44px 32px minmax(0,1fr)", gap: "0 8px", alignItems: "start" }}>
                  <span style={{ fontSize: 12, color: "var(--app-muted)", paddingTop: 7, fontFeatureSettings: "'tnum' 1" }}>
                    {a.time}
                  </span>
                  <span style={{ position: "relative", display: "flex", justifyContent: "center", height: "100%" }}>
                    <span aria-hidden="true" style={{ position: "absolute", top: 32, bottom: 0, width: 2, background: a.line }} />
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: "color-mix(in srgb,var(--color-accent) 12%,transparent)",
                        color: "var(--color-accent-700)",
                        position: "relative",
                      }}
                    >
                      <i className="ph-duotone ph-package" aria-hidden="true" style={{ fontSize: 15 }} />
                    </span>
                  </span>
                  <div style={{ padding: "6px 0 18px", fontSize: 13.5, lineHeight: 1.4 }}>
                    {a.text}
                    <span style={{ display: "block", fontSize: 12, color: "var(--app-muted)" }}>
                      {a.when} · {a.by}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: "var(--app-muted)" }}>
        Figures on this page are drawn live from the ABRIA database.
      </p>
    </div>
  );
}

function Donut({
  buckets,
  total,
}: {
  buckets: { label: string; value: number; color: string }[];
  total: number;
}) {
  const C = 2 * Math.PI * 60;
  let off = 0;
  return (
    <svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Shipments by status" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="80" cy="80" r="60" fill="none" stroke="var(--app-line)" strokeWidth="20" />
      {buckets.map((s) => {
        const len = total > 0 ? (C * s.value) / total : 0;
        const dash = `${Math.max(0, len - 2).toFixed(1)} ${(C - len + 2).toFixed(1)}`;
        const el = (
          <circle
            key={s.label}
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke={s.color}
            strokeWidth="20"
            strokeDasharray={dash}
            strokeDashoffset={(-off).toFixed(1)}
          />
        );
        off += len;
        return el;
      })}
    </svg>
  );
}
