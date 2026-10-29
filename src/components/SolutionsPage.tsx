"use client";

import Link from "next/link";
import { solutions, pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";

export default function SolutionsPage() {
  const { sw, T } = useSite();

  return (
    <main>
      <section
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
          {T("Solutions", "Huduma")}
        </p>
        <h1
          style={{
            fontSize: "clamp(40px,5.6vw,72px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: "0 0 0 -0.035em",
            maxWidth: "13em",
          }}
        >
          {T(
            "Six services for moving goods by road.",
            "Huduma sita za kusafirisha mizigo kwa barabara."
          )}
        </h1>
        <p
          style={{
            fontSize: 19,
            lineHeight: "30px",
            maxWidth: "34em",
            margin: "28px 0 0",
            color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
          }}
        >
          {T(
            "Each ABRIA service covers one part of a shipment: getting it collected, moving it, matching it to the right truck, and knowing where it is. Most shipments use more than one.",
            "Kila huduma ya ABRIA inashughulikia sehemu moja ya mzigo: kuchukuliwa, kusafirishwa, kuunganishwa na lori sahihi, na kujua ulipo. Mizigo mingi hutumia zaidi ya moja."
          )}
        </p>
      </section>

      <section
        aria-label={T("How the services fit together", "Jinsi huduma zinavyofanya kazi pamoja")}
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(56px,7vw,96px) clamp(20px,5vw,72px) 0",
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
            gap: "32px 48px",
            padding: "28px 0 32px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
              }}
            >
              {T("Shippers request", "Wateja wanaomba")}
            </p>
            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.5, fontWeight: 600 }}>
              AB Pickup
              <br />
              AB Cargo
              <br />
              AB Express
              <br />
              AB Business
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-accent-700)",
              }}
            >
              {T("ABRIA connects", "ABRIA inaunganisha")}
            </p>
            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.5, fontWeight: 600 }}>
              AB Match
              <br />
              AB Track
            </p>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 15,
                lineHeight: "24px",
                color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
              }}
            >
              {T(
                "Matching and visibility sit underneath every shipment.",
                "Uunganishaji na uonekano viko chini ya kila mzigo."
              )}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
              }}
            >
              {T("Carriers deliver", "Wasafirishaji wanafikisha")}
            </p>
            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.5, fontWeight: 600 }}>
              {T("Registered, verified trucks", "Malori yaliyosajiliwa na kuhakikiwa")}
            </p>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 15,
                lineHeight: "24px",
                color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
              }}
            >
              {T(
                "Carriers join once and receive jobs that fit their vehicles and routes.",
                "Wasafirishaji hujiunga mara moja na kupokea kazi zinazolingana na magari na njia zao."
              )}{" "}
              <Link href={pages.carriers}>{T("For carriers", "Kwa wasafirishaji")} →</Link>
            </p>
          </div>
        </div>
        <hr
          style={{ height: 0, border: 0, borderTop: "1px solid var(--color-text)", margin: 0 }}
        />
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(56px,7vw,96px) clamp(20px,5vw,72px) 0",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(48px,6vw,80px)",
        }}
      >
        {solutions.map((s) => (
          <article
            key={s.id}
            data-reveal="1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))",
              gap: "20px clamp(32px,6vw,96px)",
              alignItems: "start",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <i
                  className={s.iconClass}
                  aria-hidden="true"
                  style={{ fontSize: 36, color: "var(--color-accent)" }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: "color-mix(in srgb,var(--color-text) 60%,transparent)",
                    fontFeatureSettings: "'tnum' 1",
                  }}
                >
                  {s.n}
                </span>
                {s.soon && (
                  <span className="tag tag-accent">
                    {T("Coming soon", "Inakuja hivi karibuni")}
                  </span>
                )}
              </div>
              <h2
                style={{
                  margin: "16px 0 0",
                  fontSize: "clamp(28px,3vw,38px)",
                  letterSpacing: "-0.015em",
                }}
              >
                {s.name}
              </h2>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 18,
                  lineHeight: "28px",
                  fontStyle: "italic",
                }}
              >
                {sw ? s.lineSw : s.line}
              </p>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: "26px",
                  color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
                }}
              >
                {s.problem}
              </p>
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 14,
                  lineHeight: "22px",
                  color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
                }}
              >
                <span
                  style={{
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    fontSize: 12,
                  }}
                >
                  {T("For", "Kwa")}
                </span>{" "}
                — {s.audience}
              </p>
              <p style={{ margin: "18px 0 0" }}>
                <Link href={s.href} style={{ fontSize: 15 }}>
                  {T("How", "Jinsi")} {s.name} {T("works", "inavyofanya kazi")} →
                </Link>
              </p>
            </div>
          </article>
        ))}
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
          {T("Not sure which service you need?", "Hujui huduma ipi unayohitaji?")}
        </h2>
        <p
          style={{
            margin: "18px 0 0",
            fontSize: 18,
            lineHeight: "28px",
            maxWidth: "34em",
            color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
          }}
        >
          {T(
            "Describe the shipment. The ABRIA team will choose the right combination and send you a quotation.",
            "Eleza mzigo. Timu ya ABRIA itachagua mchanganyiko sahihi na kukutumia bei."
          )}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
          <Link
            className="btn btn-primary"
            href={pages.quote}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {T("Request a Quote", "Omba Bei")}
          </Link>
          <Link
            className="btn btn-secondary"
            href={pages.contact}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {T("Talk to the team", "Ongea na timu")}
          </Link>
        </div>
      </section>
    </main>
  );
}
