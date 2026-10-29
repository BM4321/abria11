"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { solutions, pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";
import CmykFigure, { Rail } from "@/components/CmykFigure";
import type { SlotImage } from "@/lib/media";

export default function Home({ image }: { image?: SlotImage }) {
  const { sw, T, wa, contact: CONTACT } = useSite();
  const [narrow, setNarrow] = useState(false);
  const [showPlaceholders] = useState(true);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 720);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const num = (arr: string[]) =>
    arr.map((text, i) => ({ n: String(i + 1).padStart(2, "0"), text }));

  const index = showPlaceholders
    ? [
        { label: T("Transport requests", "Maombi ya usafiri"), value: "—", pending: true, tag: T("Unverified", "Haijathibitishwa") },
        { label: T("Quotes delivered", "Bei zilizotolewa"), value: "—", pending: true, tag: T("Unverified", "Haijathibitishwa") },
        { label: T("Completed deliveries", "Safari zilizokamilika"), value: "—", pending: true, tag: T("Unverified", "Haijathibitishwa") },
        { label: T("Regions served", "Mikoa inayohudumiwa"), value: "—", pending: true, tag: T("Unverified", "Haijathibitishwa") },
      ]
    : [
        { label: T("Every request gets its own reference", "Kila ombi lina namba yake"), value: "ABR-ID", pending: false, tag: "" },
        { label: T("Written quotation before you commit", "Bei kwa maandishi kabla ya kuamua"), value: T("Yes", "Ndiyo"), pending: false, tag: "" },
        { label: T("Carriers reviewed before first job", "Wasafirishaji huhakikiwa kwanza"), value: T("Yes", "Ndiyo"), pending: false, tag: "" },
        { label: T("Built in", "Imejengwa"), value: "Tanzania", pending: false, tag: "" },
      ];

  const dateline = sw
    ? ["Tanzania", "Uratibu wa usafiri wa mizigo", "Omba → Linganisha → Safirisha → Thibitisha"]
    : ["Tanzania", "Road freight coordination", "Request → Match → Move → Confirm"];

  const shipItems = num(
    sw
      ? [
          "Omba usafiri mtandaoni kwa dakika chache",
          "Pokea bei kwa maandishi kutoka kwa timu ya ABRIA",
          "Unganishwa na msafirishaji aliyehakikiwa",
          "Fuatilia ombi lako kwa namba ya ABR",
          "Uthibitisho wa kufikishwa mzigo unapofika",
        ]
      : [
          "Request transport online in a few minutes",
          "Receive a written quotation from the ABRIA team",
          "Get matched with a verified carrier",
          "Follow your request by its ABR reference",
          "Proof of delivery when your goods arrive",
        ]
  );

  const carItems = num(
    sw
      ? [
          "Sajili lori moja au kundi la magari",
          "Hakikiwa na timu ya ABRIA",
          "Pokea kazi za usafiri kwenye njia zako",
          "Pata wateja zaidi, punguza safari tupu",
        ]
      : [
          "Register one truck or a whole fleet",
          "Get verified by the ABRIA team",
          "Receive transport jobs on your routes",
          "Reach more customers, run fewer empty trips",
        ]
  );

  const steps = sw
    ? [
        { n: "01", title: "Omba", text: "Tuambie unachosafirisha na kinakoenda." },
        { n: "02", title: "Panga", text: "Unganishwa na lori, njia na bei sahihi." },
        { n: "03", title: "Safirisha", text: "Mzigo wako unachukuliwa na kusafirishwa kwa ratiba." },
        { n: "04", title: "Thibitisha", text: "Fuatilia na uthibitishe mzigo umefika salama." },
      ]
    : [
        { n: "01", title: "Request", text: "Tell us what you need to move and where it's going." },
        { n: "02", title: "Plan", text: "Get matched with the right truck, route, and quote." },
        { n: "03", title: "Move", text: "Your shipment is picked up and transported on schedule." },
        { n: "04", title: "Confirm", text: "Track delivery and confirm your goods arrived safely." },
      ];

  const heroTitle = sw
    ? ["Usafirishaji Uliounganishwa.", "Mwendo Bora."]
    : ["Connected Logistics.", "Better Movement."];
  const heroSub = sw
    ? "ABRIA inaunganisha biashara na wamiliki wa mizigo na watoa huduma za usafiri wanaoaminika, ili kila mzigo upate lori, njia na mshirika sahihi."
    : "ABRIA connects businesses and cargo owners with reliable transport providers, helping every shipment find the right truck, route, and partner.";

  return (
    <main>
      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding:
            "clamp(48px,8vw,112px) clamp(20px,5vw,72px) clamp(40px,5vw,64px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))",
          gap: "56px clamp(32px,5vw,88px)",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(44px,6.4vw,84px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              margin: "0 0 0 -0.035em",
            }}
          >
            {heroTitle.map((line) => (
              <span
                key={line}
                className="cmyk-head"
                style={{ display: "block" }}
              >
                <span className="paper">{line}</span>
                <span className="plate plate-c" aria-hidden="true">
                  {line}
                </span>
                <span className="plate plate-m" aria-hidden="true">
                  {line}
                </span>
                <span className="plate plate-y" aria-hidden="true">
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: "30px",
              maxWidth: "32em",
              margin: "32px 0 0",
              color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
            }}
          >
            {heroSub}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 36,
            }}
          >
            <Link
              className="btn btn-primary"
              href={pages.quote}
              style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
            >
              {T("Request a Quote", "Omba Bei")}
            </Link>
            <Link
              className="btn btn-secondary"
              href={pages.truck}
              style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
            >
              {T("I Have a Truck", "Nina Lori")}
            </Link>
          </div>
          <p
            style={{
              margin: "20px 0 0",
              fontSize: 14,
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            {T("Or message us on WhatsApp:", "Au tuandikie WhatsApp:")}{" "}
            <a
              href={wa(
                T(
                  "Hello ABRIA, I would like to request transport.",
                  "Habari ABRIA, ningependa kuomba usafiri."
                )
              )}
              target="_blank"
              rel="noopener"
            >
              {CONTACT.phone}
            </a>
          </p>
        </div>
        <CmykFigure
          src={image?.src}
          alt={image?.alt}
          aspect="4/5"
          placeholder={T(
            "Approved photograph: loaded truck on a Tanzanian trunk road",
            "Picha iliyoidhinishwa: lori lililopakiwa barabara kuu ya Tanzania"
          )}
        />
      </section>

      <section
        aria-label={T("ABRIA at a glance", "ABRIA kwa ufupi")}
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "48px clamp(20px,5vw,72px) 24px",
        }}
      >
        <Rail />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "10px 28px",
            padding: "14px 0",
            fontSize: 13,
            lineHeight: "18px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          {dateline.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <hr
          style={{ height: 0, border: 0, borderTop: "1px solid var(--color-text)", margin: 0 }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))",
            gap: "2px 72px",
            padding: "18px 0 20px",
          }}
        >
          {index.map((s) => (
            <p
              key={s.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                margin: 0,
                fontSize: 16,
                lineHeight: "34px",
              }}
            >
              <span style={{ flex: "none", whiteSpace: "nowrap" }}>{s.label}</span>
              <span
                aria-hidden="true"
                style={{
                  flex: 1,
                  minWidth: 24,
                  alignSelf: "flex-end",
                  marginBottom: "0.55em",
                  borderBottom:
                    "1px dotted color-mix(in srgb,var(--color-text) 45%,transparent)",
                }}
              />
              {s.pending && (
                <span className="tag tag-accent-2" style={{ alignSelf: "center" }}>
                  {s.tag}
                </span>
              )}
              <span style={{ fontWeight: 600, fontSize: 18 }}>{s.value}</span>
            </p>
          ))}
        </div>
        <hr
          style={{ height: 0, border: 0, borderTop: "1px solid var(--color-text)", margin: 0 }}
        />
        {showPlaceholders && (
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 13,
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            {T(
              "Figures are published here once verified against ABRIA request records.",
              "Takwimu zitachapishwa hapa baada ya kuthibitishwa na kumbukumbu za ABRIA."
            )}
          </p>
        )}
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(64px,9vw,128px) clamp(20px,5vw,72px) 0",
        }}
      >
        <p
          style={{
            margin: "0 0 28px",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          {T("One platform, two sides", "Jukwaa moja, pande mbili")}
        </p>
        <div
          data-stagger="1"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
            gap: "64px clamp(40px,7vw,120px)",
            alignItems: "start",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 14,
                color: "var(--color-accent-700)",
              }}
            >
              {T("For businesses and cargo owners", "Kwa biashara na wamiliki wa mizigo")}
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(32px,4vw,48px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                maxWidth: "14em",
              }}
            >
              {T("Move your goods with confidence.", "Safirisha mizigo yako kwa uhakika.")}
            </h2>
            <ul
              style={{
                listStyle: "none",
                margin: "32px 0 0",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {shipItems.map((it) => (
                <li
                  key={it.n}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px minmax(0,1fr)",
                    fontSize: 18,
                    lineHeight: "28px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      lineHeight: "28px",
                      color: "var(--color-accent-700)",
                      fontFeatureSettings: "'tnum' 1",
                    }}
                  >
                    {it.n}
                  </span>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 36,
              }}
            >
              <Link
                className="btn btn-primary"
                href={pages.quote}
                style={{ fontSize: 15, minHeight: 46, paddingInline: 22 }}
              >
                {T("Request Transport", "Omba Usafiri")}
              </Link>
              <Link
                className="btn btn-ghost"
                href={pages.shippers}
                style={{ fontSize: 15, minHeight: 46 }}
              >
                {T("How it works for businesses", "Jinsi inavyofanya kazi kwa biashara")} →
              </Link>
            </div>
          </div>
          <div style={{ paddingTop: "clamp(0px,4vw,56px)" }}>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 14,
                color: "var(--color-accent-700)",
              }}
            >
              {T(
                "For truck owners and transport providers",
                "Kwa wamiliki wa malori na watoa huduma"
              )}
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(26px,3vw,34px)",
                lineHeight: 1.12,
                letterSpacing: "-0.015em",
              }}
            >
              {T("Keep your trucks moving.", "Malori yako yaendelee kufanya kazi.")}
            </h2>
            <ul
              style={{
                listStyle: "none",
                margin: "28px 0 0",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {carItems.map((it) => (
                <li
                  key={it.n}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px minmax(0,1fr)",
                    fontSize: 17,
                    lineHeight: "26px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      lineHeight: "26px",
                      color: "var(--color-accent-700)",
                      fontFeatureSettings: "'tnum' 1",
                    }}
                  >
                    {it.n}
                  </span>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 32,
              }}
            >
              <Link
                className="btn btn-secondary"
                href={pages.truck}
                style={{ fontSize: 15, minHeight: 46, paddingInline: 22 }}
              >
                {T("Register Your Truck", "Sajili Lori Lako")}
              </Link>
              <Link
                className="btn btn-ghost"
                href={pages.carriers}
                style={{ fontSize: 15, minHeight: 46 }}
              >
                {T("Why carriers join", "Kwa nini ujiunge")} →
              </Link>
            </div>
          </div>
        </div>
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
          {T("Solutions", "Huduma")}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "16px 40px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(30px,3.6vw,44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "16em",
            }}
          >
            {T(
              "Everything you need to move goods.",
              "Kila unachohitaji kusafirisha mizigo."
            )}
          </h2>
          <Link href={pages.solutions} style={{ fontSize: 15 }}>
            {T("All solutions", "Huduma zote")} →
          </Link>
        </div>
        <div
          data-stagger="1"
          style={{
            display: narrow ? "flex" : "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
            gap: narrow ? 16 : 24,
            overflowX: narrow ? "auto" : "visible",
            scrollSnapType: narrow ? "x mandatory" : undefined,
            scrollPaddingInline: "clamp(20px,5vw,72px)",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            margin: narrow
              ? `40px calc(-1 * clamp(20px,5vw,72px)) 0`
              : "40px 0 0",
            padding: narrow
              ? `8px clamp(20px,5vw,72px) 24px`
              : "8px 0 24px",
          }}
        >
          {solutions.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              data-ripple="1"
              style={{
                flex: narrow ? "0 0 min(80%,300px)" : undefined,
                scrollSnapAlign: narrow ? "start" : undefined,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 28,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
                color: "var(--color-text)",
                textDecoration: "none",
                transition: "box-shadow .22s ease, transform .22s ease",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <i
                  className={s.iconClass}
                  aria-hidden="true"
                  style={{ fontSize: 30, color: "var(--color-accent)" }}
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
              </span>
              <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>
                {s.name}
              </span>
              <span
                style={{
                  fontSize: 16,
                  lineHeight: "25px",
                  color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
                  flex: 1,
                }}
              >
                {sw ? s.lineSw : s.line}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--color-accent-700)",
                }}
              >
                {T("Learn more", "Soma zaidi")}
                <i className="ph ph-arrow-right" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
        {narrow && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "color-mix(in srgb,var(--color-text) 70%,transparent)",
            }}
          >
            <i className="ph ph-hand-swipe-left" aria-hidden="true" style={{ fontSize: 18 }} />
            {T("Swipe to see all six", "Telezesha kuona zote sita")}
          </p>
        )}
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
          {T("How it works", "Jinsi inavyofanya kazi")}
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(30px,3.6vw,44px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "16em",
          }}
        >
          {T(
            "From request to delivery in four steps.",
            "Kutoka ombi hadi kufikishwa kwa hatua nne."
          )}
        </h2>
        <ol
          data-stagger="1"
          style={{
            listStyle: "none",
            margin: "56px 0 0",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))",
            gap: "48px 40px",
          }}
        >
          {steps.map((st) => (
            <li key={st.n}>
              <div
                className="cmyk-num"
                style={{ fontSize: 64, fontWeight: 600 }}
              >
                <span className="paper">{st.n}</span>
                <span className="plate plate-c" aria-hidden="true">
                  {st.n}
                </span>
                <span className="plate plate-m" aria-hidden="true">
                  {st.n}
                </span>
                <span className="plate plate-y" aria-hidden="true">
                  {st.n}
                </span>
              </div>
              <h3 style={{ margin: "28px 0 8px", fontSize: 24 }}>{st.title}</h3>
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
        <p style={{ margin: "40px 0 0" }}>
          <Link href={pages.how} style={{ fontSize: 15 }}>
            {T("See the full process", "Angalia mchakato mzima")} →
          </Link>
        </p>
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(88px,11vw,160px) clamp(20px,5vw,72px) 0",
        }}
      >
        <figure style={{ margin: 0 }}>
          <blockquote
            data-reveal="1"
            style={{
              margin: 0,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(26px,3vw,38px)",
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
              maxWidth: "30ch",
              textIndent: "-0.45em",
            }}
          >
            {T(
              "“We started ABRIA because moving goods shouldn’t be complicated. Our mission is to connect every shipment with the right partner — simply, reliably, and transparently.”",
              "“Tulianzisha ABRIA kwa sababu kusafirisha mizigo hakupaswi kuwa jambo gumu. Dhamira yetu ni kuunganisha kila mzigo na mshirika sahihi — kwa urahisi, uhakika na uwazi.”"
            )}
          </blockquote>
          <figcaption
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
              marginTop: 32,
              fontSize: 16,
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            <span>
              — {T("[Founder name]", "[Jina la mwanzilishi]")}, Founder &amp; CEO
            </span>
            {showPlaceholders && (
              <span className="tag tag-accent-2">{T("Add founder name", "Weka jina")}</span>
            )}
          </figcaption>
        </figure>
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
            fontSize: "clamp(32px,4.4vw,56px)",
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            maxWidth: "14em",
          }}
        >
          {T("Have something to move?", "Una mzigo wa kusafirisha?")}
        </h2>
        <p
          style={{
            margin: "20px 0 0",
            fontSize: 18,
            lineHeight: "28px",
            maxWidth: "34em",
            color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
          }}
        >
          {T(
            "Tell us what it is and where it’s going. The ABRIA team reviews every request and comes back to you with a quotation.",
            "Tuambie ni nini na kinakoenda wapi. Timu ya ABRIA hupitia kila ombi na kukurudia na bei."
          )}
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}
        >
          <Link
            className="btn btn-primary"
            href={pages.quote}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {T("Request a Quote", "Omba Bei")}
          </Link>
          <a
            className="btn btn-secondary"
            href={wa(
              T(
                "Hello ABRIA, I have a question.",
                "Habari ABRIA, nina swali."
              )
            )}
            target="_blank"
            rel="noopener"
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            <i
              className="ph-duotone ph-whatsapp-logo"
              aria-hidden="true"
              style={{ fontSize: 20, color: "var(--color-accent)" }}
            />
            {T("Chat on WhatsApp", "Tuandikie WhatsApp")}
          </a>
        </div>
      </section>
    </main>
  );
}
