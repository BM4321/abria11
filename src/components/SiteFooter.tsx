"use client";

import Link from "next/link";
import { solutions, pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";

export default function SiteFooter() {
  const { sw, T, wa, contact: CONTACT } = useSite();

  const cols: { title: string; items: { href: string; label: string }[] }[] = [
    {
      title: T("Solutions", "Huduma"),
      items: solutions.map((s) => ({ href: s.href, label: s.name })),
    },
    {
      title: T("Company", "Kampuni"),
      items: [
        { href: pages.about, label: T("About", "Kuhusu Sisi") },
        { href: pages.how, label: T("How It Works", "Jinsi Inavyofanya Kazi") },
        { href: pages.tech, label: T("Technology", "Teknolojia") },
        { href: pages.contact, label: T("Contact", "Wasiliana Nasi") },
        { href: pages.faq, label: T("FAQ", "Maswali") },
        { href: "/login", label: T("Staff sign in", "Kuingia kwa wafanyakazi") },
      ],
    },
    {
      title: T("Get started", "Anza"),
      items: [
        { href: pages.quote, label: T("Request a Quote", "Omba Bei") },
        { href: pages.truck, label: T("Register Your Truck", "Sajili Lori Lako") },
        { href: pages.track, label: T("Track Shipment", "Fuatilia Mzigo") },
      ],
    },
    {
      title: T("Contact", "Mawasiliano"),
      items: [
        { href: `mailto:${CONTACT.email}`, label: CONTACT.email },
        { href: CONTACT.phoneHref, label: CONTACT.phone },
        { href: wa(), label: "WhatsApp" },
        ...(CONTACT.address ? [{ href: pages.contact, label: CONTACT.address }] : []),
      ],
    },
    {
      title: T("Legal", "Kisheria"),
      items: [
        { href: pages.notfound, label: T("Privacy Policy", "Sera ya Faragha") },
        { href: pages.notfound, label: T("Terms & Conditions", "Vigezo na Masharti") },
      ],
    },
  ];

  return (
    <footer
      style={{
        maxWidth: "var(--page-max)",
        margin: "0 auto",
        padding: "96px clamp(20px,5vw,72px) 40px",
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
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "24px 48px",
          padding: "36px 0 8px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            ABRIA
          </p>
          <p style={{ margin: "12px 0 0", fontSize: 17, fontStyle: "italic" }}>
            {T(
              "Connected Logistics. Better Movement.",
              "Usafirishaji Uliounganishwa. Mwendo Bora."
            )}
          </p>
        </div>
        <a
          className="btn btn-secondary"
          href={wa(
            T("Hello ABRIA, I have a question.", "Habari ABRIA, nina swali.")
          )}
          target="_blank"
          rel="noopener"
          style={{ minHeight: 44 }}
        >
          <i
            className="ph-duotone ph-whatsapp-logo"
            aria-hidden="true"
            style={{ fontSize: 20, color: "var(--color-accent)" }}
          />
          {T("Chat with us on WhatsApp", "Tuandikie WhatsApp")}
        </a>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))",
          gap: "36px 32px",
          padding: "40px 0 48px",
        }}
      >
        {cols.map((c) => (
          <div key={c.title}>
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 400,
                color: "color-mix(in srgb,var(--color-text) 70%,transparent)",
              }}
            >
              {c.title}
            </h2>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {c.items.map((i) => (
                <li key={`${c.title}-${i.label}`}>
                  <Link
                    href={i.href}
                    style={{
                      display: "inline-block",
                      padding: "5px 0",
                      fontSize: 15,
                      color: "var(--color-text)",
                      textDecoration: "none",
                    }}
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "color-mix(in srgb,var(--color-text) 70%,transparent)",
        }}
      >
        © {new Date().getFullYear()} {CONTACT.name}.{" "}
        {sw ? "Haki zote zimehifadhiwa." : "All rights reserved."}
      </p>
    </footer>
  );
}
