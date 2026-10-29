import Link from "next/link";
import { supabaseSecretKey } from "@/lib/supabase/config";
import { prisma } from "@/lib/prisma";
import { fmtRelative, initials } from "@/lib/console";
import { getCurrentOpsUser } from "@/lib/auth";
import { solutions } from "@/lib/site";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [requests, shipments, partners, quotations, users, pages, media, audit, notifications, me] =
    await Promise.all([
      prisma.request.findMany(),
      prisma.shipment.findMany(),
      prisma.partner.findMany(),
      prisma.quotation.findMany(),
      prisma.opsUser.findMany(),
      prisma.cmsPage.findMany(),
      prisma.mediaAsset.findMany(),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
      getCurrentOpsUser(),
    ]);

  const firstName = (me?.name ?? "Admin").split(" ")[0];

  const newReq = requests.filter((r) => r.status === "NEW_REQUEST").length;
  const activeShip = shipments.filter((s) => s.status !== "DELIVERED").length;
  const pendingQuotes = quotations.filter((q) => !q.sentAt).length;
  const managers = users.filter((u) => u.role === "MANAGER" || u.role === "OPERATIONS").length;
  const admins = users.filter((u) => u.role === "ADMIN").length;
  const publishedPages = pages.filter((p) => p.status === "PUBLISHED").length;

  const card = (
    k: string,
    v: number,
    icon: string,
    href: string,
    tag: "info" | "warn" | "ok" | "muted" | "bad" = "info"
  ) => {
    const colors: Record<string, { bg: string; fg: string }> = {
      info: { bg: "color-mix(in srgb,var(--color-accent) 14%,transparent)", fg: "var(--color-accent-800)" },
      warn: { bg: "color-mix(in srgb,var(--color-process-yellow) 24%,transparent)", fg: "color-mix(in srgb,var(--color-process-yellow) 32%,var(--color-text))" },
      ok: { bg: "color-mix(in srgb,oklch(0.62 0.13 155) 16%,transparent)", fg: "color-mix(in srgb,oklch(0.55 0.13 155) 55%,var(--color-text))" },
      muted: { bg: "color-mix(in srgb,var(--color-text) 8%,transparent)", fg: "color-mix(in srgb,var(--color-text) 75%,transparent)" },
      bad: { bg: "color-mix(in srgb,var(--color-accent-2) 13%,transparent)", fg: "var(--color-accent-2-800)" },
    };
    const c = colors[tag];
    return { k, v, icon, href, bg: c.bg, fg: c.fg };
  };

  const groups = [
    {
      title: "Operations",
      icon: "ph-duotone ph-truck",
      cards: [
        card("Active shipments", activeShip, "ph-duotone ph-package", "/operations/shipments"),
        card("Pending requests", newReq, "ph-duotone ph-clipboard-text", "/operations/requests?status=New", "warn"),
        card("Pending quotes", pendingQuotes, "ph-duotone ph-receipt", "/operations/quotes"),
        card("Registered carriers", partners.length, "ph-duotone ph-truck", "/operations/carriers", "ok"),
      ],
    },
    {
      title: "Website",
      icon: "ph-duotone ph-globe-hemisphere-east",
      cards: [
        card("Published pages", publishedPages, "ph-duotone ph-files", "/admin/website/pages", "ok"),
        card("Media items", media.length, "ph-duotone ph-images", "/admin/website/media"),
        card("Solutions", solutions.length, "ph-duotone ph-stack", "/solutions", "ok"),
        card("Form submissions", requests.length, "ph-duotone ph-tray", "/admin/forms/submissions", "warn"),
      ],
    },
    {
      title: "System",
      icon: "ph-duotone ph-gear",
      cards: [
        card("Managers", managers, "ph-duotone ph-users", "/admin/users"),
        card("Admins", admins, "ph-duotone ph-shield-check", "/admin/users/roles"),
        card("Audit events", audit.length, "ph-duotone ph-scroll", "/admin/audit", "muted"),
        card("Notifications", notifications.length, "ph-duotone ph-bell", "/admin/notifications"),
      ],
    },
  ];

  // Configuration problems that silently disable features. Only whether a
  // setting is present is checked; values are never shown.
  const configAlerts = [
    !process.env.RESEND_API_KEY && {
      title: "Email sending is not configured",
      sub: "Quotation emails can't be sent until RESEND_API_KEY is set. WhatsApp links still work.",
      icon: "ph-duotone ph-envelope-simple-open",
      href: "/admin/settings/integrations",
      tag: "warn",
    },
    !supabaseSecretKey && {
      title: "Supabase secret key is missing",
      sub: "Creating users and uploading media need SUPABASE_SECRET_KEY on the server.",
      icon: "ph-duotone ph-key",
      href: "/admin/users",
      tag: "warn",
    },
    !process.env.NEXT_PUBLIC_SITE_URL && {
      title: "Site URL is not set",
      sub: "Set NEXT_PUBLIC_SITE_URL so password-reset links and SEO use the right domain.",
      icon: "ph-duotone ph-globe-hemisphere-east",
      href: "/admin/settings/general",
      tag: "warn",
    },
  ].filter(Boolean) as { title: string; sub: string; icon: string; href: string; tag: string }[];

  const noticeItems = notifications.map((n) => ({
    title: n.title,
    sub: n.body ?? n.category,
    icon: `ph-duotone ${n.icon}`,
    href: n.href ?? "/admin/audit",
    tag: n.read ? "info" : "warn",
  }));

  const alertItems =
    configAlerts.length + noticeItems.length > 0
      ? [...configAlerts, ...noticeItems]
      : [
          {
            title: "No system alerts",
            sub: "Everything is running normally.",
            icon: "ph-duotone ph-check-circle",
            href: "/admin/audit",
            tag: "info",
          },
        ];

  const quick = [
    { label: "Homepage", icon: "ph-duotone ph-house-line", href: "/admin/website/homepage" },
    { label: "Quote form", icon: "ph-duotone ph-clipboard-text", href: "/admin/forms" },
    { label: "Media library", icon: "ph-duotone ph-images", href: "/admin/website/media" },
    { label: "Settings", icon: "ph-duotone ph-magnifying-glass", href: "/admin/settings/general" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Operations, website and system at a glance."
        actions={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link className="btn btn-secondary" href="/admin/website/homepage" style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)" }}>
              <i className="ph ph-pencil-simple" aria-hidden="true" />
              Edit homepage
            </Link>
            <Link className="btn btn-primary" href="/admin/users" style={{ minHeight: 40, borderRadius: 10 }}>
              <i className="ph ph-user-plus" aria-hidden="true" />
              Invite user
            </Link>
          </div>
        }
      />

      {groups.map((g) => (
        <section key={g.title} aria-label={g.title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className={g.icon} aria-hidden="true" style={{ fontSize: 18, color: "var(--color-accent)" }} />
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--app-muted)" }}>
              {g.title}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 16 }}>
            {g.cards.map((k) => (
              <Link
                key={k.k}
                href={k.href}
                data-ripple="1"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  borderRadius: 16,
                  background: "var(--app-card)",
                  boxShadow: "var(--shadow-sm)",
                  textDecoration: "none",
                  color: "var(--color-text)",
                }}
              >
                <span style={{ width: 44, height: 44, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", background: k.bg, color: k.fg }}>
                  <i className={k.icon} aria-hidden="true" style={{ fontSize: 22 }} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 24, fontWeight: 600, fontFeatureSettings: "'tnum' 1" }}>{k.v}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--app-muted)" }}>{k.k}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <section aria-labelledby="aa-h" style={{ flex: "2 1 520px", minWidth: 0, padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
            <h2 id="aa-h" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Recent administrative activity</h2>
            <Link href="/admin/audit" style={{ fontSize: 14, fontWeight: 500 }}>Audit logs →</Link>
          </div>
          {audit.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>No activity recorded yet.</p>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
              {audit.map((a) => (
                <li key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--app-line)" }}>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: "var(--color-accent-2)", color: "#fff", fontSize: 12, fontWeight: 600 }}>
                    {initials(a.userName)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14 }}>{a.description}</div>
                    <div style={{ fontSize: 12, color: "var(--app-muted)" }}>
                      {a.userName} · {a.resource} · {fmtRelative(a.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <section aria-labelledby="sa-h" style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
            <h2 id="sa-h" style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>System alerts</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {alertItems.map((a) => (
                <li key={a.title}>
                  <Link
                    href={a.href}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: 12,
                      borderRadius: 12,
                      background: "var(--app-page)",
                      textDecoration: "none",
                      color: "var(--color-text)",
                    }}
                  >
                    <i className={a.icon} aria-hidden="true" style={{ fontSize: 20, color: "var(--color-accent)", flex: "none" }} />
                    <span>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 500 }}>{a.title}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "var(--app-muted)" }}>{a.sub}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="qa-h" style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
            <h2 id="qa-h" style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>Quick links</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {quick.map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  data-ripple="1"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 14,
                    borderRadius: 12,
                    background: "var(--app-page)",
                    textDecoration: "none",
                    color: "var(--color-text)",
                    fontSize: 13.5,
                    fontWeight: 500,
                  }}
                >
                  <i className={q.icon} aria-hidden="true" style={{ fontSize: 22, color: "var(--color-accent)" }} />
                  {q.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
