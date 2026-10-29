"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsAction, type SettingsState } from "@/app/admin/settings/actions";
import type { SettingKey, Settings } from "@/lib/settings";
import { IMAGE_ACCEPT, checkImage, uploadImage } from "@/lib/upload-image";
import { SETTINGS_TABS } from "@/lib/settings-tabs";

export { SETTINGS_TABS };

export type IntegrationStatus = {
  name: string;
  kind: string;
  icon: string;
  state: "ok" | "warn" | "error";
  label: string;
  desc: string;
  href?: string;
  cta?: string;
};

const card: React.CSSProperties = { padding: 22, borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" };
const labelCss: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "var(--app-muted)" };
const inputCss: React.CSSProperties = { minHeight: 42, borderRadius: 10, background: "var(--app-page)", width: "100%" };
const helpCss: React.CSSProperties = { margin: 0, fontSize: 12.5, color: "var(--app-muted)" };
const errCss: React.CSSProperties = { margin: 0, fontSize: 12.5, color: "var(--color-accent-2-700)" };

const NOTIFY_EVENTS = [
  { id: "request", label: "New quote request", desc: "A business submits the Request a Quote form." },
  { id: "carrier", label: "New truck registration", desc: "A carrier registers a vehicle." },
  { id: "contact", label: "New contact message", desc: "Someone sends the contact form." },
  { id: "shipment", label: "Shipment issue", desc: "A shipment is reported delayed." },
  { id: "system", label: "System alert", desc: "An email fails to send or an integration needs attention." },
] as const;

const initial: SettingsState = { error: null };

export default function SettingsView({
  tab,
  settings,
  integrations,
  images,
  emailReady,
}: {
  tab: string;
  settings: Settings;
  integrations: IntegrationStatus[];
  images: { url: string; fileName: string }[];
  emailReady: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveSettingsAction, initial);
  const [v, setV] = useState<Settings>(settings);
  const [dirty, setDirty] = useState(false);
  const lastState = useRef(state);

  const cur = SETTINGS_TABS.find((t) => t.id === tab) ?? SETTINGS_TABS[0];
  const fe = state.fieldErrors ?? {};
  const set = (k: SettingKey, value: string) => {
    setV((p) => ({ ...p, [k]: value }));
    setDirty(true);
  };

  useEffect(() => {
    if (state !== lastState.current) {
      lastState.current = state;
      if (state.saved) {
        setDirty(false);
        router.refresh();
      }
    }
  }, [state, router]);

  // After a save the server re-renders with the stored (normalised) values,
  // e.g. a pasted "google-site-verification=…" prefix removed. Show those.
  useEffect(() => {
    if (!dirty) setV(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const showSave = tab !== "integrations";
  const status = pending
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : state.error
        ? ""
        : "All changes saved";

  const text = (k: SettingKey, label: string, o: { type?: string; help?: React.ReactNode; full?: boolean; ph?: string; area?: boolean; max?: number } = {}) => (
    <div key={k} style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: o.full || o.area ? "1 / -1" : "auto" }}>
      <label htmlFor={`st-${k}`} style={labelCss}>{label}</label>
      {o.area ? (
        <textarea
          id={`st-${k}`}
          name={`setting__${k}`}
          className="input"
          rows={3}
          maxLength={o.max}
          value={v[k]}
          placeholder={o.ph}
          aria-invalid={fe[k] ? true : undefined}
          aria-describedby={`st-${k}-h`}
          onChange={(e) => set(k, e.target.value)}
          style={{ ...inputCss, minHeight: 88, padding: "10px 12px", resize: "vertical", borderColor: fe[k] ? "var(--color-accent-2)" : undefined }}
        />
      ) : (
        <input
          id={`st-${k}`}
          name={`setting__${k}`}
          className="input"
          type={o.type ?? "text"}
          maxLength={o.max}
          value={v[k]}
          placeholder={o.ph}
          aria-invalid={fe[k] ? true : undefined}
          aria-describedby={`st-${k}-h`}
          onChange={(e) => set(k, e.target.value)}
          style={{ ...inputCss, borderColor: fe[k] ? "var(--color-accent-2)" : undefined }}
        />
      )}
      <div id={`st-${k}-h`}>
        {fe[k] ? <p style={errCss}>{fe[k]}</p> : o.help ? <p style={helpCss}>{o.help}</p> : null}
      </div>
    </div>
  );

  const toggle = (k: SettingKey, label: string, help?: string, disabled?: boolean) => {
    const on = v[k] === "true";
    return (
      <div key={k} style={{ gridColumn: "1 / -1", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div id={`st-${k}-l`} style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
          {help && <p style={{ ...helpCss, marginTop: 2 }}>{help}</p>}
        </div>
        <input type="hidden" name={`setting__${k}`} value={on ? "true" : "false"} />
        <Switch on={on} disabled={disabled} labelledBy={`st-${k}-l`} onChange={() => set(k, on ? "false" : "true")} />
      </div>
    );
  };

  const fixed = (label: string, value: string, help: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={labelCss}>{label}</span>
      <div style={{ ...inputCss, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 14, color: "var(--app-muted)" }}>{value}</div>
      <p style={helpCss}>{help}</p>
    </div>
  );

  let body: React.ReactNode = null;

  if (tab === "general") {
    body = (
      <Grid>
        {text("site.name", "Company name", { max: 80 })}
        {text("site.email", "Email", { type: "email", help: "Shown on the site and used as the sender and reply-to address for quotation emails." })}
        {text("site.phone", "Phone", { type: "tel" })}
        {text("site.whatsapp", "WhatsApp", { type: "tel", help: "Used for every “Chat on WhatsApp” button." })}
        {text("site.address", "Address", { area: true, max: 300, ph: "Office address", help: "Leave empty until the address is confirmed. It is hidden on the site when empty." })}
        {fixed("Currency", "TZS · Tanzanian shilling", "Quotes and reports are in Tanzanian shillings.")}
        {fixed("Timezone", "Africa/Dar_es_Salaam (EAT, UTC+3)", "Dates on quotations and emails use East Africa Time.")}
      </Grid>
    );
  }

  if (tab === "branding") {
    body = (
      <Grid>
        <ImageSetting
          k="brand.favicon"
          label="Favicon"
          help="Square PNG, 64 × 64 or larger. Shown in browser tabs and bookmarks."
          value={v["brand.favicon"]}
          error={fe["brand.favicon"]}
          square
          onChange={(url) => set("brand.favicon", url)}
        />
        <ImageSetting
          k="brand.ogImage"
          label="Default social image"
          help="PNG or JPG, 1200 × 630. Shown when a page is shared on WhatsApp, Facebook or LinkedIn."
          value={v["brand.ogImage"]}
          error={fe["brand.ogImage"]}
          onChange={(url) => set("brand.ogImage", url)}
        />
        <p style={{ ...helpCss, gridColumn: "1 / -1" }}>
          The ABRIA wordmark and brand colours are part of the design system and are changed in code, so the site stays accessible in light and dark mode.
        </p>
      </Grid>
    );
  }

  if (tab === "seo") {
    const tLen = v["seo.title"].length;
    const dLen = v["seo.description"].length;
    body = (
      <>
        <Grid>
          {text("seo.title", "Default site title", {
            full: true,
            max: 120,
            help: <span style={{ color: tLen > 60 ? "var(--color-accent-2-700)" : undefined }}>{tLen}/60 characters{tLen > 60 ? " · search engines may cut it off" : ""}</span>,
          })}
          {text("seo.description", "Default description", {
            area: true,
            max: 300,
            help: <span style={{ color: dLen > 160 ? "var(--color-accent-2-700)" : undefined }}>{dLen}/160 characters{dLen > 160 ? " · too long, search engines will cut it off" : ""}</span>,
          })}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="st-seo-image" style={labelCss}>Default social image</label>
            <select
              id="st-seo-image"
              name="setting__brand.ogImage"
              className="input"
              value={v["brand.ogImage"]}
              onChange={(e) => set("brand.ogImage", e.target.value)}
              style={inputCss}
            >
              <option value="">None</option>
              {images.map((m) => (
                <option key={m.url} value={m.url}>{m.fileName}</option>
              ))}
            </select>
            <p style={helpCss}>Choose from the media library, or upload one under Branding.</p>
          </div>
          {text("seo.gsc", "Google Search Console verification", { ph: "google-site-verification=…", help: "Optional. Added to every page’s head." })}
          {toggle("seo.index", "Allow search engines to index the site", "Turn off only while the site is in staging. Off adds noindex to every page and blocks crawlers in robots.txt.")}
        </Grid>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 16, marginTop: 22 }}>
          <div>
            <p style={{ ...labelCss, margin: "0 0 8px" }}>Search result preview</p>
            <div style={{ padding: 16, borderRadius: 12, background: "var(--app-page)" }}>
              <div style={{ fontSize: 12.5, color: "var(--app-muted)" }}>abrialogistics.co.tz</div>
              <div style={{ fontSize: 17, color: "#1a0dab", margin: "4px 0", lineHeight: 1.3 }}>{tLen > 60 ? v["seo.title"].slice(0, 57) + "…" : v["seo.title"]}</div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>{dLen > 160 ? v["seo.description"].slice(0, 157) + "…" : v["seo.description"]}</div>
            </div>
          </div>
          <div>
            <p style={{ ...labelCss, margin: "0 0 8px" }}>Social share preview</p>
            <div style={{ borderRadius: 12, overflow: "hidden", background: "var(--app-page)" }}>
              <div style={{ aspectRatio: "1200/630", background: "var(--app-line)", display: "grid", placeItems: "center" }}>
                {v["brand.ogImage"] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v["brand.ogImage"]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 13, color: "var(--app-muted)" }}>No social image set</span>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "var(--app-muted)" }}>abrialogistics.co.tz</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v["seo.title"]}</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (tab === "notifications") {
    body = (
      <>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "left", padding: "0 0 10px", ...labelCss }}>Event</th>
                <th scope="col" style={{ textAlign: "center", padding: "0 0 10px", width: 90, ...labelCss }}>In-app</th>
                <th scope="col" style={{ textAlign: "center", padding: "0 0 10px", width: 90, ...labelCss }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFY_EVENTS.map((e) => {
                const inK = `notify.${e.id}.inapp` as SettingKey;
                const emK = `notify.${e.id}.email` as SettingKey;
                return (
                  <tr key={e.id} style={{ borderTop: "1px solid var(--app-line)" }}>
                    <td style={{ padding: "12px 12px 12px 0" }}>
                      <div id={`ev-${e.id}`} style={{ fontWeight: 500 }}>{e.label}</div>
                      <div style={{ fontSize: 12.5, color: "var(--app-muted)" }}>{e.desc}</div>
                    </td>
                    {[inK, emK].map((k) => {
                      const on = v[k] === "true";
                      const dis = k === emK && !emailReady;
                      return (
                        <td key={k} style={{ textAlign: "center" }}>
                          <input type="hidden" name={`setting__${k}`} value={on ? "true" : "false"} />
                          <Switch
                            on={on && !dis}
                            disabled={dis}
                            ariaLabel={`${e.label} by ${k === inK ? "in-app notification" : "email"}`}
                            onChange={() => set(k, on ? "false" : "true")}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!emailReady && (
          <p style={{ ...helpCss, marginTop: 12 }}>
            Email is unavailable until an email provider is connected in <Link href="/admin/settings/integrations">Integrations</Link>.
          </p>
        )}
        <div style={{ marginTop: 18 }}>
          <Grid>
            {text("notify.opsEmail", "Team email for notifications", {
              type: "email",
              ph: "operations@abrialogistics.co.tz",
              help: "Where notification emails are sent. Leave empty to use the ABRIA_OPS_EMAIL server setting.",
            })}
          </Grid>
        </div>
        <p style={{ ...helpCss, marginTop: 14 }}>
          WhatsApp has no sending integration: WhatsApp buttons open a chat with details filled in.
        </p>
      </>
    );
  }

  if (tab === "integrations") {
    const tone = {
      ok: { bg: "color-mix(in srgb,#067647 14%,transparent)", fg: "#067647" },
      warn: { bg: "color-mix(in srgb,#b54708 16%,transparent)", fg: "#b54708" },
      error: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)" },
    } as const;
    body = (
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {integrations.map((i) => (
          <li key={i.name} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 16, borderRadius: 12, background: "var(--app-page)", flexWrap: "wrap" }}>
            <i className={`ph-duotone ${i.icon}`} aria-hidden="true" style={{ fontSize: 26, color: "var(--color-accent)", flex: "none" }} />
            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 15 }}>{i.name}</strong>
                <span style={{ fontSize: 12, fontWeight: 500, padding: "2px 10px", borderRadius: 999, background: tone[i.state].bg, color: tone[i.state].fg }}>{i.label}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--app-muted)" }}>{i.kind}</div>
              <p style={{ margin: "6px 0 0", fontSize: 13.5 }}>{i.desc}</p>
            </div>
            {i.href && (
              <a className="btn btn-secondary" href={i.href} target="_blank" rel="noreferrer" style={{ minHeight: 38, borderRadius: 10, alignSelf: "center" }}>
                {i.cta}
              </a>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (tab === "security") {
    body = (
      <Grid>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="st-minpw" style={labelCss}>Minimum password length</label>
          <select id="st-minpw" name="setting__security.minPassword" className="input" value={v["security.minPassword"]} onChange={(e) => set("security.minPassword", e.target.value)} style={inputCss}>
            {["8", "10", "12", "14", "16"].map((n) => (
              <option key={n} value={n}>{n} characters</option>
            ))}
          </select>
          <p style={helpCss}>Applies to new users, password resets and first-run setup.</p>
        </div>
        {text("security.inviteDomain", "Allowed email domain for new users", {
          ph: "abrialogistics.co.tz",
          help: "Optional. When set, new console users must have an email at this domain.",
        })}
        {fixed("Inactivity sign-out", "After 5 minutes", "Staff are signed out after 5 minutes without activity.")}
        {fixed("Two-factor authentication", "Not available yet", "Supabase supports authenticator apps; enabling it for the console is planned.")}
      </Grid>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "12px 20px" }}>
        <div style={{ marginRight: "auto" }}>
          <div style={{ fontSize: 12.5, color: "var(--app-muted)" }}>Settings</div>
          <h1 style={{ margin: "2px 0 0", fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>{cur.label}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--app-muted)" }}>{cur.sub}</p>
        </div>
        {showSave && (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span role="status" style={{ fontSize: 13, color: "var(--app-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {status && (
                <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: dirty ? "#b54708" : "#067647" }} />
              )}
              {status}
            </span>
            <button type="submit" className="btn btn-primary" disabled={pending || !dirty} style={{ minHeight: 42, borderRadius: 10 }}>
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>

      {state.error && (
        <div role="alert" style={{ padding: "12px 16px", borderRadius: 12, fontSize: 14, background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)" }}>
          {state.error}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <nav aria-label="Settings sections" style={{ ...card, padding: 8, flex: "1 1 200px", maxWidth: 260 }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {SETTINGS_TABS.map((t) => {
              const active = t.id === tab;
              return (
                <li key={t.id}>
                  <Link
                    href={`/admin/settings/${t.id}`}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => {
                      if (dirty && !window.confirm("You have unsaved changes. Leave this tab without saving?")) e.preventDefault();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: active ? 600 : 400,
                      textDecoration: "none",
                      color: active ? "var(--color-accent-800)" : "var(--color-text)",
                      background: active ? "color-mix(in srgb,var(--color-accent) 14%,transparent)" : "transparent",
                    }}
                  >
                    <i className={`ph-duotone ${t.icon}`} aria-hidden="true" style={{ fontSize: 18 }} />
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <section aria-label={`${cur.label} settings`} style={{ ...card, flex: "999 1 480px", minWidth: 0 }}>
          {body}
        </section>
      </div>
    </form>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "18px 20px" }}>
      {children}
    </div>
  );
}

function Switch({
  on,
  onChange,
  disabled,
  ariaLabel,
  labelledBy,
}: {
  on: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  labelledBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
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
        opacity: disabled ? 0.4 : 1,
        background: on ? "var(--color-accent)" : "color-mix(in srgb,var(--color-text) 25%,transparent)",
        transition: "background .15s",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,.2)",
          transition: "left .15s",
        }}
      />
    </button>
  );
}

function ImageSetting({
  k,
  label,
  help,
  value,
  error,
  square,
  onChange,
}: {
  k: SettingKey;
  label: string;
  help: string;
  value: string;
  error?: string;
  square?: boolean;
  onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    const invalid = checkImage(file, 3 * 1024 * 1024);
    if (invalid) {
      setErr(invalid);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const { url } = await uploadImage(file, { category: "Branding", alt: label });
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: square ? "auto" : "1 / -1" }}>
      <span id={`st-${k}-l`} style={labelCss}>{label}</span>
      <input type="hidden" name={`setting__${k}`} value={value} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, borderRadius: 12, background: "var(--app-page)", flexWrap: "wrap" }}>
        <div
          style={{
            width: square ? 56 : 120,
            aspectRatio: square ? "1" : "1200/630",
            borderRadius: 8,
            background: "var(--app-line)",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            flex: "none",
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <i className="ph-duotone ph-image" aria-hidden="true" style={{ fontSize: 22, color: "var(--app-muted)" }} />
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => ref.current?.click()} aria-describedby={`st-${k}-l`} style={{ minHeight: 38, borderRadius: 10 }}>
            <i className="ph ph-upload-simple" aria-hidden="true" />
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && !busy && (
            <button type="button" className="btn btn-secondary" onClick={() => onChange("")} style={{ minHeight: 38, borderRadius: 10 }}>
              Remove
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept={IMAGE_ACCEPT} hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {err || error ? <p role="alert" style={errCss}>{err ?? error}</p> : <p style={helpCss}>{help}</p>}
    </div>
  );
}
