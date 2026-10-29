import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { fmtRelative } from "@/lib/console";
import { FORM_IDS, inputFields, type FormId } from "@/lib/forms/schema";
import { getForm } from "@/lib/forms/store";

export const dynamic = "force-dynamic";

const META: Record<FormId, { desc: string; icon: string; path: string }> = {
  quote: { desc: "Businesses request a transport quotation.", icon: "ph-clipboard-text", path: "/request-transport" },
  truck: { desc: "Carriers register vehicles for verification.", icon: "ph-truck", path: "/register-truck" },
  contact: { desc: "General, transport and partnership enquiries.", icon: "ph-chat-text", path: "/contact" },
};

export default async function FormsPage() {
  const [defs, rows, subs] = await Promise.all([
    Promise.all(FORM_IDS.map((id) => getForm(id))),
    prisma.formDefinition.findMany({ select: { formId: true, updatedAt: true } }),
    Promise.all([prisma.request.count(), prisma.partner.count(), prisma.formSubmission.count({ where: { formId: "contact" } })]),
  ]);
  const updated = new Map(rows.map((r) => [r.formId, r.updatedAt]));
  const subCount: Record<FormId, number> = { quote: subs[0], truck: subs[1], contact: subs[2] };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Forms"
        subtitle="Choose which fields each public form asks, in what order, and which are required."
        actions={
          <Link className="btn btn-secondary" href="/admin/forms/submissions" style={{ minHeight: 40, borderRadius: 10, background: "var(--app-card)" }}>
            <i className="ph ph-tray" aria-hidden="true" />
            Submissions
          </Link>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 16 }}>
        {defs.map((def) => {
          const m = META[def.id];
          const shown = inputFields(def);
          const total = def.fields.filter((f) => f.type !== "section").length;
          const at = updated.get(def.id);
          return (
            <section key={def.id} style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", background: "color-mix(in srgb,var(--color-accent) 14%,transparent)", color: "var(--color-accent-800)" }}>
                  <i className={`ph-duotone ${m.icon}`} aria-hidden="true" style={{ fontSize: 22 }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{def.name}</h2>
                  <div style={{ fontSize: 13, color: "var(--app-muted)" }}>{m.desc}</div>
                </div>
              </div>
              <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px 16px", fontSize: 13.5 }}>
                {[
                  ["Fields", `${shown.length} of ${total} shown`],
                  ["Submissions", String(subCount[def.id])],
                  ["Updated", at ? fmtRelative(at) : "Default"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--app-muted)" }}>{k}</dt>
                    <dd style={{ margin: "2px 0 0" }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <Link className="btn btn-primary" href={`/admin/forms/${def.id}`} style={{ minHeight: 38, borderRadius: 10, fontSize: 13.5 }}>
                  <i className="ph ph-pencil-simple" aria-hidden="true" />
                  Edit form
                </Link>
                <a className="btn btn-secondary" href={m.path} target="_blank" rel="noopener" style={{ minHeight: 38, borderRadius: 10, fontSize: 13.5, background: "var(--app-card)" }}>
                  <i className="ph ph-arrow-square-out" aria-hidden="true" />
                  Open
                </a>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
