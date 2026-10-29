"use client";

import { useActionState, useState } from "react";
import {
  cancelLoginAction,
  continueLoginAction,
  loginAction,
  type LoginState,
} from "@/app/(auth)/login/actions";

const initialState: LoginState = { error: null };

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [continueState, continueAction, continuing] = useActionState(
    continueLoginAction,
    initialState
  );
  // The login results whose prompt was cancelled / continued (each new attempt
  // is a new object, so these only ever apply to the attempt they came from).
  const [cancelled, setCancelled] = useState<LoginState | null>(null);
  const [continuedFrom, setContinuedFrom] = useState<LoginState | null>(null);

  const continueFailed = !continuing && Boolean(continueState.error) && continuedFrom === state;
  const conflict = cancelled !== state && !continueFailed ? state.conflict : undefined;
  const error = continueFailed ? continueState.error : state.error;

  if (conflict) {
    const lastActive =
      conflict.lastActiveMinutes < 1
        ? "less than a minute ago"
        : `${conflict.lastActiveMinutes} minute${conflict.lastActiveMinutes === 1 ? "" : "s"} ago`;
    return (
      <div role="alertdialog" aria-labelledby="signed-in-elsewhere" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            borderRadius: "var(--radius-md)",
            background: "var(--color-accent-2-100)",
            color: "var(--color-accent-2-800)",
            padding: "12px 14px",
            fontSize: 13.5,
            lineHeight: 1.5,
          }}
        >
          <i
            className="ph-duotone ph-devices"
            aria-hidden="true"
            style={{ fontSize: 20, flex: "none", marginTop: 1 }}
          />
          <div>
            <p id="signed-in-elsewhere" style={{ margin: "0 0 4px", fontWeight: 600 }}>
              This account is signed in on another device
            </p>
            <p style={{ margin: 0 }}>
              It was last active {lastActive}. If you continue, the other device will be
              signed out and any unsaved work there will be lost.
            </p>
          </div>
        </div>

        <form
          action={(formData) => {
            setContinuedFrom(state);
            continueAction(formData);
          }}
        >
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <button
            type="submit"
            disabled={continuing}
            className="btn btn-primary btn-block"
            style={{ minHeight: 42, fontSize: 15 }}
            autoFocus
          >
            {continuing ? "Signing in…" : "Continue and sign out the other device"}
          </button>
        </form>
        <form
          action={async () => {
            await cancelLoginAction();
            setCancelled(state);
          }}
        >
          <button
            type="submit"
            disabled={continuing}
            className="btn btn-secondary btn-block"
            style={{ minHeight: 42, fontSize: 15 }}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {next ? <input type="hidden" name="next" value={next} /> : null}

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

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="input"
        />
      </div>

      {error && (
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
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-block"
        style={{ minHeight: 42, fontSize: 15, marginTop: 4 }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
