"use client";

import { useState, useTransition } from "react";
import { updateUserAction, resetUserPasswordAction } from "@/app/admin/actions";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "DRIVER", label: "Driver" },
];

export default function UserRowControls({
  id,
  role,
  active,
  isSelf,
}: {
  id: string;
  role: string;
  active: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdPending, startPwdTransition] = useTransition();
  const [pwdError, setPwdError] = useState<string | null>(null);

  const submitReset = () => {
    if (pwd.length < 8) {
      setPwdError("Password must be at least 8 characters.");
      return;
    }
    startPwdTransition(async () => {
      const result = await resetUserPasswordAction(id, pwd);
      if (result.error) {
        setPwdError(result.error);
        return;
      }
      setResetting(false);
      setPwd("");
      setPwdError(null);
    });
  };

  if (resetting) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <input
            type="password"
            autoFocus
            placeholder="New password (min 8 chars)"
            value={pwd}
            disabled={pwdPending}
            onChange={(e) => {
              setPwd(e.target.value);
              setPwdError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitReset();
              }
            }}
            style={{
              minHeight: 36,
              width: 200,
              borderRadius: 10,
              border: "1px solid var(--color-divider)",
              background: "var(--app-page)",
              color: "var(--color-text)",
              font: "inherit",
              fontSize: 13.5,
              padding: "0 10px",
            }}
          />
          <button
            type="button"
            disabled={pwdPending}
            onClick={submitReset}
            style={{
              minHeight: 36,
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid var(--color-divider)",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              font: "inherit",
              fontSize: 13.5,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {pwdPending ? "Setting…" : "Set"}
          </button>
          <button
            type="button"
            disabled={pwdPending}
            onClick={() => {
              setResetting(false);
              setPwd("");
              setPwdError(null);
            }}
            style={{
              minHeight: 36,
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid var(--color-divider)",
              background: "var(--app-card)",
              color: "var(--color-text)",
              font: "inherit",
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
        {pwdError && (
          <span style={{ fontSize: 12, color: "var(--color-accent-2-700)" }}>{pwdError}</span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", opacity: pending ? 0.6 : 1 }}>
      <select
        aria-label="Role"
        value={role}
        disabled={pending || isSelf}
        onChange={(e) => startTransition(() => updateUserAction(id, e.target.value, active))}
        style={{
          minHeight: 36,
          borderRadius: 10,
          border: "1px solid var(--color-divider)",
          background: "var(--app-page)",
          color: "var(--color-text)",
          font: "inherit",
          fontSize: 13.5,
          padding: "0 10px",
        }}
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending || isSelf}
        onClick={() => startTransition(() => updateUserAction(id, role, !active))}
        title={isSelf ? "You cannot disable your own account" : active ? "Disable" : "Enable"}
        style={{
          minHeight: 36,
          padding: "0 12px",
          borderRadius: 10,
          border: "1px solid var(--color-divider)",
          background: "var(--app-card)",
          color: active ? "var(--color-accent-2-700)" : "var(--color-accent-700)",
          font: "inherit",
          fontSize: 13.5,
          fontWeight: 500,
          cursor: isSelf ? "not-allowed" : "pointer",
        }}
      >
        {active ? "Disable" : "Enable"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setResetting(true)}
        title="Reset password"
        style={{
          minHeight: 36,
          padding: "0 12px",
          borderRadius: 10,
          border: "1px solid var(--color-divider)",
          background: "var(--app-card)",
          color: "var(--color-text)",
          font: "inherit",
          fontSize: 13.5,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Reset password
      </button>
    </div>
  );
}
