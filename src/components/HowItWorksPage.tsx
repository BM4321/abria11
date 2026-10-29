"use client";

import Link from "next/link";
import { useState } from "react";
import { pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";
import CmykNum from "@/components/CmykNum";

const SHIP_STEPS: [string, string][] = [
  ["Request", "Submit pickup and delivery locations, cargo type, weight and date online or on WhatsApp. You receive an ABR reference immediately."],
  ["Review", "The ABRIA operations team checks the details and asks for anything missing."],
  ["Quote", "You receive a written quotation for the job."],
  ["Confirm", "Approve the quotation and the job is booked."],
  ["Match", "A verified carrier with the right truck type, capacity and route is assigned. You see the company and vehicle registration."],
  ["Pickup and transit", "The cargo is collected and moves to its destination. The status updates against your ABR reference."],
  ["Delivery", "The cargo arrives, delivery is confirmed with proof of delivery, and the job is closed."],
];

const CAR_STEPS: [string, string][] = [
  ["Register", "Submit your details, truck type, registration number, capacity and the routes you cover."],
  ["Verify", "The ABRIA team reviews your details and verifies your vehicle. You receive a partner ID."],
  ["Receive a job", "When a load fits your truck and routes, ABRIA assigns it to you with pickup, delivery and cargo details."],
  ["Collect", "Pick up the cargo at the agreed time and location."],
  ["Transport", "Move the cargo to its destination on schedule."],
  ["Confirm delivery", "Confirm the cargo has arrived. The job closes with proof of delivery."],
];

export default function HowItWorks() {
  const { T } = useSite();
  const [ship, setShip] = useState(true);
  const on = { bg: "var(--color-text)", fg: "var(--color-bg)" };
  const off = { bg: "transparent", fg: "var(--color-text)" };

  const steps = (ship ? SHIP_STEPS : CAR_STEPS).map((s, i) => ({
    n: String(i + 1).padStart(2, "0"),
    title: s[0],
    text: s[1],
  }));

  const tech = [
    {
      icon: "ph-duotone ph-arrows-left-right",
      title: "AB Match",
      status: T("In use", "Inatumika"),
      tagClass: "tag tag-accent",
      text: "Carrier records hold truck type, capacity, location and routes covered. Each load is matched against them, so only suitable, verified trucks are assigned.",
    },
    {
      icon: "ph-duotone ph-files",
      title: T("Digital workflows", "Mchakato wa kidijitali"),
      status: T("In use", "Inatumika"),
      tagClass: "tag tag-accent",
      text: "Online requests, a unique ABR reference per shipment, written quotations and a recorded status history from request to proof of delivery.",
    },
    {
      icon: "ph-duotone ph-map-pin-line",
      title: "AB Track",
      status: T("In use", "Inatumika"),
      tagClass: "tag tag-accent",
      text: "Customer-facing status lookup by ABR reference on the Track Shipment page: the current stage, the assigned carrier and when it last changed.",
    },
    {
      icon: "ph-duotone ph-chart-line",
      title: T("Data and insights", "Data na maarifa"),
      status: T("Planned", "Imepangwa"),
      tagClass: "tag tag-neutral",
      text: "Reporting on shipments, routes and turnaround times for business customers, built from the same shipment records.",
    },
  ];

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
          {T("How it works", "Jinsi inavyofanya kazi")}
        </p>
        <h1
          style={{
            fontSize: "clamp(44px,6vw,80px)",
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            margin: "0 0 0 -0.035em",
            maxWidth: "12em",
          }}
        >
          {T("Request. Match. Move. Confirm.", "Omba. Linganisha. Safirisha. Thibitisha.")}
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
            "ABRIA sits between the business that needs goods moved and the carrier with the right truck. Here is what happens on each side.",
            "ABRIA iko kati ya biashara inayohitaji kusafirisha mizigo na msafirishaji mwenye lori sahihi. Haya ni yanayotokea kila upande."
          )}
        </p>
        <div
          role="tablist"
          aria-label={T("Choose your side", "Chagua upande wako")}
          style={{
            display: "inline-flex",
            marginTop: 40,
            border: "1px solid var(--color-divider)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={ship}
            onClick={() => setShip(true)}
            style={{
              minHeight: 48,
              padding: "0 22px",
              border: 0,
              font: "inherit",
              fontSize: 16,
              cursor: "pointer",
              background: ship ? on.bg : off.bg,
              color: ship ? on.fg : off.fg,
            }}
          >
            {T("I need transport", "Nahitaji usafiri")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!ship}
            onClick={() => setShip(false)}
            style={{
              minHeight: 48,
              padding: "0 22px",
              border: 0,
              font: "inherit",
              fontSize: 16,
              cursor: "pointer",
              background: !ship ? on.bg : off.bg,
              color: !ship ? on.fg : off.fg,
            }}
          >
            {T("I have a truck", "Nina lori")}
          </button>
        </div>
      </section>

      <section
        role="tabpanel"
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(48px,6vw,80px) clamp(20px,5vw,72px) 0",
        }}
      >
        <ol
          data-stagger="1"
          style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}
        >
          {steps.map((st) => (
            <li
              key={st.n}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(64px,120px) minmax(0,1fr)",
                gap: "0 clamp(20px,4vw,56px)",
                padding: "0 0 clamp(32px,4vw,48px)",
              }}
            >
              <CmykNum value={st.n} fontSize="clamp(40px,5vw,64px)" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
                  gap: "8px clamp(24px,5vw,72px)",
                  paddingTop: 4,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(24px,2.6vw,32px)",
                    lineHeight: 1.15,
                  }}
                >
                  {st.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 17,
                    lineHeight: "27px",
                    color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
                  }}
                >
                  {st.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          <Link
            className="btn btn-primary"
            href={ship ? pages.quote : pages.truck}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {ship
              ? T("Request a Quote", "Omba Bei")
              : T("Register Your Truck", "Sajili Lori Lako")}
          </Link>
          <Link
            className="btn btn-ghost"
            href={ship ? pages.shippers : pages.carriers}
            style={{ fontSize: 16, minHeight: 50 }}
          >
            {ship
              ? T("More for businesses", "Zaidi kwa biashara")
              : T("More for carriers", "Zaidi kwa wasafirishaji")}{" "}
            →
          </Link>
        </div>
      </section>

      <section
        id="technology"
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(96px,12vw,176px) clamp(20px,5vw,72px) 0",
          scrollMarginTop: 96,
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
          {T("Technology", "Teknolojia")}
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(32px,4.4vw,56px)",
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            maxWidth: "15em",
          }}
        >
          {T("The system behind each shipment.", "Mfumo nyuma ya kila mzigo.")}
        </h2>
        <p
          style={{
            margin: "24px 0 0",
            fontSize: 18,
            lineHeight: "29px",
            maxWidth: "36em",
            color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
          }}
        >
          {T(
            "ABRIA runs every request through one operational platform: a record for each shipment, a register of verified carriers, and a status history the operations team updates as the job moves. Each part below is marked with where it stands today.",
            "ABRIA huendesha kila ombi kupitia jukwaa moja la uendeshaji: kumbukumbu kwa kila mzigo, rejista ya wasafirishaji waliothibitishwa, na historia ya hali ambayo timu ya uendeshaji husasisha mzigo unaposonga. Kila sehemu hapa chini imewekwa alama ya ilipo leo."
          )}
        </p>
        <dl
          data-stagger="1"
          style={{
            margin: "56px 0 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
            gap: "48px clamp(32px,5vw,80px)",
          }}
        >
          {tech.map((x) => (
            <div key={x.title}>
              <dt style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <i
                    className={x.icon}
                    aria-hidden="true"
                    style={{ fontSize: 32, color: "var(--color-accent)" }}
                  />
                  <span className={x.tagClass}>{x.status}</span>
                </span>
                <span style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}>
                  {x.title}
                </span>
              </dt>
              <dd
                style={{
                  margin: "10px 0 0",
                  fontSize: 16,
                  lineHeight: "26px",
                  color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
                }}
              >
                {x.text}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
