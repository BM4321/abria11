"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

export type QueueRequest = {
  id: string;
  requestId: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: string;
  createdAt: Date;
};

type Props = {
  requests: QueueRequest[];
  statusLabels: Record<string, string>;
  nextStatuses: Record<string, string[]>;
};

export default function RequestQueue({ requests, statusLabels, nextStatuses }: Props) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(id: string, status: string) {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to update request");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error updating request");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="rounded-lg border border-brand-border bg-brand-card overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-border">
        <h2 className="text-lg font-semibold text-brand-text">Request Queue</h2>
      </div>

      {error && (
        <div className="px-5 py-3 border-b border-brand-border bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-muted uppercase tracking-wide text-xs border-b border-brand-border">
              <th className="px-5 py-3">Request ID</th>
              <th className="px-5 py-3">Route</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const next = nextStatuses[r.status] ?? [];
              return (
                <tr key={r.id} className="border-b border-brand-border last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/operations/requests/${r.id}`}
                      className="font-medium text-brand-gold hover:underline"
                    >
                      {r.requestId}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-brand-text">
                    <Link
                      href={`/operations/requests/${r.id}`}
                      className="hover:underline"
                    >
                      {r.pickupLocation} <span className="text-brand-muted">→</span>{" "}
                      {r.deliveryLocation}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-brand-muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    {next.length > 0 ? (
                      <select
                        value=""
                        disabled={updatingId === r.id}
                        onChange={(e) => {
                          if (e.target.value) handleUpdate(r.id, e.target.value);
                        }}
                        className="rounded border border-brand-border bg-brand-black text-brand-text px-2 py-1 text-xs disabled:opacity-50"
                      >
                        <option value="" disabled>
                          {updatingId === r.id ? "Updating…" : "Update status"}
                        </option>
                        {next.map((s) => (
                          <option key={s} value={s}>
                            {statusLabels[s] ?? s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-brand-muted text-xs">No transitions</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-brand-muted">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
