"use client";

import { useActionState } from "react";
import { setupAction, type SetupState } from "@/app/(auth)/setup/actions";

const initialState: SetupState = { error: null };

export default function SetupForm() {
  const [state, formAction, pending] = useActionState(setupAction, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="field">
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          name="name"
          required
          placeholder="ABRIA Admin"
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="token">Setup token</label>
        <input
          id="token"
          name="token"
          type="password"
          required
          autoComplete="off"
          placeholder="ABRIA_SETUP_TOKEN"
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@abria.co.tz"
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
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
        {pending ? "Creating…" : "Create admin account"}
      </button>
    </form>
  );
}
