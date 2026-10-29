"use client";

import { useState } from "react";
import Link from "next/link";
import { pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";
import FormFields from "@/components/forms/FormFields";
import { inputFields, validateSubmission, type FormDef, type SubmissionValue, type SubmissionValues } from "@/lib/forms/schema";

const str = (v: SubmissionValue | undefined) => (Array.isArray(v) ? v.join(", ") : v ?? "");

export default function RequestQuoteForm({ def }: { def: FormDef }) {
  const { sw, T, wa } = useSite();
  // Road is preselected when the form still offers it.
  const initial = (): SubmissionValues =>
    inputFields(def).some((f) => f.key === "transportType" && f.options?.includes("Road")) ? { transportType: "Road" } : {};
  const [form, setForm] = useState<SubmissionValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [refId, setRefId] = useState("");

  const lang = sw ? "sw" : "en";
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
    setStatus("loading");
    const payload = values;

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      try {
        const netlifyBody = new URLSearchParams({
          "form-name": "transport-request",
          ...Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, str(v)])),
        });
        await fetch("/__forms.html", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: netlifyBody.toString(),
        });
      } catch {
        /* non-fatal */
      }
      setRefId(data.requestId);
      setStatus("success");
      window.scrollTo(0, 0);
    } catch {
      setStatus("error");
    }
  };

  const route = `${form.pickupLocation || ""} → ${form.deliveryLocation || ""}`;
  const waDone = wa(
    sw
      ? `Habari ABRIA, nimewasilisha ombi la usafiri.\nNamba: ${refId}\nNjia: ${route}\nMzigo: ${form.cargoType || ""}${form.weight ? ", " + form.weight + " kg" : ""}\nTarehe: ${form.transportDate || ""}\nJina: ${form.contactPerson || ""}`
      : `Hello ABRIA, I have just submitted a transport request.\nReference: ${refId}\nRoute: ${route}\nCargo: ${form.cargoType || ""}${form.weight ? ", " + form.weight + " kg" : ""}\nDate: ${form.transportDate || ""}\nName: ${form.contactPerson || ""}`
  );

  if (status === "success") {
    return (
      <section aria-live="polite" style={{ maxWidth: 760, paddingBottom: 24 }}>
        <i
          className="ph-duotone ph-seal-check"
          aria-hidden="true"
          style={{ fontSize: 56, color: "var(--color-accent)" }}
        />
        <h1
          style={{
            fontSize: "clamp(40px,5vw,64px)",
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            margin: "24px 0 0 -0.035em",
          }}
        >
          {T("Request received.", "Ombi limepokelewa.")}
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: "28px",
            margin: "20px 0 0",
            color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
          }}
        >
          {T(
            "The ABRIA team will review your request and contact you with a quotation. Keep your reference number for every conversation about this shipment.",
            "Timu ya ABRIA itapitia ombi lako na kukupigia na bei. Hifadhi namba yako ya kumbukumbu kwa mawasiliano yote kuhusu mzigo huu."
          )}
        </p>
        <hr
          style={{
            height: 5,
            border: 0,
            margin: "40px 0 0",
            borderTop: "2px solid var(--color-text)",
            borderBottom: "1px solid var(--color-text)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "8px 32px",
            padding: "18px 0",
          }}
        >
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            {T("Your ABRIA reference", "Namba yako ya ABRIA")}
          </span>
          <span
            style={{
              fontSize: "clamp(28px,4vw,40px)",
              fontWeight: 600,
              letterSpacing: "0.02em",
              fontFeatureSettings: "'tnum' 1",
            }}
          >
            {refId}
          </span>
        </div>
        <hr
          style={{ height: 0, border: 0, borderTop: "1px solid var(--color-text)", margin: 0 }}
        />
        <dl
          style={{
            margin: "20px 0 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))",
            gap: "16px 32px",
          }}
        >
          {[
            { k: T("Route", "Njia"), v: route },
            { k: T("Cargo", "Mzigo"), v: `${form.cargoType || "—"}${form.weight ? " · " + form.weight + " kg" : ""}` },
            { k: T("Date", "Tarehe"), v: form.transportDate || "—" },
          ].map((r) => (
            <div key={r.k}>
              <dt style={{ fontSize: 13, color: "color-mix(in srgb,var(--color-text) 72%,transparent)" }}>
                {r.k}
              </dt>
              <dd style={{ margin: "4px 0 0", fontSize: 17 }}>{r.v}</dd>
            </div>
          ))}
        </dl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40 }}>
          <a
            className="btn btn-primary"
            href={waDone}
            target="_blank"
            rel="noopener"
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 52 }}
          >
            <i className="ph-duotone ph-whatsapp-logo" aria-hidden="true" style={{ fontSize: 22 }} />
            {T("Continue on WhatsApp", "Endelea WhatsApp")}
          </a>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setForm(initial());
              setErrors({});
              setTried(false);
              setStatus("idle");
              setRefId("");
              window.scrollTo(0, 0);
            }}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 52 }}
          >
            {T("Request another", "Omba tena")}
          </button>
          <Link className="btn btn-ghost" href={pages.home} style={{ fontSize: 16, minHeight: 52 }}>
            {T("Back to home", "Rudi mwanzo")}
          </Link>
        </div>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 14,
            lineHeight: "22px",
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          {T(
            "Opens WhatsApp with your reference and shipment details filled in, so the team can pick it up straight away.",
            "Inafungua WhatsApp ikiwa na namba yako na maelezo ya mzigo, ili timu ianze mara moja."
          )}
        </p>
      </section>
    );
  }

  const nErr = Object.keys(errors).length;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "56px clamp(40px,6vw,96px)",
        alignItems: "flex-start",
      }}
    >
      <div style={{ flex: "1 1 300px", maxWidth: 420 }}>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          {T("Request a quote", "Omba bei")}
        </p>
        <h1
          style={{
            fontSize: "clamp(40px,5vw,64px)",
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            margin: "0 0 0 -0.035em",
          }}
        >
          {T("Tell us what you need to move.", "Tuambie unachohitaji kusafirisha.")}
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: "28px",
            margin: "24px 0 0",
            color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
          }}
        >
          {T(
            "Fields marked * are required. The more detail you give, the more accurate the quotation.",
            "Sehemu zenye * ni lazima. Ukitoa maelezo zaidi, bei itakuwa sahihi zaidi."
          )}
        </p>
        <p
          style={{
            margin: "40px 0 14px",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          {T("What happens next", "Kinachofuata")}
        </p>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            T("You receive an ABR reference as soon as you submit.", "Unapata namba ya ABR mara tu unapowasilisha."),
            T("The ABRIA team reviews the cargo, route and dates.", "Timu ya ABRIA inapitia mzigo, njia na tarehe."),
            T("You receive a written quotation.", "Unapokea bei kwa maandishi."),
            T("On approval, a verified carrier is assigned.", "Ukikubali, msafirishaji aliyehakikiwa anapangwa."),
          ].map((text, i) => (
            <li
              key={text}
              style={{
                display: "grid",
                gridTemplateColumns: "32px minmax(0,1fr)",
                fontSize: 16,
                lineHeight: "25px",
              }}
            >
              <span style={{ fontSize: 13, lineHeight: "25px", color: "var(--color-accent-700)" }}>
                {"0" + (i + 1)}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <p
          style={{
            margin: "36px 0 0",
            fontSize: 15,
            lineHeight: "24px",
            color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
          }}
        >
          {T("Prefer to talk?", "Unapendelea kuongea?")}{" "}
          <a
            href={wa(T("Hello ABRIA, I would like a transport quote.", "Habari ABRIA, ningependa bei ya usafiri."))}
            target="_blank"
            rel="noopener"
          >
            WhatsApp +255 723 999 039
          </a>
        </p>
      </div>

      <form
        noValidate
        onSubmit={submit}
        name="transport-request"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        style={{ flex: "3 1 520px", minWidth: 0 }}
      >
        <input type="hidden" name="form-name" value="transport-request" />
        <p style={{ display: "none" }} aria-hidden="true">
          <label>
            Don&apos;t fill this out if you&apos;re human: <input name="bot-field" />
          </label>
        </p>
        <h2
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          {T("Tell us what you need to move.", "Tuambie unachohitaji kusafirisha.")}
        </h2>
        {nErr > 0 && (
          <p
            role="alert"
            style={{
              margin: "0 0 32px",
              padding: "14px 16px",
              background: "var(--color-accent-2-100)",
              color: "var(--color-accent-2-800)",
              fontSize: 15,
              borderRadius: "var(--radius-md)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <i className="ph-duotone ph-warning-circle" aria-hidden="true" style={{ fontSize: 22 }} />
            {T(
              `Please check ${nErr} highlighted ${nErr === 1 ? "field" : "fields"}.`,
              `Tafadhali angalia sehemu ${nErr} zilizowekwa alama.`
            )}
          </p>
        )}
        <FormFields def={def} values={form} errors={errors} onChange={onField} sw={sw} />
        {status === "error" && (
          <div
            role="alert"
            style={{
              margin: "40px 0 0",
              padding: 16,
              background: "var(--color-accent-2-100)",
              color: "var(--color-accent-2-800)",
              borderRadius: "var(--radius-md)",
              fontSize: 15,
              lineHeight: "23px",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>
              {T("Your request did not go through.", "Ombi lako halikutumwa.")}
            </p>
            <p style={{ margin: "4px 0 0" }}>
              {T(
                "Nothing was lost; your answers are still here. Try again, or send the details on",
                "Hakuna kilichopotea; majibu yako bado yapo. Jaribu tena, au tuma maelezo kwa"
              )}{" "}
              <a
                href={wa("Hello ABRIA, I would like a transport quote.")}
                target="_blank"
                rel="noopener"
                style={{ color: "var(--color-accent-2-800)" }}
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 24px", marginTop: 40 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === "loading"}
            style={{ fontSize: 17, padding: "16px 28px", minHeight: 54 }}
          >
            {status === "loading" && (
              <i
                className="ph-duotone ph-truck"
                aria-hidden="true"
                style={{ fontSize: 22, animation: "abria-drive 0.7s ease-in-out infinite" }}
              />
            )}
            {status === "loading"
              ? T("Sending…", "Inatuma…")
              : T("Request Transport Quote", "Omba Bei ya Usafiri")}
          </button>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: "20px",
              maxWidth: "30em",
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            {T(
              "We use these details only to prepare your quotation and arrange transport.",
              "Tunatumia taarifa hizi kuandaa bei na kupanga usafiri tu."
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
