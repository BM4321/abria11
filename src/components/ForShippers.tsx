"use client";

import Link from "next/link";
import { pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";
import CmykFigure from "@/components/CmykFigure";
import type { SlotImage } from "@/lib/media";

const STAGES: [string, string][] = [
  ["Request received", "You submit the request and receive your ABR ID."],
  ["Under review", "The ABRIA team checks cargo, route and dates."],
  ["Quotation sent", "You receive a written price for the job."],
  ["Approved", "You accept the quotation."],
  ["Booked", "The job is confirmed on the schedule."],
  ["Vehicle and driver assigned", "You see the carrier, truck type and registration."],
  ["Picked up · In transit", "Your cargo is collected and on the road."],
  ["Delivered", "The cargo arrives at the delivery location."],
  ["Proof of delivery", "Delivery is confirmed and the job is closed."],
];

const BENEFITS = [
  {
    icon: "ph-duotone ph-clipboard-text",
    title: "Request transportation",
    text: "Pickup, delivery, cargo and dates in one online form, or by WhatsApp.",
  },
  {
    icon: "ph-duotone ph-receipt",
    title: "A written quotation",
    text: "ABRIA reviews the request and sends a price before anything is booked.",
  },
  {
    icon: "ph-duotone ph-arrows-left-right",
    title: "Carrier matching",
    text: "Your load goes to a verified truck of the right type and capacity. See AB Match.",
  },
  {
    icon: "ph-duotone ph-hash",
    title: "One reference number",
    text: "Your ABR ID ties every call, message and document to the same shipment.",
  },
  {
    icon: "ph-duotone ph-seal-check",
    title: "Delivery confirmation",
    text: "Each job closes with proof of delivery.",
  },
  {
    icon: "ph-duotone ph-buildings",
    title: "Support for regular shipping",
    text: "Recurring routes and volumes are handled through AB Business.",
  },
];

export default function ForShippers({ image }: { image?: SlotImage }) {
  const { T, wa } = useSite();
  return (
    <main>
      <section
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "clamp(48px,8vw,112px) clamp(20px,5vw,72px) 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))",
          gap: "56px clamp(32px,5vw,88px)",
          alignItems: "center",
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
            {T("For businesses and cargo owners", "Kwa biashara na wamiliki wa mizigo")}
          </p>
          <h1
            style={{
              fontSize: "clamp(44px,6vw,80px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              margin: "0 0 0 -0.035em",
            }}
          >
            {T("Move your goods with confidence.", "Safirisha mizigo yako kwa uhakika.")}
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: "30px",
              maxWidth: "32em",
              margin: "28px 0 0",
              color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
            }}
          >
            {T(
              "Submit one request with your cargo and route. ABRIA reviews it, sends you a written quotation, and assigns a verified carrier once you approve. You keep one reference number from request to delivery.",
              "Wasilisha ombi moja na mzigo na njia yako. ABRIA hulipitia, hukutumia bei kwa maandishi, na kupanga msafirishaji aliyethibitishwa ukikubali. Unabaki na namba moja ya kumbukumbu kutoka ombi hadi kufikishwa."
            )}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
            <Link
              className="btn btn-primary"
              href={pages.quote}
              style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
            >
              {T("Request a Quote", "Omba Bei")}
            </Link>
            <a
              className="btn btn-ghost"
              href={wa(T("Hello ABRIA, I would like to move goods.", "Habari ABRIA, ningependa kusafirisha mizigo."))}
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
            "Approved photograph: goods being loaded at a warehouse",
            "Picha iliyoidhinishwa: mizigo ikipakiwa ghalani"
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
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          {T("What ABRIA does for you", "ABRIA inakufanyia nini")}
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
            "One request instead of a round of phone calls.",
            "Ombi moja badala ya mzunguko wa simu."
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
          {BENEFITS.map((b) => (
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
            {T("Your shipment, stage by stage", "Mzigo wako, hatua kwa hatua")}
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
              "Every request moves through the same stages.",
              "Kila ombi hupitia hatua zile zile."
            )}
          </h2>
          <p
            style={{
              margin: "20px 0 0",
              fontSize: 17,
              lineHeight: "28px",
              maxWidth: "30em",
              color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
            }}
          >
            {T(
              "These are the statuses ABRIA records against your ABR reference. You always know which stage your shipment is in, and who to ask.",
              "Hizi ni hali ambazo ABRIA hurekodi kwa namba yako ya ABR. Unajua hatua ya mzigo wako kila wakati, na nani wa kuuliza."
            )}
          </p>
        </div>
        <ol
          data-stagger="1"
          style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}
        >
          {STAGES.map((s, i) => (
            <li
              key={s[0]}
              style={{
                display: "grid",
                gridTemplateColumns: "28px minmax(0,1fr)",
                gap: 14,
                paddingBottom: 18,
                position: "relative",
              }}
            >
              <span
                aria-hidden="true"
                style={{ position: "relative", display: "flex", justifyContent: "center" }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    bottom: -18,
                    width: 1,
                    background:
                      i === STAGES.length - 1
                        ? "transparent"
                        : "color-mix(in srgb,var(--color-text) 30%,transparent)",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    marginTop: 7,
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background:
                      i === 0 || i === STAGES.length - 1
                        ? "var(--color-accent)"
                        : "var(--color-text)",
                    boxShadow: "0 0 0 3px var(--color-bg)",
                  }}
                />
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: "26px",
                  }}
                >
                  {s[0]}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 15,
                    lineHeight: "23px",
                    color: "color-mix(in srgb,var(--color-text) 75%,transparent)",
                  }}
                >
                  {s[1]}
                </span>
              </span>
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
              {T("Cargo we handle", "Mizigo tunayoshughulikia")}
            </p>
            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.5, fontWeight: 600 }}>
              {T("General cargo", "Mizigo ya kawaida")}
              <br />
              {T("Refrigerated", "Inayohitaji jokofu")}
              <br />
              {T("Hazardous", "Hatari")}
              <br />
              {T("Fragile", "Inayovunjika")}
              <br />
              {T("Heavy machinery", "Mitambo mizito")}
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
              {T("What to have ready", "Unachopaswa kuwa nacho")}
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
                "Pickup and delivery locations, the cargo type, an approximate weight, and the date you need it moved. Dimensions, number of packages and cargo value help us quote accurately.",
                "Mahali pa kuchukua na kufikisha, aina ya mzigo, uzito wa makadirio, na tarehe unayohitaji kusafirisha. Vipimo, idadi ya vifurushi na thamani ya mzigo hutusaidia kutoa bei sahihi."
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
          {T("Tell us what you need to move.", "Tuambie unachohitaji kusafirisha.")}
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
            "It takes a few minutes. You'll receive your ABR reference immediately.",
            "Inachukua dakika chache. Utapokea namba yako ya ABR mara moja."
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
            href={pages.solutions}
            style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            {T("Explore solutions", "Chunguza huduma")}
          </Link>
        </div>
      </section>
    </main>
  );
}
