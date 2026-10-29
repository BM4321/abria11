"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fmtRelative, fmtTzs } from "@/lib/console";

export type QuoteData = {
  transportCost: number;
  loadingCost: number;
  offloadingCost: number;
  tolls: number;
  fuelSurcharge: number;
  handling: number;
  insurance: number;
  otherCharges: number;
  vat: number;
  total: number;
  validUntil: string | null;
  notes: string | null;
  sentAt: string | null;
  sentTo: string | null;
  updatedAt: string;
};

const LINES: { key: keyof QuoteData; label: string }[] = [
  { key: "transportCost", label: "Transport" },
  { key: "loadingCost", label: "Loading" },
  { key: "offloadingCost", label: "Offloading" },
  { key: "tolls", label: "Tolls" },
  { key: "fuelSurcharge", label: "Fuel surcharge" },
  { key: "handling", label: "Handling" },
  { key: "insurance", label: "Insurance" },
  { key: "otherCharges", label: "Other charges" },
];

const TZ_VAT_RATE = 0.18; // Tanzania standard VAT rate

const card: React.CSSProperties = { padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "var(--app-muted)" };
const input: React.CSSProperties = { minHeight: 40, borderRadius: 10, background: "var(--app-page)", width: "100%" };

export default function QuoteCard({
  requestId,
  requestRef,
  editable,
  customer,
  quotation,
}: {
  requestId: string;
  requestRef: string;
  /** false once the customer has decided (approved/rejected/booked…) */
  editable: boolean;
  customer: { name: string; phone: string; email: string | null };
  quotation: QuoteData | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const editedSinceSent =
    quotation?.sentAt && new Date(quotation.updatedAt).getTime() - new Date(quotation.sentAt).getTime() > 5000;

  async function send() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/quotation/send`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error ?? "The quotation could not be sent.");
        return;
      }
      setMsg(`Quotation emailed to ${data.sentTo}.`);
      setConfirmSend(false);
      router.refresh();
    } catch {
      setErr("Network error. The quotation was not sent.");
    } finally {
      setBusy(false);
    }
  }

  const waText = quotation
    ? `Hello ${customer.name}, this is ABRIA Logistics. Your quotation for request ${requestRef} is ${fmtTzs(
        quotation.total
      )}${quotation.validUntil ? `, valid until ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}` : ""}. The PDF is attached. Reply here to confirm the booking.`
    : "";

  return (
    <section style={card} aria-labelledby="quote-h">
      <h2 id="quote-h" style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>
        Quotation
      </h2>

      {quotation ? (
        <>
          <p style={{ margin: 0, fontSize: 15 }}>
            Total: <strong>{fmtTzs(quotation.total)}</strong>
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--app-muted)" }}>
            {quotation.sentAt
              ? `Emailed ${fmtRelative(quotation.sentAt)}${quotation.sentTo ? ` to ${quotation.sentTo}` : ""}`
              : "Draft, not sent yet"}
            {editedSinceSent && " · edited since it was sent"}
          </p>
          {quotation.validUntil && (
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--app-muted)" }}>
              Valid until {new Date(quotation.validUntil).toLocaleDateString("en-GB")}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            {editable && (
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)} disabled={busy} style={{ minHeight: 40, borderRadius: 10 }}>
                <i className="ph ph-pencil-simple" aria-hidden="true" />
                Edit quotation
              </button>
            )}
            <a className="btn btn-secondary" href={`/api/requests/${requestId}/quotation/pdf`} style={{ minHeight: 40, borderRadius: 10 }}>
              <i className="ph ph-file-pdf" aria-hidden="true" />
              Download PDF
            </a>

            {editable &&
              (customer.email ? (
                confirmSend ? (
                  <div role="group" aria-label="Confirm sending" style={{ padding: 12, borderRadius: 10, background: "var(--app-page)" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 13.5 }}>
                      Email this quotation ({fmtTzs(quotation.total)}) with the PDF attached to <strong>{customer.email}</strong>?
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="btn btn-primary" onClick={send} disabled={busy} style={{ minHeight: 38, borderRadius: 10, flex: 1 }}>
                        {busy ? "Sending…" : "Send email"}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setConfirmSend(false)} disabled={busy} style={{ minHeight: 38, borderRadius: 10 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => setConfirmSend(true)} disabled={busy || quotation.total <= 0} style={{ minHeight: 40, borderRadius: 10 }}>
                    <i className="ph ph-paper-plane-tilt" aria-hidden="true" />
                    {quotation.sentAt ? "Resend to customer" : "Email to customer"}
                  </button>
                )
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "var(--app-muted)" }}>
                  No customer email on this request. Download the PDF and send it by WhatsApp.
                </p>
              ))}

            <a
              className="btn btn-secondary"
              href={`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noreferrer"
              style={{ minHeight: 40, borderRadius: 10 }}
            >
              <i className="ph-duotone ph-whatsapp-logo" aria-hidden="true" style={{ color: "var(--color-accent)" }} />
              Share on WhatsApp
            </a>
          </div>
        </>
      ) : editable ? (
        <>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--app-muted)" }}>No quotation prepared yet.</p>
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)} style={{ width: "100%", minHeight: 40, borderRadius: 10 }}>
            <i className="ph ph-plus" aria-hidden="true" />
            Create quotation
          </button>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No quotation was prepared for this request.</p>
      )}

      {(msg || err) && (
        <p role={err ? "alert" : "status"} style={{ margin: "12px 0 0", fontSize: 13.5, color: err ? "var(--color-danger, #b42318)" : "var(--color-success, #067647)" }}>
          {err ?? msg}
        </p>
      )}

      {open && (
        <QuoteEditor
          requestId={requestId}
          requestRef={requestRef}
          initial={quotation}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            setErr(null);
            setMsg("Quotation saved.");
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

function QuoteEditor({
  requestId,
  requestRef,
  initial,
  onClose,
  onSaved,
}: {
  requestId: string;
  requestRef: string;
  initial: QuoteData | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(LINES.map((l) => [l.key, initial && initial[l.key] ? String(initial[l.key]) : ""]))
  );
  const [vat, setVat] = useState(initial?.vat ? String(initial.vat) : "");
  const [validUntil, setValidUntil] = useState(initial?.validUntil?.slice(0, 10) ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const amount = (s: string) => {
    const n = Number(s.replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };
  const subtotal = LINES.reduce((sum, l) => sum + (amount(values[l.key] || "0") || 0), 0);
  const total = subtotal + (amount(vat || "0") || 0);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const bad = [...LINES.map((l) => [l.label, values[l.key]]), ["VAT", vat]].find(
      ([, v]) => v && (Number.isNaN(amount(v)) || amount(v) < 0)
    );
    if (bad) {
      setErr(`${bad[0]} must be a positive number.`);
      return;
    }
    if (subtotal <= 0) {
      setErr("Enter at least one charge.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const body: Record<string, unknown> = Object.fromEntries(LINES.map((l) => [l.key, amount(values[l.key] || "0")]));
      body.vat = amount(vat || "0");
      body.validUntil = validUntil || null;
      body.notes = notes.trim() || null;
      const res = await fetch(`/api/requests/${requestId}/quotation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error ?? "The quotation could not be saved.");
        return;
      }
      onSaved();
    } catch {
      setErr("Network error. The quotation was not saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "color-mix(in srgb, #000 45%, transparent)",
        overflowY: "auto",
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="qe-h"
        onSubmit={save}
        style={{
          width: "min(640px, 100%)",
          padding: "clamp(18px,3vw,26px)",
          borderRadius: 16,
          background: "var(--app-card)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <h2 id="qe-h" style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {initial ? "Edit" : "Create"} quotation for {requestRef}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--app-muted)" }}>Amounts in TZS. Leave unused charges empty.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,170px),1fr))", gap: 12 }}>
          {LINES.map((l, i) => (
            <div key={l.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor={`qe-${l.key}`} style={label}>{l.label}</label>
              <input
                ref={i === 0 ? firstRef : undefined}
                id={`qe-${l.key}`}
                className="input"
                inputMode="decimal"
                placeholder="0"
                value={values[l.key]}
                onChange={(e) => setValues((v) => ({ ...v, [l.key]: e.target.value }))}
                style={input}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 12, alignItems: "end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="qe-vat" style={label}>VAT</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input id="qe-vat" className="input" inputMode="decimal" placeholder="0" value={vat} onChange={(e) => setVat(e.target.value)} style={input} />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setVat(String(Math.round(subtotal * TZ_VAT_RATE)))}
                style={{ minHeight: 40, borderRadius: 10, whiteSpace: "nowrap" }}
              >
                18%
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="qe-valid" style={label}>Valid until</label>
            <input id="qe-valid" type="date" className="input" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} style={input} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="qe-notes" style={label}>Notes for the customer</label>
          <textarea
            id="qe-notes"
            className="input"
            rows={3}
            maxLength={5000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, what's included, conditions…"
            style={{ ...input, minHeight: 80, padding: "10px 12px", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 14px", borderRadius: 10, background: "var(--app-page)", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--app-muted)" }}>Subtotal {fmtTzs(subtotal)} · VAT {fmtTzs(amount(vat || "0") || 0)}</span>
          <strong style={{ fontSize: 17 }}>Total {fmtTzs(total)}</strong>
        </div>

        {err && (
          <p role="alert" style={{ margin: 0, fontSize: 13.5, color: "var(--color-danger, #b42318)" }}>{err}</p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving} style={{ minHeight: 40, borderRadius: 10 }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ minHeight: 40, borderRadius: 10 }}>
            {saving ? "Saving…" : "Save quotation"}
          </button>
        </div>
      </form>
    </div>
  );
}
