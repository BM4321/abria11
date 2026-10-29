import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import CarrierStatusActions from "@/components/CarrierStatusActions";
import ExtraAnswers from "@/components/forms/ExtraAnswers";
import { fmtDate, fmtRelative, partnerUiStatus, shipmentUiStatus, tone } from "@/lib/console";

export const dynamic = "force-dynamic";

const card: React.CSSProperties = { padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" };
const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "var(--app-muted)", borderBottom: "1px solid var(--app-line)", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px", borderBottom: "1px solid var(--app-line)", fontSize: 14 };

function Badge({ label }: { label: string }) {
  const st = tone(label);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 8px", borderRadius: 999, fontSize: 12.5, fontWeight: 500, background: st.bg, color: st.fg, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
      {label}
    </span>
  );
}

export default async function CarrierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const { id } = await params;
  const p = await prisma.partner.findUnique({
    where: { id },
    include: {
      trucks: { orderBy: { registrationNumber: "asc" } },
      shipments: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!p) notFound();

  const ui = partnerUiStatus(p.status);
  const active = p.shipments.filter((s) => s.status !== "DELIVERED");
  const completed = p.shipments.length - active.length;
  const name = p.companyName ?? p.contactPerson;
  const phoneDigits = p.phone.replace(/\D/g, "");

  const info: { k: string; v: string }[] = [
    { k: "Contact person", v: p.contactPerson },
    { k: "Company", v: p.companyName ?? "—" },
    { k: "Phone", v: p.phone },
    { k: "Email", v: p.email ?? "—" },
    { k: "Truck type", v: p.truckType },
    { k: "Capacity", v: p.truckCapacity ?? "—" },
    { k: "Registration", v: p.registrationNumber },
    { k: "Make / model", v: p.makeModel ?? "—" },
    { k: "Current location", v: p.currentLocation ?? "—" },
    { k: "Routes covered", v: p.routesCovered ?? "—" },
    { k: "Registered", v: fmtDate(p.createdAt) },
    { k: "Last updated", v: fmtRelative(p.updatedAt) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <nav aria-label="Breadcrumb" style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--app-muted)" }}>
        <Link href="/operations/carriers" style={{ textDecoration: "none" }}>Carriers</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.partnerId}</span>
      </nav>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "16px 24px", marginTop: -8 }}>
        <div style={{ marginRight: "auto", minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>{name}</h1>
            <Badge label={ui} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
            {p.partnerId} · {p.truckType} · {active.length} active, {completed} completed
          </p>
        </div>
        <CarrierStatusActions id={p.id} name={name} status={p.status} activeShipments={active.length} />
      </div>

      {p.status === "PENDING" && (
        <p role="note" style={{ margin: 0, padding: "12px 16px", borderRadius: 12, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", fontSize: 14 }}>
          This carrier is awaiting verification. Check their documents and truck before verifying; only verified carriers can be assigned to shipments.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 20, alignItems: "start" }}>
        <section style={card} aria-labelledby="c-details">
          <h2 id="c-details" style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Carrier details</h2>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,180px),1fr))", gap: "18px 24px" }}>
            {info.map((x) => (
              <div key={x.k} style={{ minWidth: 0 }}>
                <dt style={{ fontSize: 12, color: "var(--app-muted)" }}>{x.k}</dt>
                <dd style={{ margin: "3px 0 0", fontSize: 14.5, fontWeight: 500, overflowWrap: "anywhere" }}>{x.v}</dd>
              </div>
            ))}
          </dl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
            <a className="btn btn-secondary" href={`tel:${p.phone.replace(/\s/g, "")}`} style={{ minHeight: 38, borderRadius: 10 }}>
              <i className="ph ph-phone" aria-hidden="true" />
              Call
            </a>
            <a className="btn btn-secondary" href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" style={{ minHeight: 38, borderRadius: 10 }}>
              <i className="ph-duotone ph-whatsapp-logo" aria-hidden="true" style={{ color: "var(--color-accent)" }} />
              WhatsApp
            </a>
            {p.email && (
              <a className="btn btn-secondary" href={`mailto:${p.email}`} style={{ minHeight: 38, borderRadius: 10 }}>
                <i className="ph ph-envelope-simple" aria-hidden="true" />
                Email
              </a>
            )}
          </div>
        </section>

        <section style={card} aria-labelledby="c-trucks">
          <h2 id="c-trucks" style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>Trucks</h2>
          {p.trucks.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>
              {p.status === "VERIFIED"
                ? "No trucks on file."
                : `The registered truck (${p.registrationNumber}) is added to the fleet when the carrier is verified.`}
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th scope="col" style={th}>Registration</th>
                    <th scope="col" style={th}>Type</th>
                    <th scope="col" style={th}>Capacity</th>
                    <th scope="col" style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {p.trucks.map((t) => (
                    <tr key={t.id}>
                      <td style={{ ...td, fontWeight: 600 }}>{t.registrationNumber}</td>
                      <td style={td}>{t.truckType}</td>
                      <td style={td}>{t.capacity ?? "—"}</td>
                      <td style={{ ...td, color: "var(--app-muted)" }}>
                        {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                        {t.verification !== "VERIFIED" ? " · unverified" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ExtraAnswers formId="truck" extra={p.extra} />

      <section style={card} aria-labelledby="c-ship">
        <h2 id="c-ship" style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>Shipments</h2>
        {p.shipments.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No shipments assigned to this carrier yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th scope="col" style={th}>Shipment</th>
                  <th scope="col" style={th}>Route</th>
                  <th scope="col" style={th}>Status</th>
                  <th scope="col" style={th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {p.shipments.map((s) => (
                  <tr key={s.id}>
                    <td style={td}>
                      <Link href={`/operations/shipments/${s.id}`} style={{ fontWeight: 600, color: "var(--color-accent-700)" }}>
                        {s.shipmentId}
                      </Link>
                    </td>
                    <td style={td}>{s.pickupLocation} → {s.deliveryLocation}</td>
                    <td style={td}><Badge label={shipmentUiStatus(s.status)} /></td>
                    <td style={{ ...td, color: "var(--app-muted)", whiteSpace: "nowrap" }}>{fmtDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
