"use client";

import { useState } from "react";
import Link from "next/link";
import { pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";
import FormFields from "@/components/forms/FormFields";
import { inputFields, validateSubmission, type FormDef, type SubmissionValue, type SubmissionValues } from "@/lib/forms/schema";
import CmykFigure from "@/components/CmykFigure";
import type { SlotImage } from "@/lib/media";

const str = (v: SubmissionValue | undefined) => (Array.isArray(v) ? v.join(", ") : v ?? "");

export default function RegisterTruckForm({ image, def }: { image?: SlotImage; def: FormDef }) {
  const { sw, T, wa } = useSite();
  const [form, setForm] = useState<SubmissionValues>({});
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
      const res = await fetch("/api/partners", {
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
          "form-name": "truck-registration",
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
      setRefId(data.partnerId);
      setStatus("success");
      window.scrollTo(0, 0);
    } catch {
      setStatus("error");
    }
  };

  const waDone = wa(
    sw
      ? `Habari ABRIA, nimesajili lori langu.\nNamba ya mshirika: ${refId}\nLori: ${form.truckType || ""} ${form.registrationNumber || ""}\nNjia: ${form.routesCovered || ""}\nJina: ${form.contactPerson || ""}`
      : `Hello ABRIA, I have just registered my truck.\nPartner ID: ${refId}\nTruck: ${form.truckType || ""} ${form.registrationNumber || ""}\nRoutes: ${form.routesCovered || ""}\nName: ${form.contactPerson || ""}`
  );

  if (status === "success") {
    return (
      <section aria-live="polite" style={{ maxWidth: 760 }}>
        <i
          className="ph-duotone ph-truck"
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
          {T("Registration received.", "Usajili umepokelewa.")}
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
            "The ABRIA team will review your details, verify your vehicle and contact you. Once verified, jobs that fit your truck will be assigned to you.",
            "Timu ya ABRIA itapitia taarifa zako, kuhakiki gari lako na kuwasiliana nawe. Ukishahakikiwa, kazi zinazolingana na lori lako zitapewa kwako."
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
            {T("Your ABRIA partner ID", "Namba yako ya mshirika wa ABRIA")}
          </span>
          <span
            style={{
              fontSize: "clamp(28px,4vw,40px)",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {refId}
          </span>
        </div>
        <hr
          style={{ height: 0, border: 0, borderTop: "1px solid var(--color-text)", margin: 0 }}
        />
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
              setForm({});
              setErrors({});
              setTried(false);
              setStatus("idle");
              setRefId("");
              window.scrollTo(0, 0);
            }}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 52 }}
          >
            {T("Register another truck", "Sajili lori jingine")}
          </button>
          <Link className="btn btn-ghost" href={pages.carriers} style={{ fontSize: 16, minHeight: 52 }}>
            {T("About carrying with ABRIA", "Kuhusu kusafirisha na ABRIA")}
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
            "Opens WhatsApp with your partner ID and truck details filled in.",
            "Inafungua WhatsApp ikiwa na namba yako na maelezo ya lori."
          )}
        </p>
      </section>
    );
  }

  const nErr = Object.keys(errors).length;
  const rail = sw
    ? ["01 Jisajili", "02 Hakikiwa", "03 Pokea kazi", "04 Safirisha"]
    : ["01 Register", "02 Get verified", "03 Receive jobs", "04 Transport"];

  return (
    <div>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
          gap: "40px clamp(32px,5vw,88px)",
          alignItems: "end",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            {T("Register your truck", "Sajili lori lako")}
          </p>
          <h1
            style={{
              fontSize: "clamp(44px,6.4vw,88px)",
              lineHeight: 1,
              letterSpacing: "-0.025em",
              margin: "0 0 0 -0.035em",
            }}
          >
            {T("Join the ABRIA carrier network.", "Jiunge na mtandao wa wasafirishaji wa ABRIA.")}
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: "30px",
              maxWidth: "30em",
              margin: "24px 0 0",
              color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
            }}
          >
            {T(
              "Register once. After the ABRIA team verifies your vehicle, you receive transport jobs that fit your truck and the routes you already drive.",
              "Jisajili mara moja. Timu ya ABRIA ikishahakiki gari lako, utapokea kazi za usafiri zinazolingana na lori lako na njia unazotumia."
            )}
          </p>
        </div>
        <CmykFigure
          src={image?.src}
          alt={image?.alt}
          aspect="16/10"
          placeholder={T(
            "Approved photograph: truck owner with vehicle",
            "Picha iliyoidhinishwa: mmiliki wa lori na gari lake"
          )}
        />
      </section>

      <div style={{ position: "relative" }}>
        <span
          data-drive="1"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            bottom: "100%",
            marginBottom: 1,
            display: "flex",
            color: "var(--color-accent)",
          }}
        >
          <i className="ph-duotone ph-truck" style={{ fontSize: 34 }} />
        </span>
        <hr
          style={{
            height: 5,
            border: 0,
            margin: "clamp(48px,6vw,80px) 0 0",
            borderTop: "2px solid var(--color-text)",
            borderBottom: "1px solid var(--color-text)",
          }}
        />
      </div>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: "14px 0",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 32px",
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
        }}
      >
        {rail.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
      <hr
        style={{ height: 0, border: 0, borderTop: "1px solid var(--color-text)", margin: 0 }}
      />

      <form
        noValidate
        onSubmit={submit}
        name="truck-registration"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        aria-label={T("Join the ABRIA carrier network.", "Jiunge na mtandao wa wasafirishaji wa ABRIA.")}
        style={{ maxWidth: 860, marginTop: "clamp(48px,6vw,80px)" }}
      >
        <input type="hidden" name="form-name" value="truck-registration" />
        <p style={{ display: "none" }} aria-hidden="true">
          <label>
            Don&apos;t fill this out if you&apos;re human: <input name="bot-field" />
          </label>
        </p>
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
        <p
          style={{
            margin: "32px 0 0",
            fontSize: 14,
            lineHeight: "22px",
            color: "color-mix(in srgb,var(--color-text) 75%,transparent)",
          }}
        >
          {T(
            "You do not need to upload documents here. If verification needs your vehicle papers, the team will ask for them directly.",
            "Huhitaji kupakia nyaraka hapa. Ikiwa uhakiki utahitaji nyaraka za gari, timu itakuomba moja kwa moja."
          )}
        </p>
        {status === "error" && (
          <div
            role="alert"
            style={{
              margin: "32px 0 0",
              padding: 16,
              background: "var(--color-accent-2-100)",
              color: "var(--color-accent-2-800)",
              borderRadius: "var(--radius-md)",
              fontSize: 15,
              lineHeight: "23px",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>
              {T("Your registration did not go through.", "Usajili wako haukutumwa.")}
            </p>
            <p style={{ margin: "4px 0 0" }}>
              {T(
                "Your answers are still here. Try again, or send your details on",
                "Majibu yako bado yapo. Jaribu tena, au tuma taarifa zako kwa"
              )}{" "}
              <a
                href={wa("Hello ABRIA, I have a truck and would like to register.")}
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
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 24px", marginTop: 36 }}>
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
            {status === "loading" ? T("Sending…", "Inatuma…") : T("Register Your Truck", "Sajili Lori Lako")}
          </button>
          <a
            href={wa(T("Hello ABRIA, I have a truck and would like to register.", "Habari ABRIA, nina lori na ningependa kujisajili."))}
            target="_blank"
            rel="noopener"
            style={{ fontSize: 15 }}
          >
            {T("Or register on WhatsApp", "Au jisajili kwa WhatsApp")}
          </a>
        </div>
      </form>
    </div>
  );
}
