import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const fields = [
    { label: "Site name", value: map["site.name"] ?? "ABRIA Logistics" },
    { label: "Tagline", value: map["site.tagline"] ?? "" },
    { label: "Contact email", value: map["site.email"] ?? "" },
    { label: "Contact phone", value: map["site.phone"] ?? "" },
    { label: "SEO title", value: map["seo.title"] ?? "" },
    { label: "SEO description", value: map["seo.description"] ?? "" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Homepage"
        subtitle="Content shown on the public landing page."
        actions={
          <Link className="btn btn-primary" href="/admin/settings/general" style={{ minHeight: 40, borderRadius: 10 }}>
            <i className="ph ph-pencil-simple" aria-hidden="true" />
            Edit content
          </Link>
        }
      />
      <section
        style={{
          padding: 22,
          borderRadius: 16,
          background: "var(--app-card)",
          boxShadow: "var(--shadow-sm)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
          gap: "18px 20px",
        }}
      >
        {fields.map((f) => (
          <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--app-muted)" }}>{f.label}</span>
            <div
              style={{
                minHeight: 42,
                padding: "10px 12px",
                borderRadius: 10,
                background: "var(--app-page)",
                fontSize: 14,
              }}
            >
              {f.value || "—"}
            </div>
          </div>
        ))}
      </section>
      <p style={{ margin: 0, fontSize: 13, color: "var(--app-muted)" }}>
        Homepage content is edited in General settings and published instantly.
      </p>
    </div>
  );
}
