"use client";

import Link from "next/link";
import { pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";

const VALUES = [
  { t: "Reliability", d: "We confirm what we can deliver before we commit to it." },
  { t: "Transparency", d: "Written quotations, a named carrier and a reference number on every shipment." },
  { t: "Efficiency", d: "Fewer calls to arrange a load, fewer empty kilometres for trucks." },
  { t: "Accountability", d: "Every stage of a job is recorded, from request to proof of delivery." },
  { t: "Innovation", d: "Practical tools that remove paperwork and guesswork from transport." },
  { t: "Partnership", d: "Carriers and shippers both need to win for the network to work." },
];

export default function About() {
  const { T } = useSite();
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
          {T("About ABRIA", "Kuhusu ABRIA")}
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
          {T("Built to move what matters.", "Imejengwa kusafirisha kilicho muhimu.")}
        </h1>
        <p
          style={{
            fontSize: "clamp(19px,1.8vw,22px)",
            lineHeight: 1.5,
            maxWidth: "34em",
            margin: "32px 0 0",
            color: "color-mix(in srgb,var(--color-text) 85%,transparent)",
          }}
        >
          {T(
            "ABRIA Logistics is a connected transport platform that brings shippers and carriers together in one place. We make it simple to request transport, compare quotes, and track every delivery — so businesses can move goods with confidence and carriers can keep their trucks moving.",
            "ABRIA Logistics ni jukwaa la usafiri lililounganishwa linalowaleta pamoja wateja na wasafirishaji mahali pamoja. Tunafanya iwe rahisi kuomba usafiri, kulinganisha bei, na kufuatilia kila usafirishaji — ili biashara zisafirishe mizigo kwa uhakika na wasafirishaji waendelee kufanya kazi."
          )}
        </p>
      </section>
      <figure
        data-reveal="1"
        className="cmyk"
        style={{
          maxWidth: "var(--page-max)",
          margin: "clamp(56px,7vw,96px) auto 0",
          padding: "0 clamp(20px,5vw,72px)",
          overflow: "visible",
        }}
      >
        <div className="print" style={{ aspectRatio: "21/9" }}>
          <div
            role="img"
            aria-label={T(
              "Approved photograph: ABRIA team or operations",
              "Picha iliyoidhinishwa: timu ya ABRIA au uendeshaji"
            )}
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 16,
              background: "var(--color-surface)",
              color: "color-mix(in srgb,var(--color-text) 60%,transparent)",
              fontSize: 13,
              borderRadius: "var(--radius-lg)",
            }}
          >
            {T(
              "Approved photograph: ABRIA team or operations",
              "Picha iliyoidhinishwa: timu ya ABRIA au uendeshaji"
            )}
          </div>
        </div>
      </figure>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(80px,10vw,144px) clamp(20px,5vw,72px) 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
          gap: "48px clamp(40px,7vw,120px)",
        }}
      >
        <div>
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
              fontSize: "clamp(28px,3.2vw,40px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {T(
              "Cargo and trucks that cannot find each other.",
              "Mizigo na malori yanayoshindwa kukutana."
            )}
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            fontSize: 17,
            lineHeight: "28px",
            color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
          }}
        >
          <p style={{ margin: 0 }}>
            {T(
              "Most road freight is still arranged by phone. A cargo owner calls the transporters they know, prices change between calls, and the only record of the job lives in a chat thread.",
              "Mizigo mingi bado hupangwa kwa simu. Mmiliki wa mzigo hupiga simu kwa wasafirishaji anaowajua, bei hubadilika kati ya simu, na kumbukumbu pekee ya kazi iko kwenye ujumbe."
            )}
          </p>
          <p style={{ margin: 0 }}>
            {T(
              "On the other side, truck owners drive back empty because they cannot see the loads waiting on their route. Capacity exists; it is just not visible to the people who need it.",
              "Kwa upande mwingine, wamiliki wa malori hurudi tupu kwa sababu hawaoni mizigo inayosubiri kwenye njia yao. Uwezo upo; hauonekani kwa wanaouhitaji."
            )}
          </p>
          <p style={{ margin: 0 }}>
            {T(
              "ABRIA puts both sides in one system: a request with a reference number, a register of verified carriers, and a status history for every shipment.",
              "ABRIA huweka pande zote mbili kwenye mfumo mmoja: ombi lenye namba ya kumbukumbu, rejista ya wasafirishaji waliothibitishwa, na historia ya hali kwa kila mzigo."
            )}
          </p>
        </div>
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))",
            gap: "32px 72px",
            padding: "32px 0 36px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
              }}
            >
              {T("Our mission", "Dhamira yetu")}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "clamp(22px,2.2vw,28px)",
                lineHeight: 1.35,
                fontStyle: "italic",
              }}
            >
              {T(
                "To connect every shipment with the right partner — simply, reliably, and transparently.",
                "Kuunganisha kila mzigo na mshirika sahihi — kwa urahisi, uhakika na uwazi."
              )}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
              }}
            >
              {T("Our vision", "Maono yetu")}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "clamp(22px,2.2vw,28px)",
                lineHeight: 1.35,
                fontStyle: "italic",
                color: "color-mix(in srgb,var(--color-text) 60%,transparent)",
              }}
            >
              [Vision statement to be written by ABRIA]
            </p>
            <span className="tag tag-accent-2" style={{ marginTop: 12 }}>
              {T("To confirm", "Kuthibitishwa")}
            </span>
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
          {T("Our values", "Maadili yetu")}
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
          {T("What you can hold us to.", "Unachoweza kututarajia.")}
        </h2>
        <dl
          data-stagger="1"
          style={{
            margin: "48px 0 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
            gap: "40px clamp(32px,4vw,64px)",
          }}
        >
          {VALUES.map((v) => (
            <div key={v.t}>
              <dt style={{ fontSize: 24, fontWeight: 600 }}>{v.t}</dt>
              <dd
                style={{
                  margin: "8px 0 0",
                  fontSize: 16,
                  lineHeight: "25px",
                  color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
                }}
              >
                {v.d}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(80px,10vw,144px) clamp(20px,5vw,72px) 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
          gap: "48px clamp(40px,7vw,120px)",
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
            {T("Leadership", "Uongozi")}
          </p>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 140, flex: "none" }}>
              <div
                role="img"
                aria-label={T("Founder portrait", "Picha ya mwanzilishi")}
                style={{
                  aspectRatio: "4/5",
                  width: 140,
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  padding: 12,
                  background: "var(--color-surface)",
                  color: "color-mix(in srgb,var(--color-text) 60%,transparent)",
                  fontSize: 12,
                  borderRadius: "var(--radius-lg)",
                }}
              >
                {T("Founder portrait", "Picha ya mwanzilishi")}
              </div>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
                [Founder name]
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 16,
                  color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
                }}
              >
                Founder &amp; CEO
              </p>
              <span className="tag tag-accent-2" style={{ marginTop: 12 }}>
                {T("Add real name, photo and short bio", "Ongeza jina, picha na wasifu mfupi")}
              </span>
            </div>
          </div>
          <blockquote
            style={{
              margin: "32px 0 0",
              fontStyle: "italic",
              fontSize: "clamp(20px,2vw,24px)",
              lineHeight: 1.45,
              textIndent: "-0.45em",
            }}
          >
            {T(
              "“We started ABRIA because moving goods shouldn't be complicated. Our mission is to connect every shipment with the right partner — simply, reliably, and transparently.”",
              "“Tulianzisha ABRIA kwa sababu kusafirisha mizigo hakupaswi kuwa jambo gumu. Dhamira yetu ni kuunganisha kila mzigo na mshirika sahihi — kwa urahisi, uhakika na uwazi.”"
            )}
          </blockquote>
        </div>
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
            {T("Where we operate", "Tunapofanya kazi")}
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(26px,3vw,36px)",
              lineHeight: 1.15,
            }}
          >
            {T("Based in Tanzania.", "Tumepo Tanzania.")}
          </h2>
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 17,
              lineHeight: "28px",
              color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
            }}
          >
            {T(
              "Ask us about your route. If it's one we can serve, we'll quote it.",
              "Tuulize kuhusu njia yako. Ikiwa ni moja tunayoweza kuhudumia, tutatoa bei."
            )}
          </p>
          <p
            style={{
              margin: "20px 0 0",
              fontSize: 17,
              lineHeight: "28px",
              color: "color-mix(in srgb,var(--color-text) 60%,transparent)",
            }}
          >
            [List of verified regions or corridors]
          </p>
          <span className="tag tag-accent-2" style={{ marginTop: 8 }}>
            {T(
              "To confirm: regions and office address",
              "Kuthibitishwa: mikoa na anwani ya ofisi"
            )}
          </span>
          <p style={{ margin: "28px 0 0" }}>
            <Link href={pages.contact} style={{ fontSize: 16 }}>
              {T("Contact the team", "Wasiliana na timu")} →
            </Link>
          </p>
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
          {T("Work with ABRIA.", "Fanya kazi na ABRIA.")}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
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
            {T("Register Your Truck", "Sajili Lori Lako")}
          </Link>
          <Link
            className="btn btn-ghost"
            href={pages.contact}
            style={{ fontSize: 16, minHeight: 50 }}
          >
            {T("Partnership enquiries", "Maswali ya ushirikiano")} →
          </Link>
        </div>
      </section>
    </main>
  );
}
