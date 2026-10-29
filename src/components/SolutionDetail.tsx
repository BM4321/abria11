"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { sol, pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";
import CmykFigure from "@/components/CmykFigure";
import type { SlotImage } from "@/lib/media";
import CmykNum from "@/components/CmykNum";

export default function SolutionDetail({ id, image }: { id: string; image?: SlotImage }) {
  const { sw, T, wa } = useSite();
  const s = sol(id);
  if (!s) notFound();

  const track = s.id === "track";
  const steps = s.steps.map((st, i) => ({
    n: String(i + 1).padStart(2, "0"),
    title: st[0],
    text: st[1],
  }));
  const related = s.related
    .map((rid) => sol(rid))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const ctaHref = track ? pages.track : pages.quote;
  const ctaLabel = track
    ? T("Track a shipment", "Fuatilia mzigo")
    : T("Request a Quote", "Omba Bei");
  const closeH = track
    ? T("Have an ABR reference? See where your cargo is.", "Una namba ya ABR? Ona mzigo wako ulipo.")
    : `${T("Ready to move a shipment with", "Tayari kusafirisha mzigo na")} ${s.name}?`;

  return (
    <main>
      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(40px,6vw,88px) clamp(20px,5vw,72px) 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
          gap: "48px clamp(32px,5vw,88px)",
          alignItems: "center",
        }}
      >
        <div>
          <nav
            aria-label="Breadcrumb"
            style={{
              fontSize: 14,
              marginBottom: 28,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            <Link href={pages.home}>{T("Home", "Mwanzo")}</Link>
            <span aria-hidden="true">/</span>
            <Link href={pages.solutions}>{T("Solutions", "Huduma")}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{s.name}</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <i
              className={s.iconClass}
              aria-hidden="true"
              style={{ fontSize: 44, color: "var(--color-accent)" }}
            />
            {s.soon && (
              <span className="tag tag-accent">
                {T("Coming soon", "Inakuja hivi karibuni")}
              </span>
            )}
          </div>
          <h1
            style={{
              fontSize: "clamp(44px,6vw,80px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: "20px 0 0 -0.035em",
            }}
          >
            {s.name}
          </h1>
          <p
            style={{
              fontSize: "clamp(20px,2vw,24px)",
              lineHeight: 1.4,
              fontStyle: "italic",
              maxWidth: "24em",
              margin: "20px 0 0",
            }}
          >
            {sw ? s.lineSw : s.line}
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: "26px",
              maxWidth: "32em",
              margin: "20px 0 0",
              color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
            }}
          >
            {s.audience}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
            <Link
              className="btn btn-primary"
              href={ctaHref}
              style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
            >
              {ctaLabel}
            </Link>
            <a
              className="btn btn-ghost"
              href={wa(
                T(
                  `Hello ABRIA, I have a question about ${s.name}.`,
                  `Habari ABRIA, nina swali kuhusu ${s.name}.`
                )
              )}
              target="_blank"
              rel="noopener"
              style={{ fontSize: 16, minHeight: 50 }}
            >
              <i
                className="ph-duotone ph-whatsapp-logo"
                aria-hidden="true"
                style={{ fontSize: 20 }}
              />
              {T("Ask on WhatsApp", "Uliza WhatsApp")}
            </a>
          </div>
        </div>
        <CmykFigure
          src={image?.src}
          alt={image?.alt}
          aspect="5/4"
          placeholder={T(
            `Approved photograph for ${s.name}`,
            `Picha iliyoidhinishwa kwa ${s.name}`
          )}
        />
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(80px,10vw,144px) clamp(20px,5vw,72px) 0",
        }}
      >
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-accent-2-700)",
          }}
        >
          {T("The problem", "Tatizo")}
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(30px,3.8vw,46px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "18em",
          }}
        >
          {s.problemTitle}
        </h2>
        <p
          style={{
            margin: "24px 0 0",
            fontSize: 18,
            lineHeight: "30px",
            maxWidth: "36em",
            color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
          }}
        >
          {s.problem}
        </p>
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(80px,10vw,144px) clamp(20px,5vw,72px) 0",
        }}
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
          {T("How", "Jinsi")} {s.name} {T("works", "inavyofanya kazi")}
        </p>
        <ol
          data-stagger="1"
          style={{
            listStyle: "none",
            margin: "32px 0 0",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))",
            gap: "48px 40px",
          }}
        >
          {steps.map((st) => (
            <li key={st.n}>
              <CmykNum value={st.n} fontSize={56} />
              <h3
                style={{
                  margin: "24px 0 8px",
                  fontSize: 22,
                  lineHeight: 1.2,
                }}
              >
                {st.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: "25px",
                  color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
                }}
              >
                {st.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(80px,10vw,144px) clamp(20px,5vw,72px) 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
          gap: "56px clamp(40px,7vw,120px)",
          alignItems: "start",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            {T("Key features", "Sifa muhimu")}
          </p>
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 28 }}>
            {s.features.map((f) => (
              <div key={f[0]}>
                <dt style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.25 }}>
                  {f[0]}
                </dt>
                <dd
                  style={{
                    margin: "6px 0 0",
                    fontSize: 16,
                    lineHeight: "25px",
                    color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
                  }}
                >
                  {f[1]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <figure style={{ margin: 0, paddingTop: "clamp(0px,4vw,48px)" }}>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            {T("Example workflow", "Mfano wa mchakato")}
          </p>
          <blockquote
            data-reveal="1"
            style={{
              margin: 0,
              fontStyle: "italic",
              fontSize: "clamp(22px,2.2vw,28px)",
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
            }}
          >
            {s.example}
          </blockquote>
          <figcaption style={{ marginTop: 16, fontSize: 13 }}>
            {T(
              "Illustrative scenario, not a named customer.",
              "Mfano wa kielelezo, si mteja aliyepewa jina."
            )}
          </figcaption>
        </figure>
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(80px,10vw,144px) clamp(20px,5vw,72px) 0",
        }}
      >
        <hr
          style={{
            height: 5,
            border: 0,
            margin: 0,
            borderTop: "2px solid var(--color-text)",
            borderBottom: "1px solid var(--color-text)",
          }}
        />
        <p
          style={{
            margin: 0,
            padding: "14px 0",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          {T("Works with", "Inafanya kazi na")}
        </p>
        <hr
          style={{ height: 0, border: 0, borderTop: "1px solid var(--color-text)", margin: 0 }}
        />
        <div
          data-stagger="1"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
            gap: "32px 64px",
            paddingTop: 32,
          }}
        >
          {related.map((r) => (
            <Link
              key={r.id}
              href={r.href}
              style={{
                display: "flex",
                gap: 16,
                color: "var(--color-text)",
                textDecoration: "none",
              }}
            >
              <i
                className={r.iconClass}
                aria-hidden="true"
                style={{ fontSize: 30, color: "var(--color-accent)", flex: "none" }}
              />
              <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 600 }}>{r.name} →</span>
                <span
                  style={{
                    fontSize: 15,
                    lineHeight: "23px",
                    color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
                  }}
                >
                  {sw ? r.lineSw : r.line}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(88px,11vw,160px) clamp(20px,5vw,72px) 0",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(30px,4vw,48px)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: "15em",
          }}
        >
          {closeH}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
          <Link
            className="btn btn-primary"
            href={ctaHref}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {ctaLabel}
          </Link>
          <Link
            className="btn btn-secondary"
            href={pages.solutions}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {T("All solutions", "Huduma zote")}
          </Link>
        </div>
      </section>
    </main>
  );
}
