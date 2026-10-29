"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { publishFormAction } from "@/app/admin/forms/actions";
import FormFields from "@/components/forms/FormFields";
import {
  CORE,
  FIELD_TYPES,
  OPTION_TYPES,
  definitionProblems,
  validateSubmission,
  type FieldType,
  type FormDef,
  type FormField,
  type SubmissionValue,
  type SubmissionValues,
} from "@/lib/forms/schema";

const card: React.CSSProperties = { padding: 20, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" };
const lab: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "var(--app-muted)" };
const inp: React.CSSProperties = { minHeight: 40, borderRadius: 10, background: "var(--app-page)", width: "100%" };
const typeMeta = (t: FieldType) => FIELD_TYPES.find((x) => x.id === t)!;

export default function FormBuilder({ def }: { def: FormDef }) {
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>(def.fields);
  const [sel, setSel] = useState<number>(-1);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<{ error: string; problems?: string[] } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [drag, setDrag] = useState(-1);
  const [over, setOver] = useState(-1);
  const core = CORE[def.id];

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const change = (next: FormField[]) => {
    setFields(next);
    setDirty(true);
    setMsg(null);
  };
  const upd = (i: number, patch: Partial<FormField>) => change(fields.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const move = (a: number, b: number) => {
    if (b < 0 || b >= fields.length || a === b) return;
    const n = fields.slice();
    const [x] = n.splice(a, 1);
    n.splice(b, 0, x);
    change(n);
    setSel(b);
  };
  const add = (type: FieldType) => {
    const key = `${type === "section" ? "s" : "c"}${Date.now().toString(36)}`;
    const nf: FormField = {
      key,
      type,
      label: type === "section" ? "New section" : `New ${typeMeta(type).label.toLowerCase()} field`,
      required: false,
      enabled: true,
      width: type === "section" || type === "textarea" ? "full" : "half",
      options: OPTION_TYPES.includes(type) ? ["Option 1", "Option 2"] : undefined,
    };
    // Insert after the selected field, or at the end.
    const at = sel >= 0 ? sel + 1 : fields.length;
    const n = fields.slice();
    n.splice(at, 0, nf);
    change(n);
    setSel(at);
    setAddOpen(false);
  };
  const remove = (i: number) => {
    const f = fields[i];
    if (f.core) return;
    if (!window.confirm(`Remove “${f.label}”? Answers already submitted are kept on past submissions.`)) return;
    change(fields.filter((_, j) => j !== i));
    setSel(-1);
  };

  async function publish() {
    const local = definitionProblems({ ...def, fields });
    if (local.length) {
      setErr({ error: "Fix these before publishing.", problems: local });
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await publishFormAction(def.id, fields);
      if (res.error) setErr({ error: res.error, problems: res.problems });
      else {
        setDirty(false);
        setMsg("Published. The public form now uses these fields.");
        router.refresh();
      }
    } catch {
      setErr({ error: "Changes weren’t published. The server didn’t respond. Your edits are kept here." });
    } finally {
      setBusy(false);
    }
  }

  const shown = fields.filter((f) => f.enabled && f.type !== "section").length;
  const total = fields.filter((f) => f.type !== "section").length;
  const s = sel >= 0 ? fields[sel] : null;
  const lock = s ? core[s.key]?.locked : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "12px 20px" }}>
        <div style={{ marginRight: "auto" }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "var(--app-muted)" }}>
            <Link href="/admin/forms" style={{ textDecoration: "none" }}>Forms</Link> / {def.name}
          </nav>
          <h1 style={{ margin: "2px 0 0", fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>{def.name} form</h1>
        </div>
        <span role="status" style={{ fontSize: 13, color: "var(--app-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: dirty ? "#b54708" : "#067647" }} />
          {busy ? "Publishing…" : dirty ? "Unpublished changes" : "Published"}
        </span>
        <button type="button" className="btn btn-secondary" onClick={() => setPreview(true)} style={{ minHeight: 42, borderRadius: 10, background: "var(--app-card)" }}>
          <i className="ph ph-eye" aria-hidden="true" />
          Preview form
        </button>
        <button type="button" className="btn btn-primary" onClick={publish} disabled={busy || !dirty} style={{ minHeight: 42, borderRadius: 10 }}>
          <i className="ph ph-upload-simple" aria-hidden="true" />
          {busy ? "Publishing…" : "Publish changes"}
        </button>
      </div>

      {err && (
        <div role="alert" style={{ padding: "12px 16px", borderRadius: 12, fontSize: 14, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)" }}>
          <strong>{err.error}</strong>
          {err.problems && (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {err.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {msg && (
        <div role="status" style={{ padding: "12px 16px", borderRadius: 12, fontSize: 14, background: "color-mix(in srgb,#067647 14%,transparent)" }}>
          {msg}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        {/* Field list */}
        <section aria-labelledby="fl-h" style={{ ...card, flex: "1 1 380px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <h2 id="fl-h" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Fields <span style={{ fontWeight: 400, color: "var(--app-muted)", fontSize: 14 }}>{shown} of {total} shown</span>
            </h2>
            <div style={{ marginLeft: "auto", position: "relative" }}>
              <button type="button" className="btn btn-secondary" aria-expanded={addOpen} onClick={() => setAddOpen((o) => !o)} style={{ minHeight: 36, borderRadius: 10 }}>
                <i className="ph ph-plus" aria-hidden="true" />
                Add field
              </button>
              {addOpen && (
                <div role="menu" aria-label="Field type" style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 20, width: 280, padding: 8, borderRadius: 12, background: "var(--app-card)", boxShadow: "var(--shadow-lg)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {FIELD_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="menuitem"
                      onClick={() => add(t.id)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: 0, borderRadius: 8, background: "transparent", color: "var(--color-text)", font: "inherit", fontSize: 13.5, textAlign: "left", cursor: "pointer" }}
                    >
                      <i className={`ph-duotone ${t.icon}`} aria-hidden="true" style={{ fontSize: 18, color: "var(--color-accent)" }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {fields.map((f, i) => {
              const isSec = f.type === "section";
              const locked = !!core[f.key]?.locked;
              return (
                <li
                  key={f.key}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    setDrag(i);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (over !== i) setOver(i);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (drag > -1) move(drag, i);
                    setDrag(-1);
                    setOver(-1);
                  }}
                  onDragEnd={() => {
                    setDrag(-1);
                    setOver(-1);
                  }}
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest("button")) setSel(i);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: isSec ? "10px 10px 6px" : "8px 10px",
                    marginTop: isSec && i > 0 ? 10 : 0,
                    borderRadius: 10,
                    cursor: "pointer",
                    opacity: f.enabled ? 1 : 0.55,
                    background: sel === i ? "color-mix(in srgb,var(--color-accent) 10%,transparent)" : isSec ? "transparent" : "var(--app-page)",
                    outline: sel === i ? "2px solid var(--color-accent)" : over === i && drag !== i ? "2px dashed var(--color-accent)" : "none",
                  }}
                >
                  <i className="ph ph-dots-six-vertical" aria-hidden="true" style={{ fontSize: 18, color: "var(--app-muted)", cursor: "grab" }} />
                  <i className={`ph-duotone ${typeMeta(f.type).icon}`} aria-hidden="true" style={{ fontSize: 18, color: "var(--color-accent)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: isSec ? 13 : 14, fontWeight: isSec ? 600 : 500, textTransform: isSec ? "uppercase" : undefined, letterSpacing: isSec ? "0.04em" : undefined, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.label}
                    </div>
                    {!isSec && (
                      <div style={{ fontSize: 12, color: "var(--app-muted)" }}>
                        {typeMeta(f.type).label} · {f.required ? "Required" : "Optional"}
                        {f.core ? " · Built-in" : ""}
                      </div>
                    )}
                  </div>
                  <button type="button" aria-label={`Move ${f.label} up`} disabled={i === 0} onClick={() => move(i, i - 1)} style={iconBtn}>
                    <i className="ph ph-arrow-up" aria-hidden="true" />
                  </button>
                  <button type="button" aria-label={`Move ${f.label} down`} disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} style={iconBtn}>
                    <i className="ph ph-arrow-down" aria-hidden="true" />
                  </button>
                  <Switch
                    on={f.enabled}
                    disabled={locked}
                    label={locked ? `${f.label} is always shown` : `${f.enabled ? "Hide" : "Show"} ${f.label}`}
                    onChange={() => upd(i, { enabled: !f.enabled })}
                  />
                </li>
              );
            })}
          </ol>
          <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "var(--app-muted)" }}>
            Drag fields or use the arrows to reorder. The switch shows or hides a field on the public form.
          </p>
        </section>

        {/* Edit panel */}
        <section aria-labelledby="ed-h" style={{ ...card, flex: "1 1 340px", minWidth: 0, position: "sticky", top: 16 }}>
          <h2 id="ed-h" style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>{s ? (s.type === "section" ? "Edit section" : "Edit field") : "Edit field"}</h2>
          {!s ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>Select a field to edit its label, placeholder, description and rules.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Pair
                id="ed-label"
                label="Label"
                en={s.label}
                sw={s.labelSw ?? ""}
                onEn={(v) => upd(sel, { label: v })}
                onSw={(v) => upd(sel, { labelSw: v })}
              />
              {s.type !== "section" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label htmlFor="ed-type" style={lab}>Type</label>
                    <select
                      id="ed-type"
                      className="input"
                      value={s.type}
                      disabled={s.core}
                      onChange={(e) => {
                        const t = e.target.value as FieldType;
                        upd(sel, { type: t, options: OPTION_TYPES.includes(t) ? s.options ?? ["Option 1", "Option 2"] : undefined, width: t === "textarea" ? "full" : s.width });
                      }}
                      style={inp}
                    >
                      {FIELD_TYPES.filter((t) => t.id !== "section").map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                    {s.core && <p style={{ margin: 0, fontSize: 12.5, color: "var(--app-muted)" }}>Built-in field: its type is fixed because the operations workflow uses it.</p>}
                  </div>
                  {!["checkbox", "radio", "multiselect"].includes(s.type) && (
                    <Pair id="ed-ph" label="Placeholder" en={s.placeholder ?? ""} sw={s.placeholderSw ?? ""} onEn={(v) => upd(sel, { placeholder: v })} onSw={(v) => upd(sel, { placeholderSw: v })} />
                  )}
                  <Pair id="ed-help" label="Description" en={s.help ?? ""} sw={s.helpSw ?? ""} onEn={(v) => upd(sel, { help: v })} onSw={(v) => upd(sel, { helpSw: v })} />
                  {OPTION_TYPES.includes(s.type) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label htmlFor="ed-opts" style={lab}>Options (one per line)</label>
                      <textarea
                        id="ed-opts"
                        className="input"
                        rows={5}
                        value={(s.options ?? []).join("\n")}
                        onChange={(e) => upd(sel, { options: e.target.value.split("\n") })}
                        onBlur={(e) => upd(sel, { options: [...new Set(e.target.value.split("\n").map((o) => o.trim()).filter(Boolean))] })}
                        style={{ ...inp, minHeight: 110, padding: "8px 12px", resize: "vertical" }}
                      />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span id="ed-w" style={lab}>Width</span>
                    <div role="radiogroup" aria-labelledby="ed-w" style={{ display: "flex", gap: 8 }}>
                      {(["half", "full"] as const).map((w) => (
                        <button
                          key={w}
                          type="button"
                          role="radio"
                          aria-checked={s.width === w}
                          disabled={s.type === "textarea"}
                          onClick={() => upd(sel, { width: w })}
                          className="btn btn-secondary"
                          style={{ minHeight: 36, borderRadius: 10, flex: 1, background: s.width === w ? "color-mix(in srgb,var(--color-accent) 14%,transparent)" : "var(--app-page)", fontWeight: s.width === w ? 600 : 400 }}
                        >
                          {w === "half" ? "Half width" : "Full width"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div id="ed-req" style={{ fontSize: 14, fontWeight: 500 }}>Required</div>
                      {lock && <div style={{ fontSize: 12.5, color: "var(--app-muted)" }}>Always required: requests can’t be processed without it.</div>}
                    </div>
                    <Switch
                      on={s.required}
                      disabled={!!lock}
                      labelledBy="ed-req"
                      onChange={() =>
                        upd(sel, {
                          required: !s.required,
                          // An "Optional" hint would contradict a required field.
                          ...(!s.required && /^optional$/i.test(s.placeholder ?? "") ? { placeholder: "" } : {}),
                          ...(!s.required && /^si lazima$/i.test(s.placeholderSw ?? "") ? { placeholderSw: "" } : {}),
                        })
                      }
                    />
                  </div>
                </>
              )}
              {!s.core && (
                <button type="button" className="btn btn-secondary" onClick={() => remove(sel)} style={{ minHeight: 38, borderRadius: 10, color: "var(--color-accent-2-700)", background: "var(--app-card)", alignSelf: "flex-start" }}>
                  <i className="ph ph-trash" aria-hidden="true" />
                  {s.type === "section" ? "Remove section" : "Remove field"}
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {preview && <Preview def={{ ...def, fields }} onClose={() => setPreview(false)} />}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  display: "grid",
  placeItems: "center",
  border: 0,
  borderRadius: 8,
  background: "transparent",
  color: "var(--app-muted)",
  cursor: "pointer",
  flex: "none",
};

function Pair({ id, label, en, sw, onEn, onSw }: { id: string; label: string; en: string; sw: string; onEn: (v: string) => void; onSw: (v: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={`${id}-en`} style={lab}>{label} (English)</label>
        <input id={`${id}-en`} className="input" value={en} maxLength={300} onChange={(e) => onEn(e.target.value)} style={inp} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={`${id}-sw`} style={lab}>{label} (Swahili)</label>
        <input id={`${id}-sw`} className="input" value={sw} maxLength={300} placeholder="Uses English if empty" onChange={(e) => onSw(e.target.value)} style={inp} />
      </div>
    </div>
  );
}

function Switch({ on, onChange, disabled, label, labelledBy }: { on: boolean; onChange: () => void; disabled?: boolean; label?: string; labelledBy?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={onChange}
      style={{
        position: "relative",
        flex: "none",
        width: 42,
        height: 24,
        borderRadius: 999,
        border: 0,
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        background: on ? "var(--color-accent)" : "color-mix(in srgb,var(--color-text) 25%,transparent)",
      }}
    >
      <span aria-hidden="true" style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
    </button>
  );
}

// Renders the form exactly as visitors see it, with live validation, without
// sending anything.
function Preview({ def, onClose }: { def: FormDef; onClose: () => void }) {
  const [values, setValues] = useState<SubmissionValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sw, setSw] = useState(false);
  const [ok, setOk] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 100, background: "color-mix(in srgb,#000 50%,transparent)", overflowY: "auto", padding: "32px 16px" }}>
      <div role="dialog" aria-modal="true" aria-labelledby="pv-h" style={{ maxWidth: 820, margin: "0 auto", borderRadius: 16, background: "var(--color-bg)", color: "var(--color-text)", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid var(--color-divider)", flexWrap: "wrap" }}>
          <span id="pv-h" style={{ fontSize: 13, color: "color-mix(in srgb,var(--color-text) 72%,transparent)", marginRight: "auto" }}>
            Preview · exactly as visitors will see the {def.name} form
          </span>
          <div role="group" aria-label="Preview language" style={{ display: "flex", border: "1px solid var(--color-divider)", borderRadius: 8, overflow: "hidden" }}>
            {[false, true].map((v) => (
              <button key={String(v)} type="button" aria-pressed={sw === v} onClick={() => { setSw(v); setErrors({}); }} style={{ padding: "4px 10px", border: 0, font: "inherit", fontSize: 12, cursor: "pointer", background: sw === v ? "var(--color-text)" : "transparent", color: sw === v ? "var(--color-bg)" : "var(--color-text)" }}>
                {v ? "SW" : "EN"}
              </button>
            ))}
          </div>
          <button ref={closeRef} type="button" className="btn btn-secondary" onClick={onClose} style={{ minHeight: 34 }}>
            Close preview
          </button>
        </div>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const r = validateSubmission(def, values, sw ? "sw" : "en");
            setErrors(r.errors);
            setOk(Object.keys(r.errors).length === 0);
          }}
          style={{ padding: "28px clamp(20px,4vw,40px) 32px" }}
        >
          <p style={{ margin: "0 0 28px", fontSize: 14 }}>
            {sw ? "Sehemu zenye * zinahitajika." : "Fields marked * are required."}
          </p>
          <FormFields
            def={def}
            values={values}
            errors={errors}
            sw={sw}
            idPrefix="pv"
            onChange={(k: string, v: SubmissionValue) => {
              setValues((p) => ({ ...p, [k]: v }));
              setOk(false);
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ minHeight: 48, paddingInline: 24 }}>
            {sw ? "Tuma" : "Submit"}
          </button>
          {ok && (
            <p role="status" style={{ margin: "14px 0 0", fontSize: 14 }}>
              All answers are valid. (Preview only: nothing was sent.)
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
