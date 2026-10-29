"use client";

import Link from "next/link";
import { pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";
import CmykNum from "@/components/CmykNum";

export default function ForCarriers() {
  const { sw, T, wa } = useSite();

  const benefits = sw
    ? [
        { icon: "ph-duotone ph-truck", title: "Sajili magari yako", text: "Lori moja au kundi zima, kila moja na aina, uwezo na namba ya usajili." },
        { icon: "ph-duotone ph-identification-card", title: "Wasifu wa msafirishaji", text: "Mahali ulipo na njia unazohudumia zinahifadhiwa kwenye wasifu wako." },
        { icon: "ph-duotone ph-package", title: "Pokea kazi za usafiri", text: "Kazi zinazolingana na lori lako zinapewa kwako na timu ya ABRIA." },
        { icon: "ph-duotone ph-users-three", title: "Wateja zaidi", text: "Fikia biashara na wamiliki wa mizigo bila kutafuta mmoja mmoja." },
        { icon: "ph-duotone ph-gauge", title: "Safari tupu chache", text: "Mizigo kwenye njia zako inamaanisha kilomita chache bila mzigo." },
        { icon: "ph-duotone ph-whatsapp-logo", title: "Mawasiliano ya moja kwa moja", text: "Ongea na timu ya ABRIA kwa WhatsApp au simu." },
      ]
    : [
        { icon: "ph-duotone ph-truck", title: "Register your vehicles", text: "One truck or a whole fleet, each with its type, capacity and registration." },
        { icon: "ph-duotone ph-identification-card", title: "A carrier profile", text: "Your location and the routes you cover are kept on your profile." },
        { icon: "ph-duotone ph-package", title: "Receive transport jobs", text: "Jobs that fit your truck are assigned to you by the ABRIA team." },
        { icon: "ph-duotone ph-users-three", title: "Reach more customers", text: "Get in front of businesses and cargo owners without chasing each one." },
        { icon: "ph-duotone ph-gauge", title: "Fewer empty trips", text: "Loads on your routes mean fewer kilometres run empty." },
        { icon: "ph-duotone ph-whatsapp-logo", title: "A direct line", text: "Talk to the ABRIA team on WhatsApp or by phone." },
      ];

  const rawSteps: [string, string][] = sw
    ? [
        ["Jisajili", "Jaza fomu ya usajili na taarifa za lori na njia zako."],
        ["Hakikiwa", "Timu ya ABRIA inapitia taarifa zako na kuhakiki gari."],
        ["Pokea kazi", "Kazi zinazolingana na lori na njia zako zinapewa kwako."],
        ["Safirisha", "Chukua mzigo na usafirishe kwa ratiba iliyokubaliwa."],
        ["Thibitisha", "Thibitisha mzigo umefika na kazi inafungwa."],
      ]
    : [
        ["Register", "Fill in the registration form with your truck and the routes you cover."],
        ["Get verified", "The ABRIA team reviews your details and verifies your vehicle."],
        ["Receive jobs", "Jobs that fit your truck type, capacity and routes are assigned to you."],
        ["Transport", "Collect the cargo and move it on the agreed schedule."],
        ["Confirm delivery", "Confirm the cargo has arrived and the job is closed."],
      ];
  const steps = rawSteps.map((s, i) => ({
    n: String(i + 1).padStart(2, "0"),
    title: s[0],
    text: s[1],
  }));

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
          {T(
            "For truck owners and transport providers",
            "Kwa wamiliki wa malori na watoa huduma za usafiri"
          )}
        </p>
        <h1
          style={{
            fontSize: "clamp(48px,7.6vw,104px)",
            lineHeight: 1,
            letterSpacing: "-0.025em",
            margin: "0 0 0 -0.035em",
            maxWidth: "9em",
          }}
        >
          {T("Keep your trucks moving.", "Malori yako yaendelee kufanya kazi.")}
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
            gap: "32px clamp(40px,7vw,120px)",
            marginTop: 36,
            alignItems: "end",
          }}
        >
          <p
            style={{
              fontSize: 19,
              lineHeight: "30px",
              maxWidth: "30em",
              margin: 0,
              color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
            }}
          >
            {T(
              "Register your trucks with ABRIA once. After verification, you receive transport jobs from businesses that need your type of vehicle on the routes you already drive.",
              "Sajili malori yako na ABRIA mara moja. Baada ya kuhakikiwa, utapokea kazi za usafiri kutoka kwa biashara zinazohitaji aina ya gari lako kwenye njia unazotumia tayari."
            )}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link
              className="btn btn-primary"
              href={pages.truck}
              style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
            >
              {T("Register Your Truck", "Sajili Lori Lako")}
            </Link>
            <a
              className="btn btn-ghost"
              href={wa(
                T(
                  "Hello ABRIA, I have a truck and would like to join.",
                  "Habari ABRIA, nina lori na ningependa kujiunga."
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
              WhatsApp
            </a>
          </div>
        </div>
      </section>
      <figure
        data-reveal="1"
        className="cmyk"
        style={{
          maxWidth: "var(--page-max)",
          margin: "clamp(48px,6vw,80px) auto 0",
          padding: "0 clamp(20px,5vw,72px)",
          overflow: "visible",
        }}
      >
        <div className="print" style={{ aspectRatio: "21/9" }}>
          <div
            role="img"
            aria-label={T(
              "Approved photograph: carrier's truck and driver",
              "Picha iliyoidhinishwa: lori na dereva wa msafirishaji"
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
              "Approved photograph: carrier's truck and driver",
              "Picha iliyoidhinishwa: lori na dereva wa msafirishaji"
            )}
          </div>
        </div>
      </figure>

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
          {T("Why carriers join", "Kwa nini wasafirishaji wanajiunga")}
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(30px,3.6vw,44px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "17em",
          }}
        >
          {T(
            "More loads for the trucks you already run.",
            "Mizigo zaidi kwa malori unayoendesha tayari."
          )}
        </h2>
        <dl
          data-stagger="1"
          style={{
            margin: "48px 0 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
            gap: 20,
          }}
        >
          {benefits.map((b) => (
            <div
              key={b.title}
              style={{
                padding: 28,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
                transition: "box-shadow .22s ease, transform .22s ease",
              }}
            >
              <dt
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 21,
                  fontWeight: 600,
                  lineHeight: 1.25,
                }}
              >
                <i
                  className={b.icon}
                  aria-hidden="true"
                  style={{ fontSize: 28, color: "var(--color-accent)", flex: "none" }}
                />
                {b.title}
              </dt>
              <dd
                style={{
                  margin: "10px 0 0",
                  fontSize: 16,
                  lineHeight: "25px",
                  color: "color-mix(in srgb,var(--color-text) 78%,transparent)",
                }}
              >
                {b.text}
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
          {T("How joining works", "Jinsi ya kujiunga")}
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(30px,3.6vw,44px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "17em",
          }}
        >
          {T("From registration to your first job.", "Kutoka usajili hadi kazi yako ya kwanza.")}
        </h2>
        <ol
          data-stagger="1"
          style={{
            listStyle: "none",
            margin: "56px 0 0",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))",
            gap: "48px 36px",
          }}
        >
          {steps.map((st) => (
            <li key={st.n}>
              <CmykNum value={st.n} fontSize={56} />
              <h3 style={{ margin: "24px 0 8px", fontSize: 22, lineHeight: 1.2 }}>
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
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
            gap: "32px 64px",
            padding: "28px 0 32px",
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
              {T("Trucks we accept", "Malori tunayopokea")}
            </p>
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.55, fontWeight: 600 }}>
              {T(
                "Flatbed · Curtainsider · Box truck · Refrigerated · Container truck · Tipper · Lowbed · Pickup · Other",
                "Flatbed · Curtainsider · Lori la boksi · Jokofu · Lori la kontena · Tipa · Lowbed · Pickup · Nyingine"
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
              {T("What you need to register", "Unachohitaji kujisajili")}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: "28px",
                color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
              }}
            >
              {T(
                "Your name and phone number, the truck type and its registration number. Capacity, make and model, current location and the routes you cover help us match you faster.",
                "Jina lako na namba ya simu, aina ya lori na namba yake ya usajili. Uwezo wa kubeba, aina ya gari, mahali lilipo sasa na njia unazohudumia hutusaidia kukuunganisha haraka."
              )}
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
          {T("Register your truck today.", "Sajili lori lako leo.")}
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
            "It takes a few minutes. You receive your ABRIA partner ID as soon as you submit.",
            "Inachukua dakika chache. Utapokea namba yako ya mshirika wa ABRIA mara tu unapowasilisha."
          )}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
          <Link
            className="btn btn-primary"
            href={pages.truck}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {T("Register Your Truck", "Sajili Lori Lako")}
          </Link>
          <Link
            className="btn btn-secondary"
            href={pages.faq}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {T("Carrier questions", "Maswali ya wasafirishaji")}
          </Link>
        </div>
      </section>
    </main>
  );
}
