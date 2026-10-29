import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { REQUEST_MANAGER_ROLES } from "@/lib/roles";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { fmtRelative } from "@/lib/console";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const access = await requireRole([...REQUEST_MANAGER_ROLES]);
  if (!access.allowed) redirect(deniedPath(access.reason));

  const notes = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Notifications" subtitle="Activity across requests, quotes, shipments and carriers." />
      <section style={{ background: "var(--app-card)", borderRadius: 16, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {notes.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <i className="ph-duotone ph-bell" aria-hidden="true" style={{ fontSize: 44, color: "var(--app-muted)" }} />
            <p style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600 }}>No notifications yet</p>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
              New activity will appear here.
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {notes.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href ?? "#"}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--app-line)",
                    textDecoration: "none",
                    color: "var(--color-text)",
                    background: n.read ? "transparent" : "color-mix(in srgb,var(--color-accent) 5%,transparent)",
                  }}
                >
                  <i
                    className={`ph-duotone ${n.icon}`}
                    aria-hidden="true"
                    style={{ fontSize: 22, color: "var(--color-accent)", flex: "none", marginTop: 2 }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14.5, fontWeight: n.read ? 400 : 600 }}>
                      {n.title}
                    </span>
                    {n.body && (
                      <span style={{ display: "block", fontSize: 13, color: "var(--app-muted)", marginTop: 2 }}>
                        {n.body}
                      </span>
                    )}
                    <span style={{ display: "block", fontSize: 12, color: "var(--app-muted)", marginTop: 4 }}>
                      {n.category} · {fmtRelative(n.createdAt)}
                    </span>
                  </span>
                  {!n.read && (
                    <span
                      aria-label="Unread"
                      style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent)", flex: "none", marginTop: 8 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
