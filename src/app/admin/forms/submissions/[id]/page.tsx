import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, deniedPath } from "@/lib/auth";
import { getForm } from "@/lib/forms/store";
import { fmtDate, fmtRelative } from "@/lib/console";
import ActionButton from "@/components/ActionButton";
import { setMessageStatusAction } from "@/app/admin/forms/actions";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { OPEN: "Open", IN_REVIEW: "In review", CLOSED: "Closed" };

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requireRole(["ADMIN"]);
  if (!access.allowed) redirect(access.reason === "FORBIDDEN" ? "/operations/dashboard" : deniedPath(access.reason));

  const { id } = await params;
  const m = await prisma.formSubmission.findUnique({ where: { id } });
  if (!m) notFound();

  const def = await getForm("contact");
  const data = (m.data ?? {}) as Record<string, unknown>;
  const known = def.fields.filter((f) => f.type !== "section" && data[f.key] !== undefined);
  const rest = Object.keys(data).filter((k) => !known.some((f) => f.key === k));
  const rows = [
    ...known.map((f) => ({ k: f.label, v: data[f.key] })),
    ...rest.map((k) => ({ k, v: data[k] })),
  ];
  const digits = (m.phone ?? "").replace(/\D/g, "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "var(--app-muted)" }}>
        <Link href="/admin/forms/submissions" style={{ textDecoration: "none" }}>Submissions</Link> / Message
      </nav>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16, marginTop: -8 }}>
        <div style={{ marginRight: "auto" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Message from {m.name}</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
            {fmtDate(m.createdAt)} · {fmtRelative(m.createdAt)} · {LABEL[m.status] ?? m.status}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {m.status !== "IN_REVIEW" && m.status !== "CLOSED" && (
            <ActionButton action={setMessageStatusAction.bind(null, m.id, "IN_REVIEW")} label="Mark in review" icon="ph-eye" />
          )}
          {m.status !== "CLOSED" ? (
            <ActionButton action={setMessageStatusAction.bind(null, m.id, "CLOSED")} label="Close" icon="ph-check" tone="primary" />
          ) : (
            <ActionButton action={setMessageStatusAction.bind(null, m.id, "OPEN")} label="Reopen" icon="ph-arrow-counter-clockwise" />
          )}
        </div>
      </div>

      <section style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
        <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: "18px 24px" }}>
          {rows.map((r) => (
            <div key={r.k} style={{ minWidth: 0, gridColumn: String(r.v).length > 60 ? "1 / -1" : "auto" }}>
              <dt style={{ fontSize: 12, color: "var(--app-muted)" }}>{r.k}</dt>
              <dd style={{ margin: "3px 0 0", fontSize: 15, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
                {Array.isArray(r.v) ? r.v.join(", ") : String(r.v)}
              </dd>
            </div>
          ))}
        </dl>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
          {m.email && (
            <a className="btn btn-secondary" href={`mailto:${m.email}`} style={{ minHeight: 38, borderRadius: 10 }}>
              <i className="ph ph-envelope-simple" aria-hidden="true" /> Reply by email
            </a>
          )}
          {digits && (
            <a className="btn btn-secondary" href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" style={{ minHeight: 38, borderRadius: 10 }}>
              <i className="ph-duotone ph-whatsapp-logo" aria-hidden="true" /> WhatsApp
            </a>
          )}
          {m.phone && (
            <a className="btn btn-secondary" href={`tel:${m.phone.replace(/\s/g, "")}`} style={{ minHeight: 38, borderRadius: 10 }}>
              <i className="ph ph-phone" aria-hidden="true" /> Call
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
