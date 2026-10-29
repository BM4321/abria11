import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { fmtRelative } from "@/lib/console";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const notes = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Notifications" subtitle="System and operational notifications." />
      <section style={{ background: "var(--app-card)", borderRadius: 16, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {notes.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <i className="ph-duotone ph-bell" aria-hidden="true" style={{ fontSize: 44, color: "var(--app-muted)" }} />
            <p style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600 }}>No notifications yet</p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {notes.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href ?? "/admin/audit"}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--app-line)",
                    textDecoration: "none",
                    color: "var(--color-text)",
                  }}
                >
                  <i className={`ph-duotone ${n.icon}`} aria-hidden="true" style={{ fontSize: 22, color: "var(--color-accent)", flex: "none", marginTop: 2 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14.5, fontWeight: n.read ? 400 : 600 }}>{n.title}</span>
                    {n.body && <span style={{ display: "block", fontSize: 13, color: "var(--app-muted)", marginTop: 2 }}>{n.body}</span>}
                    <span style={{ display: "block", fontSize: 12, color: "var(--app-muted)", marginTop: 4 }}>
                      {n.category} · {fmtRelative(n.createdAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
