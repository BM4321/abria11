"use client";

import { useEffect, useState } from "react";

import { useSite } from "@/lib/i18n";
import FormFields from "@/components/forms/FormFields";
import { inputFields, validateSubmission, type FormDef, type SubmissionValue, type SubmissionValues } from "@/lib/forms/schema";

const FAQ = [
  {
    group: "Businesses",
    items: [
      ["How do I request transport?", "Use the Request a Quote form, or send the details on WhatsApp. Include pickup and delivery locations, cargo type, approximate weight and the date. You receive an ABR reference as soon as you submit."],
      ["What types of cargo can ABRIA transport?", "The request form covers general cargo, refrigerated, hazardous, fragile and heavy machinery. If your cargo is something else, choose Other and describe it; the team will confirm whether it can be moved."],
      ["How are transport quotes handled?", "The ABRIA team reviews each request and sends you a written quotation. Nothing is booked until you approve it."],
      ["How can I track my shipment?", "Every request has an ABR reference. Enter it on the Track Shipment page to see the current stage, or send it on WhatsApp for more detail."],
    ],
  },
  {
    group: "Carriers",
    items: [
      ["How do I register my truck?", "Fill in the Register Your Truck form with your details, truck type, registration number and the routes you cover. You receive a partner ID straight away."],
      ["What types of trucks are accepted?", "Flatbed, curtainsider, box truck, refrigerated, container truck, tipper, lowbed and pickup. Other vehicle types can be registered as Other."],
      ["How do I receive jobs?", "After the ABRIA team reviews your details and verifies your vehicle, jobs that fit your truck type, capacity and routes are assigned to you."],
    ],
  },
  {
    group: "General",
    items: [
      ["Where does ABRIA operate?", "ABRIA is based in Tanzania. [Confirmed regions to be added.] Ask us about your route and we will tell you whether we can serve it."],
      ["How does ABRIA work?", "Businesses request transport, ABRIA quotes the job and assigns a verified carrier, and the shipment is tracked by its ABR reference through to proof of delivery. See How It Works for both sides."],
      ["How can I contact ABRIA?", "WhatsApp {WHATSAPP}, call {PHONE}, or email {EMAIL}."],
    ],
  },
];

export default function Contact({ def }: { def: FormDef }) {
  const { T, sw, wa, contact: CONTACT } = useSite();
  // Preselect the first topic, as the hand-built form did.
  const initial = (): SubmissionValues => {
    const topic = inputFields(def).find((f) => f.key === "topic");
    return topic?.options?.[0] ? { topic: topic.options[0] } : {};
  };
  const [form, setForm] = useState<SubmissionValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendError, setSendError] = useState(false);
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const lang = sw ? "sw" : "en";

  useEffect(() => {
    if (location.hash === "#faq") {
      const el = document.getElementById("faq");
      if (el)
        setTimeout(
          () =>
            window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 72),
          300
        );
    }
  }, []);

  const onField = (k: string, v: SubmissionValue) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (tried) setErrors(validateSubmission(def, next, lang).errors);
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    const { errors: errs, values } = validateSubmission(def, form, lang);
    const bad = inputFields(def).filter((d) => errs[d.key]);
    if (bad.length) {
      setErrors(errs);
      setTried(true);
      setTimeout(() => (document.getElementById(`f-${bad[0].key}`) ?? document.getElementById(`f-${bad[0].key}-0`))?.focus(), 30);
      return;
    }
    setErrors({});
    setSendError(false);
    setStatus("loading");
    try {
      // The app keeps the message (Admin > Forms > Submissions) and notifies the team.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setSendError(true);
      setStatus("idle");
      return;
    }
    try {
      // Best-effort copy to Netlify Forms, as before.
      await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "contact",
          ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v])),
        }).toString(),
      });
    } catch {
      /* non-fatal */
    }
    setStatus("done");
  };

  return (
    <main
      style={{
        maxWidth: "var(--page-max)",
        margin: "0 auto",
        padding: "clamp(48px,8vw,112px) clamp(20px,5vw,72px) 0",
      }}
    >
      <p
        style={{
          margin: "0 0 20px",
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
        }}
      >
        {T("Contact", "Mawasiliano")}
      </p>
      <h1
        style={{
          fontSize: "clamp(44px,6.4vw,88px)",
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
          margin: "0 0 0 -0.035em",
          maxWidth: "11em",
        }}
      >
        {T("Let's get your goods moving.", "Wacha tusogeze mizigo yako.")}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))",
          gap: "56px clamp(40px,7vw,120px)",
          marginTop: "clamp(40px,5vw,64px)",
          alignItems: "start",
        }}
      >
        <section aria-label={T("Contact details", "Taarifa za mawasiliano")}>
          <a
            className="btn btn-primary"
            href={wa(T("Hello ABRIA, I have a question.", "Habari ABRIA, nina swali."))}
            target="_blank"
            rel="noopener"
            style={{ fontSize: 17, padding: "16px 26px", minHeight: 56 }}
          >
            <i
              className="ph-duotone ph-whatsapp-logo"
              aria-hidden="true"
              style={{ fontSize: 24 }}
            />
            {T("Chat on WhatsApp", "Ongea WhatsApp")}
          </a>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 15,
              color: "color-mix(in srgb,var(--color-text) 75%,transparent)",
            }}
          >
            {T(
              "The fastest way to reach us for quotes and support.",
              "Njia ya haraka zaidi kutufikia kwa bei na msaada."
            )}
          </p>
          <dl style={{ margin: "40px 0 0", display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <dt
                style={{
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
                }}
              >
                {CONTACT.whatsapp === CONTACT.phone.replace(/\D/g, "")
                  ? T("Phone / WhatsApp", "Simu / WhatsApp")
                  : T("Phone", "Simu")}
              </dt>
              <dd style={{ margin: "6px 0 0", fontSize: 22 }}>
                <a href={CONTACT.phoneHref} style={{ color: "var(--color-text)" }}>
                  {CONTACT.phone}
                </a>
                {CONTACT.whatsapp !== CONTACT.phone.replace(/\D/g, "") && (
                  <span style={{ display: "block", fontSize: 16, marginTop: 4 }}>
                    WhatsApp:{" "}
                    <a href={wa()} style={{ color: "var(--color-text)" }}>
                      {CONTACT.whatsappDisplay}
                    </a>
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt
                style={{
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
                }}
              >
                {T("Email", "Barua pepe")}
              </dt>
              <dd style={{ margin: "6px 0 0", fontSize: 22 }}>
                <a href={`mailto:${CONTACT.email}`} style={{ color: "var(--color-text)" }}>
                  {CONTACT.email}
                </a>
              </dd>
            </div>
            {CONTACT.address && (
              <div>
                <dt
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
                  }}
                >
                  {T("Office", "Ofisi")}
                </dt>
                <dd style={{ margin: "6px 0 0", fontSize: 18, whiteSpace: "pre-line" }}>{CONTACT.address}</dd>
              </div>
            )}
          </dl>
        </section>

        <section aria-labelledby="msg-h">
          <h2 id="msg-h" style={{ margin: 0, fontSize: 28 }}>
            {T("Send a message", "Tuma ujumbe")}
          </h2>
          {status !== "done" ? (
            <form
              noValidate
              onSubmit={submit}
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              style={{ marginTop: 24 }}
            >
              <input type="hidden" name="form-name" value="contact" />
              <p style={{ display: "none" }} aria-hidden="true">
                <label>
                  Don&apos;t fill this out if you&apos;re human: <input name="bot-field" />
                </label>
              </p>
              <FormFields def={def} values={form} errors={errors} onChange={onField} sw={sw} />
              {sendError && (
                <p role="alert" style={{ margin: "0 0 8px", padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)", fontSize: 15 }}>
                  {T(
                    "Your message did not go through. Your answers are still here; try again or message us on WhatsApp.",
                    "Ujumbe wako haukutumwa. Majibu yako bado yapo; jaribu tena au tutumie WhatsApp."
                  )}
                </p>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === "loading"}
                style={{ marginTop: 28, fontSize: 16, padding: "14px 24px", minHeight: 50 }}
              >
                {status === "loading" && (
                  <i
                    className="ph-duotone ph-truck"
                    aria-hidden="true"
                    style={{ fontSize: 20, animation: "abria-drive 0.7s ease-in-out infinite" }}
                  />
                )}
                {status === "loading" ? T("Sending…", "Inatuma…") : T("Send message", "Tuma ujumbe")}
              </button>
            </form>
          ) : (
            <div aria-live="polite" style={{ marginTop: 24 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: "28px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <i
                  className="ph-duotone ph-check-circle"
                  aria-hidden="true"
                  style={{ fontSize: 26, color: "var(--color-accent)", flex: "none" }}
                />
                <span>
                  {T(
                    "Message sent. The ABRIA team will reply by phone or email.",
                    "Ujumbe umetumwa. Timu ya ABRIA itajibu kwa simu au barua pepe."
                  )}
                </span>
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setStatus("idle");
                  setForm(initial());
                  setTried(false);
                }}
                style={{ marginTop: 12, minHeight: 44 }}
              >
                {T("Send another message", "Tuma ujumbe mwingine")}
              </button>
            </div>
          )}
        </section>
      </div>

      <section
        id="faq"
        aria-labelledby="faq-h"
        style={{ paddingTop: "clamp(96px,12vw,176px)", scrollMarginTop: 72 }}
      >
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          FAQ
        </p>
        <h2
          id="faq-h"
          style={{
            margin: 0,
            fontSize: "clamp(32px,4.4vw,56px)",
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
          }}
        >
          {T("Frequently asked questions", "Maswali yanayoulizwa sana")}
        </h2>
        <div
          data-stagger="1"
          style={{ display: "flex", flexDirection: "column", gap: 56, marginTop: 48 }}
        >
          {FAQ.map((g) => (
            <div
              key={g.group}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
                gap: "16px clamp(32px,6vw,96px)",
                alignItems: "start",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 400,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-700)",
                  paddingTop: 18,
                }}
              >
                {g.group}
              </h3>
              <div style={{ minWidth: 0 }}>
                {g.items.map(([q, a]) => (
                  <details
                    key={q}
                    style={{
                      borderBottom:
                        "1px solid color-mix(in srgb,var(--color-text) 12%,transparent)",
                    }}
                  >
                    <summary
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        minHeight: 60,
                        padding: "12px 0",
                        cursor: "pointer",
                        fontSize: 20,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        listStyle: "none",
                      }}
                    >
                      {q}
                      <i
                        className="ph ph-plus abria-caret"
                        aria-hidden="true"
                        style={{
                          fontSize: 20,
                          color: "var(--color-accent)",
                          flex: "none",
                          transition: "transform .15s ease",
                        }}
                      />
                    </summary>
                    <p
                      style={{
                        margin: "0 0 20px",
                        fontSize: 16,
                        lineHeight: "26px",
                        maxWidth: "40em",
                        color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
                      }}
                    >
                      {a
                        .replace("{WHATSAPP}", CONTACT.whatsappDisplay)
                        .replace("{PHONE}", CONTACT.phone)
                        .replace("{EMAIL}", CONTACT.email)}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <style>{`summary{list-style:none}summary::-webkit-details-marker{display:none}details[open] .abria-caret{transform:rotate(45deg)}`}</style>
    </main>
  );
}
