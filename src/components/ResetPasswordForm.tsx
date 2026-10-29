"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "@/app/(auth)/reset-password/actions";

const initialState: ResetPasswordState = { error: null };

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="field">
        <label htmlFor="password">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          className="input"
        />
      </div>

      {state.error && (
        <div
          role="alert"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            borderRadius: "var(--radius-md)",
            background: "var(--color-accent-2-100)",
            color: "var(--color-accent-2-800)",
            padding: "10px 12px",
            fontSize: 13.5,
          }}
        >
          <i
            className="ph-duotone ph-x-circle"
            aria-hidden="true"
            style={{ fontSize: 18, flex: "none", marginTop: 1 }}
          />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-block"
        style={{ minHeight: 42, fontSize: 15, marginTop: 4 }}
      >
        {pending ? "Updating…" : "Update password"}
      </button>

      <p className="text-muted" style={{ textAlign: "center", margin: 0, fontSize: 14 }}>
        Link expired?{" "}
        <Link href="/forgot-password" style={{ textDecoration: "none" }}>
          Request a new one
        </Link>
      </p>
    </form>
  );
}
