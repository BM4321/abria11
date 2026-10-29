"use client";

import { useTransition } from "react";
import { setMediaPlacementAction } from "@/app/admin/actions";
import type { MediaSlot } from "@/lib/media-slots";

export default function MediaPlacementSelect({
  id,
  fileName,
  value,
  slots,
  taken,
}: {
  id: string;
  fileName: string;
  value: string | null;
  slots: MediaSlot[];
  taken: Record<string, string>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={`Where ${fileName} is shown`}
      className="input"
      value={value ?? ""}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => setMediaPlacementAction(id, next));
      }}
      style={{ minHeight: 36, borderRadius: 10, background: "var(--app-page)", maxWidth: 280, fontSize: 13.5 }}
    >
      <option value="">Not shown</option>
      {slots.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
          {taken[s.id] && s.id !== value ? ` (replaces ${taken[s.id]})` : ""}
        </option>
      ))}
    </select>
  );
}
