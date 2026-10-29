"use client";

import { useTransition } from "react";

export default function ActionButton({
  action,
  label,
  icon,
  tone = "secondary",
  title,
  confirmText,
}: {
  action: () => Promise<void>;
  label: string;
  icon?: string;
  tone?: "secondary" | "primary" | "danger" | "icon";
  title?: string;
  confirmText?: string;
}) {
  const [pending, startTransition] = useTransition();

  const base: React.CSSProperties =
    tone === "icon"
      ? {
          display: "inline-grid",
          placeItems: "center",
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: 0,
          background: "transparent",
          color: "var(--app-muted)",
          cursor: "pointer",
        }
      : {
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          minHeight: 36,
          padding: "0 14px",
          borderRadius: 10,
          fontSize: 13.5,
          fontWeight: 500,
          cursor: "pointer",
          background:
            tone === "primary"
              ? "var(--color-accent)"
              : tone === "danger"
                ? "var(--app-card)"
                : "var(--app-card)",
          color:
            tone === "primary"
              ? "var(--color-bg)"
              : tone === "danger"
                ? "var(--color-accent-2-700)"
                : "var(--color-text)",
          border:
            tone === "primary" ? "1px solid transparent" : "1px solid var(--color-divider)",
        };

  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label}
      disabled={pending}
      onClick={() => {
        if (confirmText && !window.confirm(confirmText)) return;
        startTransition(() => action());
      }}
      style={{ ...base, opacity: pending ? 0.6 : 1 }}
    >
      {icon && <i className={`ph ${tone === "icon" ? "ph-duotone " + icon : icon}`} aria-hidden="true" />}
      {tone !== "icon" && label}
    </button>
  );
}
