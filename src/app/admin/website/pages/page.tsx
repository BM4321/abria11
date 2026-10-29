import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import ActionButton from "@/components/ActionButton";
import { togglePageStatusAction } from "@/app/admin/actions";
import { fmtRelative } from "@/lib/console";

export const dynamic = "force-dynamic";

export default async function WebsitePagesPage() {
  const pages = await prisma.cmsPage.findMany({ orderBy: { title: "asc" } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Pages"
        subtitle="Public website pages and their publish state."
        actions={
          <Link className="btn btn-secondary" href="/admin/website/homepage" style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)" }}>
            <i className="ph ph-house-line" aria-hidden="true" />
            Homepage
          </Link>
        }
      />

      {pages.length === 0 ? (
        <section style={{ padding: "48px 24px", textAlign: "center", borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
          <i className="ph-duotone ph-files" aria-hidden="true" style={{ fontSize: 44, color: "var(--app-muted)" }} />
          <p style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600 }}>No pages yet</p>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
            Run <code>npm run seed:admin</code> to register the website pages.
          </p>
        </section>
      ) : (
        <section style={{ borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["Page", "URL", "Status", "Updated", ""].map((h) => (
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
              {pages.map((p) => {
                const published = p.status === "PUBLISHED";
                return (
                  <tr key={p.slug}>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>
                      <div style={{ fontWeight: 600 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "var(--app-muted)" }}>{p.slug}</div>
                    </td>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>
                      <a href={p.url} style={{ color: "var(--color-accent-700)" }}>{p.url}</a>
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
                          background: published
                            ? "color-mix(in srgb,oklch(0.62 0.13 155) 16%,transparent)"
                            : "color-mix(in srgb,var(--color-text) 8%,transparent)",
                          color: published
                            ? "color-mix(in srgb,oklch(0.55 0.13 155) 55%,var(--color-text))"
                            : "color-mix(in srgb,var(--color-text) 75%,transparent)",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: published ? "oklch(0.62 0.13 155)" : "color-mix(in srgb,var(--color-text) 45%,transparent)",
                          }}
                        />
                        {published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)", color: "var(--app-muted)", whiteSpace: "nowrap" }}>
                      {fmtRelative(p.updatedAt)}
                    </td>
                    <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)", textAlign: "right", whiteSpace: "nowrap" }}>
                      <ActionButton
                        action={togglePageStatusAction.bind(null, p.slug)}
                        label={published ? "Unpublish" : "Publish"}
                        icon={published ? "ph-eye-slash" : "ph-check"}
                        tone="secondary"
                      />
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
