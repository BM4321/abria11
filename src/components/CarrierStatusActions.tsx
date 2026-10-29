"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Verify / suspend / reject buttons for one carrier. Only verified carriers can
// be assigned to shipments.
export default function CarrierStatusActions({
  id,
  name,
  status,
  activeShipments,
}: {
  id: string;
  name: string;
  status: string;
  activeShipments: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function setStatus(next: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error ?? "The update failed.");
        return;
      }
      router.refresh();
    } catch {
      setErr("Network error. Nothing was changed.");
    } finally {
      setBusy(false);
    }
  }

  const btn: React.CSSProperties = { minHeight: 40, borderRadius: 10 };
  const danger: React.CSSProperties = { ...btn, background: "var(--app-card)", color: "var(--color-accent-2-700)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
        {status !== "VERIFIED" && (
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => setStatus("VERIFIED")} style={btn}>
            <i className="ph ph-seal-check" aria-hidden="true" />
            {status === "PENDING" ? "Verify carrier" : "Reinstate"}
          </button>
        )}
        {status === "PENDING" && (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => setStatus("REJECTED", `Reject ${name}'s registration?`)}
            style={danger}
          >
            <i className="ph ph-x-circle" aria-hidden="true" />
            Reject
          </button>
        )}
        {status === "VERIFIED" && (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={() =>
              setStatus(
                "SUSPENDED",
                activeShipments > 0
                  ? `${name} has ${activeShipments} active shipment(s). Suspending stops new assignments but does not reassign those. Suspend?`
                  : `Suspend ${name}? They can't be assigned to shipments until reinstated.`
              )
            }
            style={danger}
          >
            <i className="ph ph-prohibit" aria-hidden="true" />
            Suspend
          </button>
        )}
      </div>
      {err && (
        <p role="alert" style={{ margin: 0, fontSize: 13.5, color: "var(--color-danger, #b42318)" }}>{err}</p>
      )}
    </div>
  );
}
