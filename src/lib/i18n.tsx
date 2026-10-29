"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CONTACT } from "@/lib/site";
import type { SiteContact } from "@/lib/settings";

export type Lang = "en" | "sw";

type Theme = "light" | "dark";

type SiteCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  sw: boolean;
  T: (en: string, sw: string) => string;
  theme: Theme;
  toggleTheme: (ev?: React.MouseEvent | MouseEvent) => void;
  mounted: boolean;
  /** Contact details from admin settings (falls back to the built-in defaults). */
  contact: SiteContact;
  /** WhatsApp chat link to the company number, optionally with a prefilled message. */
  wa: (text?: string) => string;
};

const DEFAULT_CONTACT: SiteContact = {
  name: "ABRIA Logistics",
  email: CONTACT.email,
  phone: CONTACT.phone,
  phoneHref: CONTACT.phoneHref,
  whatsapp: CONTACT.whatsapp,
  whatsappDisplay: CONTACT.phone,
  address: "",
};

const Ctx = createContext<SiteCtx | null>(null);

const THEME_EASE = "cubic-bezier(.4,0,.2,1)";

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem("abria-theme", t);
  } catch {
    /* ignore */
  }
}

function getTheme(): Theme {
  try {
    const t = localStorage.getItem("abria-theme");
    if (t === "light" || t === "dark") return t;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function motionOK() {
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function SiteProvider({ children, contact = DEFAULT_CONTACT }: { children: ReactNode; contact?: SiteContact }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("abria-lang");
      if (stored === "sw" || stored === "en") setLangState(stored);
    } catch {
      /* ignore */
    }
    setTheme(getTheme());
    setMounted(true);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("abria-lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(
    (ev?: React.MouseEvent | MouseEvent) => {
      const next: Theme = getTheme() === "dark" ? "light" : "dark";
      const x =
        ev && "clientX" in ev ? ev.clientX : window.innerWidth - 40;
      const y = ev && "clientY" in ev ? ev.clientY : 36;

      if (!motionOK()) {
        applyTheme(next);
        setTheme(next);
        return;
      }
      const anyDoc = document as Document & {
        startViewTransition?: (cb: () => void) => {
          ready: Promise<void>;
        };
      };
      if (!anyDoc.startViewTransition) {
        const h = document.documentElement;
        h.classList.add("abria-fade");
        applyTheme(next);
        setTheme(next);
        setTimeout(() => h.classList.remove("abria-fade"), 500);
        return;
      }
      const r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      const vt = anyDoc.startViewTransition(() => {
        applyTheme(next);
        setTheme(next);
      });
      vt.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${r}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 700,
            easing: THEME_EASE,
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    },
    []
  );

  const sw = lang === "sw";
  const T = useCallback((en: string, swText: string) => (sw ? swText : en), [sw]);

  const wa = useCallback(
    (text?: string) => `https://wa.me/${contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`,
    [contact.whatsapp]
  );

  return (
    <Ctx.Provider
      value={{ lang, setLang, sw, T, theme, toggleTheme, mounted, contact, wa }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSite(): SiteCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
