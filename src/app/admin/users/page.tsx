import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentOpsUser } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import UserRowControls from "@/components/UserRowControls";
import AddUserForm from "@/components/AddUserForm";
import { ROLE_LABELS } from "@/lib/roles";
import { fmtRelative, initials } from "@/lib/console";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, me] = await Promise.all([
    prisma.opsUser.findMany({ orderBy: { createdAt: "desc" } }),
    getCurrentOpsUser(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Users"
        subtitle="Internal operations staff and administrators."
        actions={
          <Link className="btn btn-secondary" href="/admin/users/roles" style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)" }}>
            <i className="ph ph-shield-check" aria-hidden="true" />
            Roles &amp; Permissions
          </Link>
        }
      />

      <AddUserForm />

      {users.length === 0 ? (
        <section style={{ padding: "48px 24px", textAlign: "center", borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
          <i className="ph-duotone ph-users-three" aria-hidden="true" style={{ fontSize: 44, color: "var(--app-muted)" }} />
          <p style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600 }}>No users yet</p>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
            Add your first user above, or run <code>npm run users:provision</code> to sync
            existing Supabase users.
          </p>
        </section>
      ) : (
        <section style={{ borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 640 }}>
            <thead>
              <tr>
                {["Name", "Role", "Status", "Created", ""].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    style={{
                      textAlign: h === "" ? "right" : "left",
                      padding: "12px 18px",
                      borderBottom: "1px solid var(--app-line)",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--app-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = me?.id === u.id;
                return (
                  <tr key={u.id}>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            flex: "none",
                            display: "grid",
                            placeItems: "center",
                            background: "var(--color-accent-2)",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {initials(u.name)}
                        </span>
                        <span>
                          <span style={{ display: "block", fontWeight: 600 }}>
                            {u.name}
                            {isSelf && <span className="tag tag-accent" style={{ marginLeft: 8 }}>You</span>}
                          </span>
                          <span style={{ display: "block", fontSize: 12, color: "var(--app-muted)" }}>{u.email}</span>
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </td>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "3px 10px 3px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 500,
                          background: u.active
                            ? "color-mix(in srgb,oklch(0.62 0.13 155) 16%,transparent)"
                            : "color-mix(in srgb,var(--color-text) 8%,transparent)",
                          color: u.active
                            ? "color-mix(in srgb,oklch(0.55 0.13 155) 55%,var(--color-text))"
                            : "color-mix(in srgb,var(--color-text) 75%,transparent)",
                        }}
                      >
                        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: u.active ? "oklch(0.62 0.13 155)" : "color-mix(in srgb,var(--color-text) 45%,transparent)" }} />
                        {u.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)", color: "var(--app-muted)", whiteSpace: "nowrap" }}>
                      {fmtRelative(u.createdAt)}
                    </td>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>
                      <UserRowControls id={u.id} role={u.role} active={u.active} isSelf={isSelf} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
