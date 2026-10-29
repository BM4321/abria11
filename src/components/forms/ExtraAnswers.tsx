import { getForm } from "@/lib/forms/store";
import type { FormId } from "@/lib/forms/schema";

// Answers to fields added in Admin > Forms, labelled with the field's current
// label (or its key if the field has since been removed).
export default async function ExtraAnswers({ formId, extra }: { formId: FormId; extra: unknown }) {
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return null;
  const entries = Object.entries(extra as Record<string, unknown>).filter(([, v]) => v !== null && v !== "");
  if (entries.length === 0) return null;
  const def = await getForm(formId);
  const labels = new Map(def.fields.map((f) => [f.key, f.label]));

  return (
    <section aria-labelledby={`xa-${formId}`} style={{ padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
      <h2 id={`xa-${formId}`} style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Additional details</h2>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),1fr))", gap: "16px 24px" }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{ minWidth: 0 }}>
            <dt style={{ fontSize: 12, color: "var(--app-muted)" }}>{labels.get(k) ?? k}</dt>
            <dd style={{ margin: "3px 0 0", fontSize: 14.5, fontWeight: 500, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
              {Array.isArray(v) ? v.join(", ") : String(v)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
