"use client";

import { useState } from "react";
import type { FormDef, FormField, SubmissionValue, SubmissionValues } from "@/lib/forms/schema";

// Renders a form definition's shown fields, grouped under its section
// headings. Used by the public forms and the builder's preview, so the preview
// is exactly what visitors see.

type Props = {
  def: FormDef;
  values: SubmissionValues;
  errors: Record<string, string>;
  onChange: (key: string, value: SubmissionValue) => void;
  sw: boolean;
  /** Prefix for element ids, so a preview can coexist with a live form. */
  idPrefix?: string;
};

const pick = (sw: boolean, en?: string, swText?: string) => (sw && swText ? swText : en ?? "");

export default function FormFields({ def, values, errors, onChange, sw, idPrefix = "f" }: Props) {
  // Group shown fields under the section heading that precedes them.
  const groups: { section?: FormField; fields: FormField[] }[] = [];
  for (const fld of def.fields) {
    if (!fld.enabled) continue;
    if (fld.type === "section") groups.push({ section: fld, fields: [] });
    else {
      if (groups.length === 0) groups.push({ fields: [] });
      groups[groups.length - 1].fields.push(fld);
    }
  }
  const visible = groups.filter((g) => g.fields.length > 0);
  const numbered = visible.filter((g) => g.section).length > 1;

  return (
    <>
      {visible.map((g, gi) => {
        const grid = (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "22px 24px" }}>
            {g.fields.map((fld) => (
              <Field
                key={fld.key}
                fld={fld}
                id={`${idPrefix}-${fld.key}`}
                value={values[fld.key]}
                error={errors[fld.key]}
                onChange={(v) => onChange(fld.key, v)}
                sw={sw}
              />
            ))}
          </div>
        );
        if (!g.section) return <div key={`g${gi}`} style={{ marginBottom: 40 }}>{grid}</div>;
        return (
          <fieldset key={g.section.key} style={{ border: 0, margin: "0 0 48px", padding: 0, minWidth: 0 }}>
            <legend style={{ display: "flex", alignItems: "baseline", gap: 14, padding: 0, margin: "0 0 24px", fontSize: 24, fontWeight: 600 }}>
              {numbered && (
                <span style={{ fontSize: 13, fontWeight: 400, color: "var(--color-accent-700)" }}>
                  {String(visible.filter((x) => x.section).indexOf(g) + 1).padStart(2, "0")}
                </span>
              )}
              {pick(sw, g.section.label, g.section.labelSw)}
            </legend>
            {grid}
          </fieldset>
        );
      })}
    </>
  );
}

function Field({
  fld,
  id,
  value,
  error,
  onChange,
  sw,
}: {
  fld: FormField;
  id: string;
  value: SubmissionValue | undefined;
  error?: string;
  onChange: (v: SubmissionValue) => void;
  sw: boolean;
}) {
  const label = pick(sw, fld.label, fld.labelSw);
  const ph = pick(sw, fld.placeholder, fld.placeholderSw);
  const help = pick(sw, fld.help, fld.helpSw);
  const describedBy = [error ? `${id}-err` : "", help ? `${id}-help` : ""].filter(Boolean).join(" ") || undefined;
  const inputStyle: React.CSSProperties = {
    minHeight: 46,
    fontSize: 16,
    borderColor: error ? "var(--color-accent-2)" : "var(--color-divider)",
  };
  const str = typeof value === "string" ? value : "";
  const common = {
    id,
    name: fld.key,
    "aria-required": fld.required || undefined,
    "aria-invalid": error ? ("true" as const) : ("false" as const),
    "aria-describedby": describedBy,
  };
  const star = fld.required && (
    <span aria-hidden="true" style={{ color: "var(--color-accent-2-700)" }}>*</span>
  );
  const labelCss: React.CSSProperties = { fontSize: 14, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };

  let control: React.ReactNode;
  let grouped = false;
  if (fld.type === "select") {
    control = (
      <select className="input" {...common} value={str} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">{ph || (sw ? "Chagua" : "Select")}</option>
        {(fld.options ?? []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  } else if (fld.type === "textarea") {
    control = (
      <textarea className="input" {...common} value={str} placeholder={ph} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, minHeight: 120 }} />
    );
  } else if (fld.type === "radio" || fld.type === "multiselect") {
    grouped = true;
    const multi = fld.type === "multiselect";
    const arr = Array.isArray(value) ? value : str ? [str] : [];
    control = (
      <div role={multi ? "group" : "radiogroup"} aria-labelledby={`${id}-lbl`} aria-describedby={describedBy} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(fld.options ?? []).map((o, oi) => (
          <Chip
            key={o}
            id={`${id}-${oi}`}
            name={fld.key}
            multi={multi}
            label={o}
            on={arr.includes(o)}
            onToggle={() => onChange(multi ? (arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]) : o)}
          />
        ))}
      </div>
    );
  } else if (fld.type === "checkbox") {
    return (
      <div style={{ gridColumn: fld.width === "full" ? "1 / -1" : "auto", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <label htmlFor={id} style={{ ...labelCss, alignItems: "flex-start", cursor: "pointer" }}>
          <input
            type="checkbox"
            {...common}
            checked={value === "true" || value === "Yes"}
            onChange={(e) => onChange(e.target.checked ? "true" : "")}
            style={{ width: 20, height: 20, marginTop: 1, accentColor: "var(--color-accent)", flex: "none" }}
          />
          <span>{label} {star}</span>
        </label>
        <Notes id={id} help={help} error={error} />
      </div>
    );
  } else {
    control = (
      <input
        className="input"
        {...common}
        type={fld.type}
        inputMode={fld.type === "tel" ? "tel" : fld.type === "number" ? "decimal" : undefined}
        autoComplete={fld.auto}
        value={str}
        placeholder={ph}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    );
  }

  return (
    <div style={{ gridColumn: fld.width === "full" ? "1 / -1" : "auto", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      {grouped ? (
        <span id={`${id}-lbl`} style={labelCss}>{label} {star}</span>
      ) : (
        <label id={`${id}-lbl`} htmlFor={id} style={labelCss}>{label} {star}</label>
      )}
      {control}
      <Notes id={id} help={help} error={error} />
    </div>
  );
}

function Notes({ id, help, error }: { id: string; help: string; error?: string }) {
  return (
    <>
      {help && !error && (
        <p id={`${id}-help`} style={{ margin: 0, fontSize: 13, color: "color-mix(in srgb,var(--color-text) 72%,transparent)" }}>{help}</p>
      )}
      {error && (
        <p id={`${id}-err`} style={{ margin: 0, fontSize: 13, lineHeight: "18px", color: "var(--color-accent-2-700)", display: "flex", gap: 6, alignItems: "center" }}>
          <i className="ph-duotone ph-warning-circle" aria-hidden="true" style={{ fontSize: 16, flex: "none" }} />
          {error}
        </p>
      )}
    </>
  );
}

// A choice rendered as a chip button around a real (visually hidden) radio or
// checkbox, so keyboard and screen-reader behaviour stay native.
function Chip({ id, name, multi, label, on, onToggle }: { id: string; name: string; multi: boolean; label: string; on: boolean; onToggle: () => void }) {
  const [focus, setFocus] = useState(false);
  return (
    <label
      htmlFor={id}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        minHeight: 44,
        padding: "0 16px",
        fontSize: 15,
        cursor: "pointer",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${on ? "var(--color-text)" : "var(--color-divider)"}`,
        background: on ? "var(--color-text)" : "transparent",
        color: on ? "var(--color-bg)" : "var(--color-text)",
        outline: focus ? "2px solid var(--color-accent)" : "none",
        outlineOffset: 2,
      }}
    >
      <input
        id={id}
        type={multi ? "checkbox" : "radio"}
        name={name}
        checked={on}
        onChange={onToggle}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1, margin: 0, pointerEvents: "none" }}
      />
      {label}
    </label>
  );
}
