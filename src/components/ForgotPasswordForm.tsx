"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/(auth)/forgot-password/actions";

const initialState: ForgotPasswordState = { error: null, sent: false };

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.sent) {
    return (
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          borderRadius: "var(--radius-md)",
          background: "var(--color-accent-100)",
          color: "var(--color-accent-800)",
          padding: "14px",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        <i
          className="ph-duotone ph-envelope-simple"
          aria-hidden="true"
          style={{ fontSize: 20, flex: "none", marginTop: 1 }}
        />
        <div>
          <p style={{ margin: "0 0 2px", fontWeight: 600 }}>Check your inbox</p>
          <p style={{ margin: 0 }}>
            If an account exists for that email, a password reset link has been
            sent. Follow the link to choose a new password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@abria.co.tz"
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
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-muted" style={{ textAlign: "center", margin: 0, fontSize: 14 }}>
        Remembered it?{" "}
        <Link href="/login" style={{ textDecoration: "none" }}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
