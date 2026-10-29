"use client";

import { useEffect, useState } from "react";

export type OpsUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
};

type Props = {
  users: OpsUser[];
};

export default function UsersManager({ users: initialUsers }: Props) {
  const [users, setUsers] = useState<OpsUser[]>(initialUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "OPERATIONS",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setUsers(data.users ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Failed to load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to create user");
        return;
      }
      setUsers((prev) => [data.user, ...prev]);
      setForm({ email: "", name: "", role: "OPERATIONS", password: "" });
    } catch {
      setError("Network error creating user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-brand-border bg-brand-card overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <h2 className="text-lg font-semibold text-brand-text">Add Operator</h2>
        </div>
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-brand-muted mb-1" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full rounded border border-brand-border bg-brand-black px-3 py-2 text-brand-text placeholder:text-brand-muted focus:border-brand-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-brand-muted mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@abria.co.tz"
                className="w-full rounded border border-brand-border bg-brand-black px-3 py-2 text-brand-text placeholder:text-brand-muted focus:border-brand-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-brand-muted mb-1" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded border border-brand-border bg-brand-black px-3 py-2 text-brand-text focus:border-brand-gold focus:outline-none"
              >
                <option value="OPERATIONS">OPERATIONS</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="DRIVER">DRIVER</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-brand-muted mb-1" htmlFor="password">
                Temporary password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full rounded border border-brand-border bg-brand-black px-3 py-2 text-brand-text placeholder:text-brand-muted focus:border-brand-gold focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-brand-gold px-4 py-2 font-semibold text-brand-black transition disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create user"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-brand-border bg-brand-card overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <h2 className="text-lg font-semibold text-brand-text">
            Operators ({users.length})
          </h2>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-brand-muted">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-muted uppercase tracking-wide text-xs border-b border-brand-border">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-brand-border last:border-0">
                    <td className="px-5 py-3 text-brand-text">{u.name}</td>
                    <td className="px-5 py-3 text-brand-gold">{u.email}</td>
                    <td className="px-5 py-3 text-brand-text">{u.role}</td>
                    <td className="px-5 py-3">
                      {u.active ? (
                        <span className="text-emerald-300">Active</span>
                      ) : (
                        <span className="text-red-300">Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-brand-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-brand-muted">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
