"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };
type TruckOption = Option & { partnerId: string };

export type ShipmentActionsProps = {
  shipment: {
    id: string;
    shipmentId: string;
    status: string;
    partnerId: string | null;
    truckId: string | null;
    driverName: string | null;
    driverPhone: string | null;
    eta: string | null;
    delayed: boolean;
    delayNote: string | null;
  };
  partners: Option[];
  trucks: TruckOption[];
};

const card: React.CSSProperties = { padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "var(--app-muted)" };
const input: React.CSSProperties = { minHeight: 40, borderRadius: 10, background: "var(--app-page)", width: "100%" };

// What the operator should do next at each stage.
const NEXT: Record<string, { to: string; label: string; help: string } | undefined> = {
  ASSIGNED: { to: "PICKED_UP", label: "Mark picked up", help: "Confirm the carrier has collected the cargo." },
  PICKED_UP: { to: "IN_TRANSIT", label: "Mark in transit", help: "The truck is on the road to the destination." },
  IN_TRANSIT: { to: "OUT_FOR_DELIVERY", label: "Mark out for delivery", help: "The truck has reached the destination area." },
  DELAYED: { to: "OUT_FOR_DELIVERY", label: "Mark out for delivery", help: "The truck has reached the destination area." },
};

export default function ShipmentActions({ shipment, partners, trucks }: ShipmentActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [partnerId, setPartnerId] = useState(shipment.partnerId ?? "");
  const [truckId, setTruckId] = useState(shipment.truckId ?? "");
  const [driverName, setDriverName] = useState(shipment.driverName ?? "");
  const [driverPhone, setDriverPhone] = useState(shipment.driverPhone ?? "");
  const [eta, setEta] = useState(shipment.eta?.slice(0, 10) ?? "");

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [receivedBy, setReceivedBy] = useState("");
  const [podNotes, setPodNotes] = useState("");

  const [delayOpen, setDelayOpen] = useState(false);
  const [delayNote, setDelayNote] = useState(shipment.delayNote ?? "");

  const delivered = shipment.status === "DELIVERED";
  const next = NEXT[shipment.status];
  const canDeliver = ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELAYED"].includes(shipment.status);
  const partnerTrucks = trucks.filter((t) => t.partnerId === partnerId);

  async function act(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/shipments/${shipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error ?? "The update failed.");
        return false;
      }
      setMsg(ok);
      router.refresh();
      return true;
    } catch {
      setErr("Network error. Nothing was changed.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (delivered) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 20 }}>
      <section style={card} aria-labelledby="next-h">
        <h2 id="next-h" style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600 }}>Next step</h2>

        {!shipment.partnerId ? (
          <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>
            Assign a verified carrier (and ideally a driver) in <strong>Assignment</strong> before pickup.
          </p>
        ) : next ? (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--app-muted)" }}>{next.help}</p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => act({ action: "advance", to: next.to }, `Shipment marked ${next.label.replace("Mark ", "")}.`)}
              style={{ minHeight: 42, borderRadius: 10 }}
            >
              <i className="ph ph-arrow-right" aria-hidden="true" />
              {next.label}
            </button>
          </>
        ) : null}

        {canDeliver && (
          <div style={{ marginTop: 14 }}>
            {!deliverOpen ? (
              <button
                type="button"
                className={shipment.status === "OUT_FOR_DELIVERY" ? "btn btn-primary" : "btn btn-secondary"}
                disabled={busy}
                onClick={() => setDeliverOpen(true)}
                style={{ minHeight: 42, borderRadius: 10 }}
              >
                <i className="ph ph-seal-check" aria-hidden="true" />
                Record delivery
              </button>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (await act({ action: "deliver", receivedBy, podNotes }, "Delivery recorded. The request is now at POD received.")) {
                    setDeliverOpen(false);
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 12, background: "var(--app-page)" }}
              >
                <strong style={{ fontSize: 14 }}>Proof of delivery</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor="pod-by" style={label}>Received by (name)</label>
                  <input id="pod-by" className="input" required maxLength={120} value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} style={{ ...input, background: "var(--app-card)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor="pod-notes" style={label}>Notes (condition, signature reference…)</label>
                  <textarea id="pod-notes" className="input" rows={2} maxLength={2000} value={podNotes} onChange={(e) => setPodNotes(e.target.value)} style={{ ...input, background: "var(--app-card)", minHeight: 64, padding: "8px 12px" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary" disabled={busy || !receivedBy.trim()} style={{ minHeight: 40, borderRadius: 10 }}>
                    {busy ? "Saving…" : "Confirm delivery"}
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setDeliverOpen(false)} style={{ minHeight: 40, borderRadius: 10 }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--app-line)" }}>
          {shipment.delayed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13.5 }}>
                <strong>Delayed:</strong> {shipment.delayNote ?? "no reason given"}
              </span>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => act({ action: "delay", delayed: false }, "Delay cleared.")} style={{ minHeight: 34, borderRadius: 10, fontSize: 13 }}>
                Clear delay
              </button>
            </div>
          ) : delayOpen ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (await act({ action: "delay", delayed: true, delayNote }, "Delay reported.")) setDelayOpen(false);
              }}
              style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 200px" }}>
                <label htmlFor="delay-note" style={label}>Delay reason</label>
                <input id="delay-note" className="input" required maxLength={500} value={delayNote} onChange={(e) => setDelayNote(e.target.value)} style={input} />
              </div>
              <button type="submit" className="btn btn-secondary" disabled={busy || !delayNote.trim()} style={{ minHeight: 40, borderRadius: 10 }}>Report</button>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setDelayOpen(false)} style={{ minHeight: 40, borderRadius: 10 }}>Cancel</button>
            </form>
          ) : (
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setDelayOpen(true)} style={{ minHeight: 34, borderRadius: 10, fontSize: 13 }}>
              <i className="ph ph-warning" aria-hidden="true" />
              Report a delay
            </button>
          )}
        </div>

        {(msg || err) && (
          <p role={err ? "alert" : "status"} style={{ margin: "12px 0 0", fontSize: 13.5, color: err ? "var(--color-danger, #b42318)" : "var(--color-success, #067647)" }}>
            {err ?? msg}
          </p>
        )}
      </section>

      <section style={card} aria-labelledby="assign-h">
        <h2 id="assign-h" style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Assignment</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void act(
              { action: "assign", partnerId: partnerId || null, truckId: truckId || null, driverName, driverPhone, eta: eta || null },
              "Assignment saved."
            );
          }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 12 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="as-partner" style={label}>Carrier</label>
            <select
              id="as-partner"
              className="input"
              value={partnerId}
              onChange={(e) => {
                setPartnerId(e.target.value);
                setTruckId("");
              }}
              style={input}
            >
              <option value="">Not assigned</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {partners.length === 0 && (
              <span style={{ fontSize: 12, color: "var(--app-muted)" }}>No verified carriers yet. Verify one under Carriers.</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="as-truck" style={label}>Truck</label>
            <select id="as-truck" className="input" value={truckId} onChange={(e) => setTruckId(e.target.value)} disabled={!partnerId || partnerTrucks.length === 0} style={input}>
              <option value="">{partnerId && partnerTrucks.length === 0 ? "No trucks on file for this carrier" : "Not assigned"}</option>
              {partnerTrucks.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="as-driver" style={label}>Driver name</label>
            <input id="as-driver" className="input" maxLength={120} value={driverName} onChange={(e) => setDriverName(e.target.value)} style={input} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="as-phone" style={label}>Driver phone</label>
            <input id="as-phone" className="input" type="tel" maxLength={32} value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="+255 7XX XXX XXX" style={input} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="as-eta" style={label}>Expected delivery</label>
            <input id="as-eta" className="input" type="date" value={eta} onChange={(e) => setEta(e.target.value)} style={input} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ minHeight: 40, borderRadius: 10, width: "100%" }}>
              {busy ? "Saving…" : "Save assignment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
