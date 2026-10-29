"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type PartnerOption = {
  id: string;
  partnerId: string;
  companyName: string | null;
  contactPerson: string;
  truckType: string;
  registrationNumber: string;
};

type Props = {
  requestId: string;
  currentPartnerId: string | null;
  partners: PartnerOption[];
};

export default function PartnerAssignment({
  requestId,
  currentPartnerId,
  partners,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAssign(partnerId: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedPartnerId: partnerId || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to assign partner");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error assigning partner");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-brand-border bg-brand-card p-5">
      <h2 className="mb-3 text-lg font-semibold text-brand-text">Assign Transport Partner</h2>

      {error && (
        <div className="mb-4 rounded-md border border-red-600/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <select
        value={currentPartnerId ?? ""}
        disabled={saving}
        onChange={(e) => handleAssign(e.target.value)}
        className="w-full rounded-md border border-brand-border bg-brand-black px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold disabled:opacity-50"
      >
        <option value="">— Unassigned —</option>
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.partnerId} · {p.companyName ?? p.contactPerson} · {p.truckType} · {p.registrationNumber}
          </option>
        ))}
      </select>
    </div>
  );
}
