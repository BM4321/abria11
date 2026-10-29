"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  requestId: string;
  currentStatus: string;
  nextStatuses: string[];
  statusLabels: Record<string, string>;
};

export default function RequestStatusUpdate({
  requestId,
  currentStatus,
  nextStatuses,
  statusLabels,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(status: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
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
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-brand-border bg-brand-card p-5">
      <h2 className="mb-3 text-lg font-semibold text-brand-text">Update Status</h2>
      <p className="mb-4 text-sm text-brand-muted">
        Current status:{" "}
        <span className="font-medium text-brand-gold">
          {statusLabels[currentStatus] ?? currentStatus}
        </span>
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-red-600/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {nextStatuses.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              disabled={loading}
              onClick={() => handleUpdate(status)}
              className="rounded-md bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-black transition hover:opacity-90 disabled:opacity-50"
            >
              {statusLabels[status] ?? status}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-brand-muted">No further status transitions.</p>
      )}
    </div>
  );
}
