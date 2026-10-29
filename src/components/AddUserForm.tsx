"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUserAction, type CreateUserState } from "@/app/admin/actions";
import { OPS_ROLES, ROLE_LABELS } from "@/lib/roles";

const initialState: CreateUserState = { error: null };

export default function AddUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  // Reset only after a submission actually completes successfully — state is
  // stale inside the submit handler itself (useActionState updates on the
  // following render), so this has to react to the resolved state instead.
  useEffect(() => {
    if (submittedRef.current && !pending && state.error === null) {
      submittedRef.current = false;
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form
      ref={formRef}
      action={(fd) => {
        submittedRef.current = true;
        formAction(fd);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 18,
        borderRadius: 16,
        background: "var(--app-card)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="u-name" style={{ fontSize: 13, fontWeight: 500, color: "var(--app-muted)" }}>
            Full name
          </label>
          <input
            id="u-name"
            name="name"
            className="input"
            required
            placeholder="Jane Doe"
            style={{ minHeight: 42, borderRadius: 10, background: "var(--app-page)" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="u-email" style={{ fontSize: 13, fontWeight: 500, color: "var(--app-muted)" }}>
            Email
          </label>
          <input
            id="u-email"
            name="email"
            type="email"
            className="input"
            required
            autoComplete="off"
            placeholder="jane@abria.co.tz"
            style={{ minHeight: 42, borderRadius: 10, background: "var(--app-page)" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="u-role" style={{ fontSize: 13, fontWeight: 500, color: "var(--app-muted)" }}>
            Role
          </label>
          <select
            id="u-role"
            name="role"
            defaultValue="OPERATIONS"
            className="input"
            style={{ minHeight: 42, borderRadius: 10, background: "var(--app-page)" }}
          >
            {OPS_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r] ?? r}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="u-password" style={{ fontSize: 13, fontWeight: 500, color: "var(--app-muted)" }}>
            Temporary password
          </label>
          <input
            id="u-password"
            name="password"
            type="password"
            className="input"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            style={{ minHeight: 42, borderRadius: 10, background: "var(--app-page)" }}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending} style={{ minHeight: 42, borderRadius: 10 }}>
          <i className="ph ph-plus" aria-hidden="true" />
          {pending ? "Creating…" : "Add user"}
        </button>
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
          <i className="ph-duotone ph-x-circle" aria-hidden="true" style={{ fontSize: 18, flex: "none", marginTop: 1 }} />
          <span>{state.error}</span>
        </div>
      )}
    </form>
  );
}
