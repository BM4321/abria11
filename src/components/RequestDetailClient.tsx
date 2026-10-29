"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fmtRelative, requestUiStatus, tone } from "@/lib/console";
import QuoteCard, { type QuoteData } from "@/components/QuoteCard";

type Note = { id: string; authorName: string; text: string; createdAt: string };
type History = {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedByName: string | null;
  changedAt: string;
};

// Statuses the generic "Update status" buttons must not set directly: booking
// goes through "Convert to shipment" (which creates the shipment), and once a
// shipment exists its page drives the delivery stages.
const BOOKED_VIA_CONVERT = "BOOKED";
const SHIPMENT_DRIVEN = [
  "VEHICLE_ASSIGNED",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_DESTINATION",
  "DELIVERED",
  "POD_RECEIVED",
];

export default function RequestDetailClient({
  requestId,
  requestRef,
  currentStatus,
  flow,
  nextStatuses,
  nextLabels,
  notes: initialNotes,
  history,
  partners,
  currentPartnerId,
  customer,
  quotation,
  quoteEditable,
  shipment,
}: {
  requestId: string;
  requestRef: string;
  currentStatus: string;
  flow: string[];
  nextStatuses: string[];
  nextLabels: Record<string, string>;
  notes: Note[];
  history: History[];
  partners: {
    id: string;
    partnerId: string;
    companyName: string | null;
    contactPerson: string;
    truckType: string;
    registrationNumber: string;
  }[];
  currentPartnerId: string | null;
  customer: {
    name: string;
    company: string | null;
    phone: string;
    email: string | null;
    region: string;
  };
  quotation: QuoteData | null;
  quoteEditable: boolean;
  shipment: { id: string; shipmentId: string } | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [pick, setPick] = useState(currentPartnerId ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const uiStatus = requestUiStatus(currentStatus);
  const st = tone(uiStatus);
  const rejected = uiStatus === "Rejected";
  const idx = rejected ? 1 : flow.indexOf(uiStatus);
  const terminal = ["REJECTED", "CANCELLED", "COMPLETED"].includes(currentStatus);
  const statusButtons = nextStatuses.filter(
    (s) => s !== BOOKED_VIA_CONVERT && !(shipment && SHIPMENT_DRIVEN.includes(s))
  );
  const canCancel = nextStatuses.includes("CANCELLED");

  const update = async (payload: Record<string, unknown>, okMsg: string) => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error ?? "Update failed");
        return false;
      }
      setMsg(okMsg);
      router.refresh();
      return true;
    } catch {
      setErr("Network error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes((n) => [data, ...n]);
        setDraft("");
      } else {
        setErr(data?.error ?? "Could not add note");
      }
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  const convert = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/convert`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error ?? "Conversion failed");
        return;
      }
      setMsg(`Converted to shipment ${data.shipmentId}`);
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  const confirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await update({ assignedPartnerId: pick || null }, "Carrier assigned");
    if (ok) setAssignOpen(false);
  };

  const allLog = [
    {
      text: `Request received from ${customer.name}`,
      by: "Website",
      when: fmtRelative(history[history.length - 1]?.changedAt ?? new Date().toISOString()),
    },
    ...history.map((h) => ({
      text: `Moved from ${nextLabels[h.fromStatus] ?? h.fromStatus} to ${nextLabels[h.toStatus] ?? h.toStatus}`,
      by: h.changedByName ?? "ABRIA Team",
      when: fmtRelative(h.changedAt),
    })),
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--app-muted)" }}>
        <Link href="/operations/requests" style={{ textDecoration: "none" }}>
          Requests
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{requestRef}</span>
      </nav>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "16px 24px", marginTop: -8 }}>
        <div style={{ marginRight: "auto", minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>
              Request {requestRef}
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
              {uiStatus}
            </span>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
            {customer.company ?? customer.name} · {customer.region}
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setAssignOpen(true)}
            disabled={terminal || !!shipment || busy}
            title={shipment ? "The carrier is managed on the shipment now" : undefined}
            style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)" }}
          >
            <i className="ph ph-truck" aria-hidden="true" />
            Assign carrier
          </button>
          {shipment ? (
            <Link
              className="btn btn-primary"
              href={`/operations/shipments/${shipment.id}`}
              style={{ minHeight: 40, borderRadius: 10 }}
            >
              <i className="ph ph-package" aria-hidden="true" />
              View shipment {shipment.shipmentId}
            </Link>
          ) : (
            <button
              type="button"
              className={currentStatus === "APPROVED" ? "btn btn-primary" : "btn btn-secondary"}
              onClick={convert}
              disabled={terminal || busy}
              title={currentStatus === "APPROVED" ? undefined : "Normally done once the customer has approved the quote"}
              style={{ minHeight: 40, borderRadius: 10, ...(currentStatus === "APPROVED" ? {} : { background: "var(--app-card)" }) }}
            >
              <i className="ph ph-arrow-square-out" aria-hidden="true" />
              Convert to shipment
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (window.confirm(`Cancel request ${requestRef}? This cannot be undone.`)) {
                  void update({ status: "CANCELLED" }, "Request cancelled");
                }
              }}
              disabled={busy}
              style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)", color: "var(--color-accent-2-700)" }}
            >
              <i className="ph ph-x-circle" aria-hidden="true" />
              Cancel request
            </button>
          )}
        </div>
      </div>

      {(msg || err) && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 14,
            background: err ? "var(--color-accent-2-100)" : "color-mix(in srgb,var(--color-accent) 12%,transparent)",
            color: err ? "var(--color-accent-2-800)" : "var(--color-accent-800)",
          }}
        >
          {err ?? msg}
        </div>
      )}

      <ol
        aria-label="Request progress"
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
        {(rejected ? ["New", "Reviewing", "Rejected"] : flow).map((s, i, arr) => {
          const done = i < idx || (!rejected && uiStatus === "Confirmed");
          const cur = i === idx && uiStatus !== "Confirmed";
          const bad = rejected && s === "Rejected";
          return (
            <li key={s} style={{ flex: "1 1 120px", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
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
                  background: bad ? "var(--color-accent-2)" : done ? "var(--color-accent)" : cur ? "var(--app-card)" : "var(--app-page)",
                  color: bad || done ? "var(--color-bg)" : cur ? "var(--color-accent-700)" : "var(--app-muted)",
                  boxShadow: cur ? "inset 0 0 0 2px var(--color-accent)" : "none",
                }}
              >
                <i
                  className={bad ? "ph ph-x" : done ? "ph ph-check" : cur ? "ph-fill ph-circle" : "ph ph-circle"}
                  aria-hidden="true"
                />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: cur || bad ? 600 : 400, whiteSpace: "nowrap" }}>{s}</span>
              <span
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 2,
                  minWidth: 16,
                  margin: "0 8px",
                  borderRadius: 2,
                  background: i === arr.length - 1 ? "transparent" : done ? "var(--color-accent)" : "var(--app-line)",
                }}
              />
            </li>
          );
        })}
      </ol>

      {shipment && !terminal && nextStatuses.some((s) => SHIPMENT_DRIVEN.includes(s)) && (
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--app-muted)" }}>
          Pickup and delivery progress is updated on{" "}
          <Link href={`/operations/shipments/${shipment.id}`}>shipment {shipment.shipmentId}</Link>.
        </p>
      )}

      {statusButtons.filter((s) => s !== "CANCELLED").length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderRadius: 16,
            background: "var(--app-card)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, marginRight: 4 }}>Update status</span>
          {statusButtons.filter((s) => s !== "CANCELLED").map((s) => (
            <button
              key={s}
              type="button"
              className={s === "REJECTED" || s === "CANCELLED" ? "btn btn-secondary" : "btn btn-primary"}
              disabled={busy}
              onClick={() => update({ status: s }, `Status updated to ${nextLabels[s] ?? s}`)}
              style={{
                minHeight: 36,
                borderRadius: 10,
                fontSize: 13,
                ...(s === "REJECTED" || s === "CANCELLED"
                  ? { background: "var(--app-card)", color: "var(--color-accent-2-700)" }
                  : {}),
              }}
            >
              {nextLabels[s] ?? s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: "2 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <section style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Internal notes</h2>
            <form onSubmit={addNote} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="note-in" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Add an internal note
              </label>
              <textarea
                id="note-in"
                className="input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a note for the team…"
                style={{ minHeight: 76, borderRadius: 12, background: "var(--app-page)", fontSize: 14 }}
              />
              <div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!draft.trim() || busy}
                  style={{ minHeight: 38, borderRadius: 10 }}
                >
                  Add note
                </button>
              </div>
            </form>
            {notes.length > 0 && (
              <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {notes.map((n) => (
                  <li key={n.id} style={{ display: "flex", gap: 10 }}>
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        flex: "none",
                        display: "grid",
                        placeItems: "center",
                        background: "var(--color-accent-2)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {n.authorName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </span>
                    <div style={{ flex: 1, padding: "10px 12px", borderRadius: 12, background: "var(--app-page)" }}>
                      <div style={{ fontSize: 12, color: "var(--app-muted)" }}>
                        <strong style={{ fontWeight: 600, color: "var(--color-text)" }}>{n.authorName}</strong> · {fmtRelative(n.createdAt)}
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.5 }}>{n.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <section style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Customer</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "color-mix(in srgb,var(--color-accent) 16%,transparent)",
                  color: "var(--color-accent-800)",
                  fontWeight: 600,
                }}
              >
                {customer.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </span>
              <div>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{customer.name}</span>
                <div style={{ fontSize: 13, color: "var(--app-muted)" }}>{customer.company ?? "—"}</div>
              </div>
            </div>
            <dl style={{ margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <dt>
                  <i className="ph-duotone ph-phone" aria-label="Phone" style={{ fontSize: 18, color: "var(--app-muted)" }} />
                </dt>
                <dd style={{ margin: 0 }}>
                  <a href={`tel:${customer.phone.replace(/\s/g, "")}`}>{customer.phone}</a>
                </dd>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <dt>
                  <i className="ph-duotone ph-envelope-simple" aria-label="Email" style={{ fontSize: 18, color: "var(--app-muted)" }} />
                </dt>
                <dd style={{ margin: 0, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {customer.email ? <a href={`mailto:${customer.email}`}>{customer.email}</a> : "—"}
                </dd>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <dt>
                  <i className="ph-duotone ph-map-pin" aria-label="Region" style={{ fontSize: 18, color: "var(--app-muted)" }} />
                </dt>
                <dd style={{ margin: 0 }}>{customer.region}</dd>
              </div>
            </dl>
            <a
              className="btn btn-secondary"
              href={`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hello ${customer.name.split(" ")[0]}, this is ABRIA about your request ${requestRef}.`
              )}`}
              target="_blank"
              rel="noopener"
              style={{ marginTop: 16, width: "100%", minHeight: 40, borderRadius: 10 }}
            >
              <i className="ph-duotone ph-whatsapp-logo" aria-hidden="true" style={{ color: "var(--color-accent)" }} />
              Message on WhatsApp
            </a>
          </section>

          <QuoteCard
            requestId={requestId}
            requestRef={requestRef}
            editable={quoteEditable}
            customer={{ name: customer.name, phone: customer.phone, email: customer.email }}
            quotation={quotation}
          />

          <section style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Activity</h2>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {allLog.reverse().map((a, i, arr) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr)", gap: 10 }}>
                  <span style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: 18,
                        bottom: 0,
                        width: 2,
                        background: i === arr.length - 1 ? "transparent" : "var(--app-line)",
                      }}
                    />
                    <span
                      style={{
                        marginTop: 4,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: i === 0 ? "var(--color-accent)" : "color-mix(in srgb,var(--color-text) 30%,transparent)",
                        boxShadow: "0 0 0 3px var(--app-card)",
                        position: "relative",
                      }}
                    />
                  </span>
                  <div style={{ paddingBottom: 16 }}>
                    <div style={{ fontSize: 14 }}>{a.text}</div>
                    <div style={{ fontSize: 12, color: "var(--app-muted)" }}>
                      {a.when} · {a.by}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {assignOpen && (
        <div
          className="dialog-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAssignOpen(false);
          }}
          style={{ zIndex: 2400, animation: "abria-fade .16s ease" }}
        >
          <form
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="as-h"
            onSubmit={confirmAssign}
            style={{ width: "min(520px,100%)", background: "var(--app-card)", borderRadius: 16, padding: 24 }}
          >
            <h2 id="as-h" style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Assign a carrier to {requestRef}
            </h2>
            <fieldset style={{ border: 0, margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              <legend style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Carrier and truck
              </legend>
              {partners.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>
                  No verified carriers are available yet.
                </p>
              ) : (
                partners.map((p) => {
                  const onP = pick === p.id;
                  return (
                    <label
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        borderRadius: 12,
                        cursor: "pointer",
                        background: onP
                          ? "color-mix(in srgb,var(--color-accent) 10%,transparent)"
                          : "var(--app-page)",
                        outline: onP ? "2px solid var(--color-accent)" : "none",
                      }}
                    >
                      <input
                        type="radio"
                        name="partner"
                        value={p.id}
                        checked={onP}
                        onChange={() => setPick(p.id)}
                        style={{ accentColor: "var(--color-accent)", width: 18, height: 18 }}
                      />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontWeight: 600, fontSize: 14 }}>
                          {p.companyName ?? p.contactPerson}
                        </span>
                        <span style={{ display: "block", fontSize: 12.5, color: "var(--app-muted)" }}>
                          {p.truckType} · {p.registrationNumber}
                        </span>
                      </span>
                    </label>
                  );
                })
              )}
            </fieldset>
            <div className="dialog-actions" style={{ marginTop: 20 }}>
              <button type="button" onClick={() => setAssignOpen(false)} className="btn btn-secondary" style={{ minHeight: 40, borderRadius: 10 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!pick || busy} style={{ minHeight: 40, borderRadius: 10 }}>
                Assign carrier
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
