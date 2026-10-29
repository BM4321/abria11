"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { solutions, pages } from "@/lib/site";
import { useSite } from "@/lib/i18n";

const NAV_LINKS: { key: string; en: string; sw: string; href: string }[] = [
  { key: "how", en: "How It Works", sw: "Jinsi Inavyofanya Kazi", href: pages.how },
  { key: "shippers", en: "For Businesses", sw: "Kwa Biashara", href: pages.shippers },
  { key: "carriers", en: "For Carriers", sw: "Kwa Wasafirishaji", href: pages.carriers },
  { key: "tech", en: "Technology", sw: "Teknolojia", href: pages.tech },
  { key: "about", en: "About", sw: "Kuhusu Sisi", href: pages.about },
];

export default function SiteNav({ current }: { current?: string }) {
  const pathname = usePathname();
  const { sw, setLang, theme, toggleTheme, T, mounted, wa, contact: CONTACT } = useSite();
  const [solOpen, setSolOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wide, setWide] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [deep, setDeep] = useState(false);
  const [down, setDown] = useState(false);
  const [rot, setRot] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onResize = () => {
      // The full bar needs ~1160px (EN and SW); below that it crowded into the
      // side gutter and its labels wrapped, so switch to the menu button.
      const w = window.innerWidth >= 1180;
      setWide((prev) => {
        if (prev !== w) setMenuOpen(false);
        return w;
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSolOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        if (barRef.current)
          barRef.current.style.transform = `scaleX(${
            max > 0 ? Math.min(1, y / max) : 0
          })`;
        const s = y > 8;
        const d = y > 600;
        const dn = y > lastY.current && y > 200;
        lastY.current = y;
        setScrolled(s);
        setDeep(d);
        setDown(dn);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const cur = current ?? (
    pathname === pages.home
      ? "home"
      : pathname.startsWith("/solutions")
        ? "solutions"
        : pathname.startsWith("/how-it-works")
          ? "how"
          : pathname.startsWith("/for-shippers")
            ? "shippers"
            : pathname.startsWith("/for-carriers")
              ? "carriers"
              : pathname.startsWith("/about")
                ? "about"
                : pathname.startsWith("/contact")
                  ? "contact"
                  : pathname.startsWith("/track")
                    ? "track"
                    : ""
  );

  const on = { bg: "var(--color-text)", fg: "var(--color-bg)" };
  const off = { bg: "transparent", fg: "var(--color-text)" };

  const handleTheme = (e: React.MouseEvent) => {
    setRot((r) => r + 180);
    toggleTheme(e);
  };

  return (
    <header
      style={{
        position: "relative",
        background: "var(--color-bg)",
        boxShadow: scrolled ? "var(--shadow-md)" : "none",
        transition: "box-shadow .25s ease",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          ref={barRef}
          style={{
            height: "100%",
            background: "var(--color-accent)",
            transformOrigin: "0 50%",
            transform: "scaleX(0)",
          }}
        />
      </div>
      <div
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "0 clamp(20px,5vw,72px)",
          minHeight: scrolled && wide ? 60 : 72,
          display: "flex",
          alignItems: "center",
          gap: 24,
          transition: "min-height .25s ease",
        }}
      >
        <Link
          href={pages.home}
          aria-label="ABRIA Logistics, home"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            textDecoration: "none",
            color: "var(--color-text)",
            marginRight: "auto",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            ABRIA
          </span>
          {wide && (
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "color-mix(in srgb,var(--color-text) 70%,transparent)",
              }}
            >
              Logistics
            </span>
          )}
        </Link>

        {wide ? (
          <>
            <nav className="nav" aria-label="Main" style={{ padding: 0, gap: 22 }}>
              <div
                style={{ position: "relative" }}
                onMouseLeave={() => setSolOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={solOpen}
                  aria-haspopup="true"
                  onClick={() => setSolOpen((v) => !v)}
                  onMouseEnter={() => setSolOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "none",
                    border: 0,
                    padding: "10px 0",
                    font: "inherit",
                    fontSize: 14,
                    color:
                      cur === "solutions"
                        ? "var(--color-accent-700)"
                        : "var(--color-text)",
                    cursor: "pointer",
                  }}
                >
                  {T("Solutions", "Huduma")}
                  <i className="ph ph-caret-down" aria-hidden="true" style={{ fontSize: 12 }} />
                </button>
                {solOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: -24,
                      paddingTop: 8,
                      zIndex: 60,
                    }}
                  >
                    <div
                      style={{
                        width: 580,
                        background: "var(--color-bg)",
                        boxShadow: "var(--shadow-lg)",
                        borderRadius: "var(--radius-lg)",
                        padding: 16,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "2px 12px",
                      }}
                    >
                      {solutions.map((s) => (
                        <Link
                          key={s.id}
                          href={s.href}
                          style={{
                            display: "flex",
                            gap: 12,
                            padding: 12,
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text)",
                            textDecoration: "none",
                          }}
                        >
                          <i
                            className={s.iconClass}
                            aria-hidden="true"
                            style={{
                              fontSize: 24,
                              color: "var(--color-accent)",
                              flex: "none",
                            }}
                          />
                          <span
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: 15 }}>
                              {s.name}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                lineHeight: 1.4,
                                color:
                                  "color-mix(in srgb,var(--color-text) 72%,transparent)",
                              }}
                            >
                              {sw ? s.shortSw : s.short}
                            </span>
                          </span>
                        </Link>
                      ))}
                      <Link
                        href={pages.solutions}
                        style={{
                          gridColumn: "1 / -1",
                          padding: 12,
                          fontSize: 14,
                          color: "var(--color-accent-700)",
                          textDecoration: "none",
                        }}
                      >
                        {T("All solutions", "Huduma zote")} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.key}
                  href={l.href}
                  aria-current={cur === l.key ? "page" : undefined}
                  style={{ padding: "10px 0", whiteSpace: "nowrap" }}
                >
                  {T(l.en, l.sw)}
                </Link>
              ))}
            </nav>
            <div
              role="group"
              aria-label="Language"
              style={{
                display: "flex",
                border: "1px solid var(--color-divider)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={!sw}
                style={{
                  background: sw ? off.bg : on.bg,
                  color: sw ? off.fg : on.fg,
                  border: 0,
                  padding: "6px 9px",
                  font: "inherit",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("sw")}
                aria-pressed={sw}
                style={{
                  background: sw ? on.bg : off.bg,
                  color: sw ? on.fg : off.fg,
                  border: 0,
                  padding: "6px 9px",
                  font: "inherit",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                SW
              </button>
            </div>
            <button
              type="button"
              data-ripple="1"
              aria-label={T("Switch theme", "Badili mandhari")}
              aria-pressed={theme === "dark"}
              onClick={handleTheme}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid var(--color-divider)",
                background: "transparent",
                color: "var(--color-text)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flex: "none",
              }}
            >
              <i
                className={
                  mounted && theme === "dark"
                    ? "ph-duotone ph-sun"
                    : "ph-duotone ph-moon"
                }
                aria-hidden="true"
                style={{
                  fontSize: 20,
                  transition: "transform .6s cubic-bezier(.4,0,.2,1)",
                  transform: `rotate(${rot}deg)`,
                }}
              />
            </button>
            <Link
              className="btn btn-primary"
              href={pages.quote}
              style={{ minHeight: 40 }}
            >
              {T("Request a Quote", "Omba Bei")}
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              data-ripple="1"
              aria-label={T("Switch theme", "Badili mandhari")}
              aria-pressed={theme === "dark"}
              onClick={handleTheme}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: 0,
                background: "transparent",
                color: "var(--color-text)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flex: "none",
              }}
            >
              <i
                className={
                  mounted && theme === "dark"
                    ? "ph-duotone ph-sun"
                    : "ph-duotone ph-moon"
                }
                aria-hidden="true"
                style={{
                  fontSize: 24,
                  transition: "transform .6s cubic-bezier(.4,0,.2,1)",
                  transform: `rotate(${rot}deg)`,
                }}
              />
            </button>
            <Link
              className="btn btn-primary"
              href={pages.quote}
              style={{ minHeight: 44, paddingInline: 14, whiteSpace: "nowrap" }}
            >
              {T("Get a Quote", "Omba Bei")}
            </Link>
            <button
              type="button"
              aria-label={T("Menu", "Menyu")}
              aria-expanded={menuOpen}
              aria-controls="abria-mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: 44,
                height: 44,
                display: "grid",
                placeItems: "center",
                background: "none",
                border: 0,
                color: "var(--color-text)",
                cursor: "pointer",
                marginRight: -10,
              }}
            >
              <i
                className={menuOpen ? "ph ph-x" : "ph ph-list"}
                aria-hidden="true"
                style={{ fontSize: 28 }}
              />
            </button>
          </>
        )}
      </div>

      {sw && (
        <p
          style={{
            margin: 0,
            background: "var(--color-accent-100)",
            color: "var(--color-accent-800)",
            fontSize: 13,
            lineHeight: "20px",
            padding: "8px clamp(20px,5vw,72px)",
            textAlign: "left",
          }}
        >
          Ukurasa huu bado unapatikana kwa Kiingereza pekee. Tafsiri ya Kiswahili
          inaandaliwa.
        </p>
      )}

      {!wide && (
        <div
          id="abria-mobile-menu"
          aria-hidden={!menuOpen}
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: 72,
            bottom: 0,
            zIndex: 70,
            background: "var(--color-bg)",
            overflowY: "auto",
            padding: "12px clamp(20px,5vw,72px) 40px",
            transition: "opacity .18s ease, transform .18s ease",
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
            visibility: menuOpen ? "visible" : "hidden",
          }}
        >
          <p
            style={{
              margin: "12px 0 4px",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "color-mix(in srgb,var(--color-text) 70%,transparent)",
            }}
          >
            {T("Solutions", "Huduma")}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
              gap: "0 16px",
            }}
          >
            {solutions.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minHeight: 48,
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: 17,
                }}
              >
                <i
                  className={s.iconClass}
                  aria-hidden="true"
                  style={{ fontSize: 22, color: "var(--color-accent)" }}
                />
                {s.name}
              </Link>
            ))}
          </div>
          <nav
            aria-label="Mobile"
            style={{ display: "flex", flexDirection: "column", marginTop: 16 }}
          >
            {[
              ...NAV_LINKS,
              { key: "track", en: "Track Shipment", sw: "Fuatilia Mzigo", href: pages.track },
              { key: "contact", en: "Contact", sw: "Wasiliana Nasi", href: pages.contact },
            ].map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                aria-current={cur === l.key ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: 52,
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color:
                    cur === l.key
                      ? "var(--color-accent-700)"
                      : "var(--color-text)",
                  textDecoration: "none",
                }}
              >
                {T(l.en, l.sw)}
              </Link>
            ))}
          </nav>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 28,
            }}
          >
            <Link
              className="btn btn-primary"
              href={pages.quote}
              style={{ minHeight: 52, fontSize: 16 }}
            >
              {T("Request a Quote", "Omba Bei")}
            </Link>
            <Link
              className="btn btn-secondary"
              href={pages.truck}
              style={{ minHeight: 52, fontSize: 16 }}
            >
              {T("Register Your Truck", "Sajili Lori Lako")}
            </Link>
            <a
              className="btn btn-ghost"
              href={wa(
                T("Hello ABRIA, I have a question.", "Habari ABRIA, nina swali.")
              )}
              target="_blank"
              rel="noopener"
              style={{ minHeight: 52, fontSize: 16 }}
            >
              <i
                className="ph-duotone ph-whatsapp-logo"
                aria-hidden="true"
                style={{ fontSize: 22 }}
              />
              WhatsApp {CONTACT.whatsappDisplay}
            </a>
          </div>
          <div
            role="group"
            aria-label="Language"
            style={{
              display: "flex",
              width: "fit-content",
              marginTop: 28,
              border: "1px solid var(--color-divider)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={!sw}
              style={{
                background: sw ? off.bg : on.bg,
                color: sw ? off.fg : on.fg,
                border: 0,
                minHeight: 44,
                padding: "0 16px",
                font: "inherit",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang("sw")}
              aria-pressed={sw}
              style={{
                background: sw ? on.bg : off.bg,
                color: sw ? on.fg : off.fg,
                border: 0,
                minHeight: 44,
                padding: "0 16px",
                font: "inherit",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Kiswahili
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: "fixed",
          right: "clamp(16px,3vw,32px)",
          bottom: "clamp(16px,3vw,32px)",
          zIndex: 65,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 14,
          transition: "opacity .2s ease, transform .2s ease",
          opacity: menuOpen ? 0 : 1,
          transform: menuOpen ? "translateY(12px)" : "translateY(0)",
          pointerEvents: menuOpen ? "none" : "auto",
        }}
      >
        <button
          type="button"
          data-ripple="1"
          aria-label={T("Back to top", "Rudi juu")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: 0,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            boxShadow: "var(--shadow-md)",
            transition: "opacity .2s ease, transform .2s ease",
            opacity: deep ? 1 : 0,
            transform: deep ? "scale(1)" : "scale(0.6)",
            pointerEvents: deep ? "auto" : "none",
          }}
        >
          <i className="ph ph-arrow-up" aria-hidden="true" style={{ fontSize: 20 }} />
        </button>
        <a
          href={wa(
            T("Hello ABRIA, I have a question.", "Habari ABRIA, nina swali.")
          )}
          target="_blank"
          rel="noopener"
          data-ripple="1"
          aria-label={`WhatsApp ${CONTACT.whatsappDisplay}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 56,
            padding: down ? "0 15px" : "0 20px",
            borderRadius: 16,
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.01em",
            boxShadow: "var(--shadow-lg)",
            transition: "box-shadow .2s ease, background .2s ease",
          }}
        >
          <i
            className="ph-duotone ph-whatsapp-logo"
            aria-hidden="true"
            style={{ fontSize: 26 }}
          />
          {!down && <span>{T("Chat with us", "Tuandikie")}</span>}
        </a>
      </div>
    </header>
  );
}
