"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type PartnerRow = {
  id: string;
  partnerId: string;
  companyName: string | null;
  contactPerson: string;
  phone: string;
  email: string | null;
  truckType: string;
  truckCapacity: string | null;
  registrationNumber: string;
  makeModel: string | null;
  currentLocation: string | null;
  routesCovered: string | null;
  status: string;
  createdAt: Date;
};

const STATUSES = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  VERIFIED: "bg-green-500/20 text-green-300 border-green-500/40",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/40",
  SUSPENDED: "bg-red-500/20 text-red-300 border-red-500/40",
};

export default function PartnersManager({ partners }: { partners: PartnerRow[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatus(id: string, status: string) {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to update partner");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error updating partner");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-brand-border bg-brand-card">
      <div className="border-b border-brand-border px-5 py-4">
        <h2 className="text-lg font-semibold">Partner Registrations</h2>
      </div>

      {error && (
        <div className="border-b border-brand-border bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-left text-xs uppercase tracking-wide text-brand-muted">
              <th className="px-5 py-3">Partner ID</th>
              <th className="px-5 py-3">Company / Contact</th>
              <th className="px-5 py-3">Truck</th>
              <th className="px-5 py-3">Reg No.</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-brand-border last:border-0">
                <td className="px-5 py-3 font-medium text-brand-gold">{p.partnerId}</td>
                <td className="px-5 py-3">
                  <div className="font-medium text-brand-text">
                    {p.companyName ?? p.contactPerson}
                  </div>
                  <div className="text-xs text-brand-muted">{p.phone}</div>
                  {p.email && <div className="text-xs text-brand-muted">{p.email}</div>}
                </td>
                <td className="px-5 py-3 text-brand-text">
                  <div>{p.truckType}</div>
                  {(p.makeModel || p.truckCapacity) && (
                    <div className="text-xs text-brand-muted">
                      {[p.makeModel, p.truckCapacity].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-brand-text">{p.registrationNumber}</td>
                <td className="px-5 py-3 text-brand-muted">
                  <div>{p.currentLocation ?? "—"}</div>
                  {p.routesCovered && (
                    <div className="text-xs text-brand-muted">{p.routesCovered}</div>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[p.status] ?? "bg-brand-card text-brand-muted border-brand-border"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <select
                    aria-label={`Change status for ${p.partnerId}`}
                    value=""
                    disabled={updatingId === p.id}
                    onChange={(e) => {
                      if (e.target.value) handleStatus(p.id, e.target.value);
                    }}
                    className="rounded border border-brand-border bg-brand-black px-2 py-1 text-xs text-brand-text disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {updatingId === p.id ? "Updating…" : "Set status"}
                    </option>
                    {STATUSES.filter((s) => s !== p.status).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-brand-muted">
                  No partner registrations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
