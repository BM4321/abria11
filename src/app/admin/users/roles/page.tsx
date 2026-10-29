import Link from "next/link";
import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

const PERMISSIONS: { group: string; rows: { label: string; manager: boolean }[] }[] = [
  {
    group: "Requests",
    rows: [
      { label: "View transport requests", manager: true },
      { label: "Change request status", manager: true },
      { label: "Assign carriers to requests", manager: true },
      { label: "Reject requests", manager: true },
    ],
  },
  {
    group: "Quotes & shipments",
    rows: [
      { label: "Prepare and send quotations", manager: true },
      { label: "Convert requests to shipments", manager: true },
      { label: "Record proof of delivery", manager: true },
    ],
  },
  {
    group: "Network",
    rows: [
      { label: "View carriers and trucks", manager: true },
      { label: "Verify carriers", manager: true },
      { label: "Suspend carriers", manager: false },
    ],
  },
  {
    group: "Website & system",
    rows: [
      { label: "Edit website pages", manager: false },
      { label: "Manage media library", manager: false },
      { label: "Manage users and roles", manager: false },
      { label: "View audit logs", manager: false },
    ],
  },
];

export default async function RolesPage() {
  const users = await prisma.opsUser.findMany();
  const managers = users.filter((u) => u.role === "MANAGER" || u.role === "OPERATIONS").length;
  const admins = users.filter((u) => u.role === "ADMIN").length;

  const roleCards = [
    { name: "Manager", n: managers, desc: "Runs day-to-day operations: requests, quotes, shipments and carriers.", icon: "ph-duotone ph-users", bg: "color-mix(in srgb,var(--color-accent) 14%,transparent)", fg: "var(--color-accent-800)" },
    { name: "Admin", n: admins, desc: "Full access, including the website, users, settings and audit logs.", icon: "ph-duotone ph-shield-check", bg: "color-mix(in srgb,var(--color-accent-2) 13%,transparent)", fg: "var(--color-accent-2-800)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Roles & Permissions"
        subtitle="What each role can do in the ABRIA console."
        actions={
          <Link className="btn btn-secondary" href="/admin/users" style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)" }}>
            <i className="ph ph-users-three" aria-hidden="true" />
            Users
          </Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 16 }}>
        {roleCards.map((r) => (
          <div key={r.name} style={{ display: "flex", gap: 14, padding: 18, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", background: r.bg, color: r.fg }}>
              <i className={r.icon} aria-hidden="true" style={{ fontSize: 22 }} />
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {r.name} <span style={{ fontWeight: 400, fontSize: 13, color: "var(--app-muted)" }}>· {r.n} users</span>
              </div>
              <div style={{ marginTop: 2, fontSize: 13.5, color: "var(--app-muted)" }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <section aria-label="Permission matrix" style={{ borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 460 }}>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: "left", padding: "14px 18px", fontSize: 12, fontWeight: 500, color: "var(--app-muted)", borderBottom: "1px solid var(--app-line)" }}>
                Permission
              </th>
              <th scope="col" style={{ width: 120, padding: 14, fontSize: 12, fontWeight: 500, color: "var(--app-muted)", borderBottom: "1px solid var(--app-line)" }}>
                Manager
              </th>
              <th scope="col" style={{ width: 120, padding: 14, fontSize: 12, fontWeight: 500, color: "var(--app-muted)", borderBottom: "1px solid var(--app-line)" }}>
                Admin
              </th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((g) => (
              <Fragment key={g.group}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={3}
                    style={{ textAlign: "left", padding: "16px 18px 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--app-muted)" }}
                  >
                    {g.group}
                  </th>
                </tr>
                {g.rows.map((p) => (
                  <tr key={p.label}>
                    <th scope="row" style={{ textAlign: "left", padding: "12px 18px", fontWeight: 400, borderBottom: "1px solid var(--app-line)" }}>
                      {p.label}
                    </th>
                    <td style={{ textAlign: "center", padding: 8, borderBottom: "1px solid var(--app-line)" }}>
                      <span
                        title={p.manager ? "Manager: allowed" : "Manager: not allowed"}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          display: "inline-grid",
                          placeItems: "center",
                          background: p.manager ? "var(--color-accent)" : "color-mix(in srgb,var(--color-text) 8%,transparent)",
                          color: p.manager ? "var(--color-bg)" : "var(--app-muted)",
                        }}
                      >
                        <i className={p.manager ? "ph-bold ph-check" : "ph ph-minus"} aria-hidden="true" />
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: 8, borderBottom: "1px solid var(--app-line)" }}>
                      <span
                        title="Admins always have every permission"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          display: "inline-grid",
                          placeItems: "center",
                          background: "color-mix(in srgb,var(--color-accent) 40%,var(--app-card))",
                          color: "var(--color-bg)",
                        }}
                      >
                        <i className="ph-bold ph-check" aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
