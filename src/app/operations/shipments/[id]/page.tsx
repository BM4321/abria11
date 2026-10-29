import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import ShipmentActions from "@/components/ShipmentActions";
import {
  fmtDate,
  fmtRelative,
  fmtKg,
  tone,
  shipmentUiStatus,
} from "@/lib/console";

export const dynamic = "force-dynamic";

const STAGES = [
  "Request Created",
  "Quote Accepted",
  "Carrier Assigned",
  "Pickup Completed",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

const STAGE_OF: Record<string, number> = {
  ASSIGNED: 2,
  PICKED_UP: 3,
  IN_TRANSIT: 4,
  OUT_FOR_DELIVERY: 5,
  DELIVERED: 6,
  DELAYED: 4,
};

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const { id } = await params;
  const s = await prisma.shipment.findUnique({
    where: { id },
    include: { partner: true, truck: true, request: true },
  });
  if (!s) notFound();

  const [partners, trucks] = await Promise.all([
    prisma.partner.findMany({
      where: { OR: [{ status: "VERIFIED" }, ...(s.partnerId ? [{ id: s.partnerId }] : [])] },
      orderBy: { companyName: "asc" },
      select: { id: true, partnerId: true, companyName: true, contactPerson: true, truckType: true },
    }),
    prisma.truck.findMany({
      orderBy: { registrationNumber: "asc" },
      select: { id: true, partnerId: true, registrationNumber: true, truckType: true },
    }),
  ]);

  const ui = shipmentUiStatus(s.status);
  const st = tone(ui);
  const stage = STAGE_OF[s.status] ?? 0;

  const info: { k: string; v: string }[] = [
    { k: "Customer", v: s.customerCompany ?? s.customerName ?? "—" },
    { k: "Contact", v: s.customerName ?? "—" },
    { k: "Phone", v: s.customerPhone ?? "—" },
    { k: "Pickup", v: s.pickupLocation },
    { k: "Destination", v: s.deliveryLocation },
    { k: "Cargo", v: s.cargoDescription ?? "—" },
    { k: "Weight", v: fmtKg(s.weight) },
    { k: "Quantity", v: s.quantity != null ? `${s.quantity} items` : "—" },
    { k: "ETA", v: s.eta ? fmtDate(s.eta) : "—" },
    { k: "Carrier", v: s.partner?.companyName ?? s.partner?.contactPerson ?? "Unassigned" },
    { k: "Truck", v: s.truck ? `${s.truck.registrationNumber} · ${s.truck.truckType}` : "—" },
    { k: "Driver", v: s.driverName ? `${s.driverName}${s.driverPhone ? ` · ${s.driverPhone}` : ""}` : "—" },
    ...(s.request?.podReceivedBy
      ? [
          { k: "Received by", v: s.request.podReceivedBy },
          { k: "Delivery notes", v: s.request.podNotes ?? "—" },
        ]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <nav aria-label="Breadcrumb" style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--app-muted)" }}>
        <Link href="/operations/shipments" style={{ textDecoration: "none" }}>
          Shipments
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{s.shipmentId}</span>
      </nav>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "16px 24px", marginTop: -8 }}>
        <div style={{ marginRight: "auto", minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>
              Shipment {s.shipmentId}
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px 4px 10px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                background: st.bg,
                color: st.fg,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot }} />
              {ui}
            </span>
            {s.delayed && s.status !== "DELIVERED" && (
              <span className="tag tag-accent-2">Delayed{s.delayNote ? ` · ${s.delayNote}` : ""}</span>
            )}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
            {s.pickupLocation} → {s.deliveryLocation}
            {s.request ? ` · Request ${s.request.requestId}` : ""}
          </p>
        </div>
        {s.request && (
          <Link
            className="btn btn-secondary"
            href={`/operations/requests/${s.request.id}`}
            style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)" }}
          >
            <i className="ph ph-clipboard-text" aria-hidden="true" />
            View request
          </Link>
        )}
      </div>

      <ol
        aria-label="Shipment progress"
        style={{
          listStyle: "none",
          margin: 0,
          padding: "16px 18px",
          borderRadius: 16,
          background: "var(--app-card)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 0",
        }}
      >
        {STAGES.map((label, i) => {
          const done = i < stage || s.status === "DELIVERED";
          const cur = i === stage && s.status !== "DELIVERED";
          return (
            <li key={label} style={{ flex: "1 1 130px", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flex: "none",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  background: done ? "var(--color-accent)" : cur ? "var(--app-card)" : "var(--app-page)",
                  color: done ? "var(--color-bg)" : cur ? "var(--color-accent-700)" : "var(--app-muted)",
                  boxShadow: cur ? "inset 0 0 0 2px var(--color-accent)" : "none",
                }}
              >
                <i className={done ? "ph ph-check" : cur ? "ph-fill ph-circle" : "ph ph-circle"} aria-hidden="true" />
              </span>
              <span style={{ fontSize: 13, fontWeight: cur ? 600 : 400, whiteSpace: "nowrap" }}>{label}</span>
              <span
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 2,
                  minWidth: 12,
                  margin: "0 6px",
                  borderRadius: 2,
                  background: i === STAGES.length - 1 ? "transparent" : done ? "var(--color-accent)" : "var(--app-line)",
                }}
              />
            </li>
          );
        })}
      </ol>

      <ShipmentActions
        shipment={{
          id: s.id,
          shipmentId: s.shipmentId,
          status: s.status,
          partnerId: s.partnerId,
          truckId: s.truckId,
          driverName: s.driverName,
          driverPhone: s.driverPhone,
          eta: s.eta?.toISOString() ?? null,
          delayed: s.delayed,
          delayNote: s.delayNote,
        }}
        partners={partners.map((p) => ({
          id: p.id,
          label: `${p.companyName ?? p.contactPerson} · ${p.truckType} (${p.partnerId})`,
        }))}
        trucks={trucks.map((t) => ({ id: t.id, partnerId: t.partnerId, label: `${t.registrationNumber} · ${t.truckType}` }))}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 20 }}>
        <section style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Shipment details</h2>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,180px),1fr))", gap: "18px 24px" }}>
            {info.map((x) => (
              <div key={x.k} style={{ minWidth: 0 }}>
                <dt style={{ fontSize: 12, color: "var(--app-muted)" }}>{x.k}</dt>
                <dd style={{ margin: "3px 0 0", fontSize: 14.5, fontWeight: 500 }}>{x.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Progress</h2>
          <div style={{ height: 10, borderRadius: 999, background: "var(--app-line)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.round(s.progress * 100)}%`,
                borderRadius: 999,
                background: "var(--color-accent)",
              }}
            />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
            {Math.round(s.progress * 100)}% complete · Updated {fmtRelative(s.updatedAt)}
          </p>
          {s.deliveredAt && (
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>
              Delivered {fmtDate(s.deliveredAt)}
              {s.request?.podReceivedBy ? `, received by ${s.request.podReceivedBy}` : ""}.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
