import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CONTACT } from "@/lib/site";

// Every admin-editable setting, with its default and validation. Only keys
// listed here can be saved, and every one of them is read somewhere: a
// setting that does nothing should not exist.

export const SETTINGS_TAG = "settings";

type Kind =
  | { type: "text"; max: number; required?: boolean }
  | { type: "email" }
  | { type: "phone" }
  | { type: "url" }
  | { type: "bool" }
  | { type: "enum"; options: string[] };

const DEF = {
  // General — contact details shown across the public site, quote PDFs and emails
  "site.name": { kind: { type: "text", max: 80, required: true }, def: "ABRIA Logistics", label: "Company name" },
  "site.email": { kind: { type: "email" }, def: CONTACT.email, label: "Email" },
  "site.phone": { kind: { type: "phone" }, def: CONTACT.phone, label: "Phone" },
  "site.whatsapp": { kind: { type: "phone" }, def: CONTACT.phone, label: "WhatsApp" },
  "site.address": { kind: { type: "text", max: 300 }, def: "", label: "Address" },

  // Branding
  "brand.favicon": { kind: { type: "url" }, def: "", label: "Favicon" },
  "brand.ogImage": { kind: { type: "url" }, def: "", label: "Default social image" },

  // SEO
  "seo.title": {
    kind: { type: "text", max: 120, required: true },
    def: "ABRIA Logistics | Connected Logistics. Better Movement.",
    label: "Default site title",
  },
  "seo.description": {
    kind: { type: "text", max: 300, required: true },
    def: "ABRIA Logistics connects businesses and cargo owners with reliable transport solutions across the region.",
    label: "Default description",
  },
  "seo.gsc": { kind: { type: "text", max: 120 }, def: "", label: "Google Search Console verification" },
  "seo.index": { kind: { type: "bool" }, def: "true", label: "Allow search engines to index the site" },

  // Notifications — which events notify staff, per channel
  "notify.request.inapp": { kind: { type: "bool" }, def: "true", label: "New quote request · In-app" },
  "notify.request.email": { kind: { type: "bool" }, def: "true", label: "New quote request · Email" },
  "notify.carrier.inapp": { kind: { type: "bool" }, def: "true", label: "New truck registration · In-app" },
  "notify.carrier.email": { kind: { type: "bool" }, def: "false", label: "New truck registration · Email" },
  "notify.contact.inapp": { kind: { type: "bool" }, def: "true", label: "New contact message · In-app" },
  "notify.contact.email": { kind: { type: "bool" }, def: "false", label: "New contact message · Email" },
  "notify.shipment.inapp": { kind: { type: "bool" }, def: "true", label: "Shipment issue · In-app" },
  "notify.shipment.email": { kind: { type: "bool" }, def: "false", label: "Shipment issue · Email" },
  "notify.system.inapp": { kind: { type: "bool" }, def: "true", label: "System alert · In-app" },
  "notify.system.email": { kind: { type: "bool" }, def: "false", label: "System alert · Email" },
  "notify.opsEmail": { kind: { type: "email" }, def: "", label: "Team email for notifications" },

  // Security
  "security.minPassword": {
    kind: { type: "enum", options: ["8", "10", "12", "14", "16"] },
    def: "8",
    label: "Minimum password length",
  },
  "security.inviteDomain": { kind: { type: "text", max: 100 }, def: "", label: "Allowed email domain for new users" },
} satisfies Record<string, { kind: Kind; def: string; label: string }>;

export type SettingKey = keyof typeof DEF;
export type Settings = Record<SettingKey, string>;

export const SETTING_KEYS = Object.keys(DEF) as SettingKey[];
export const SETTING_LABELS = Object.fromEntries(SETTING_KEYS.map((k) => [k, DEF[k].label])) as Record<SettingKey, string>;

export function isSettingKey(key: string): key is SettingKey {
  return Object.prototype.hasOwnProperty.call(DEF, key);
}

export function defaultSettings(): Settings {
  return Object.fromEntries(SETTING_KEYS.map((k) => [k, DEF[k].def])) as Settings;
}

// Normalises and validates one value. Returns the value to store, or an error.
export function validateSetting(key: SettingKey, raw: string): { value: string } | { error: string } {
  const { kind, label } = DEF[key] as { kind: Kind; label: string };
  const v = raw.trim();
  switch (kind.type) {
    case "text":
      if (kind.required && !v) return { error: `${label} is required.` };
      if (v.length > kind.max) return { error: `${label} must be at most ${kind.max} characters.` };
      if (key === "security.inviteDomain" && v && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v.replace(/^@/, ""))) {
        return { error: "Enter a domain like abrialogistics.co.tz." };
      }
      if (key === "seo.gsc" && v && !/^[A-Za-z0-9_=-]+$/.test(v.replace(/^google-site-verification=/, ""))) {
        return { error: "Paste the verification code from Google Search Console." };
      }
      return {
        value:
          key === "security.inviteDomain"
            ? v.replace(/^@/, "").toLowerCase()
            : key === "seo.gsc"
              ? v.replace(/^google-site-verification=/, "")
              : v,
      };
    case "email":
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return { error: `${label} must be a valid email address.` };
      if (!v && key === "site.email") return { error: `${label} is required.` };
      return { value: v.toLowerCase() };
    case "phone":
      if (!/^\+?[0-9 ()-]{7,20}$/.test(v)) return { error: `${label} must be a valid phone number, e.g. +255 723 999 039.` };
      return { value: v };
    case "url":
      if (v && !/^(https:\/\/[^\s]+|\/[^\s]*)$/.test(v)) return { error: `${label} must be an uploaded image.` };
      return { value: v };
    case "bool":
      return v === "true" || v === "false" ? { value: v } : { error: `${label} must be on or off.` };
    case "enum":
      return kind.options.includes(v) ? { value: v } : { error: `${label} must be one of ${kind.options.join(", ")}.` };
  }
}

async function loadSettings(): Promise<Settings> {
  const out = defaultSettings();
  try {
    const rows = await prisma.setting.findMany({ where: { key: { in: SETTING_KEYS } } });
    // Saved values win; optional fields cleared on purpose are stored as "".
    for (const r of rows) if (isSettingKey(r.key)) out[r.key] = r.value;
  } catch (err) {
    // Database unreachable (e.g. at build time): fall back to defaults.
    console.error("[ABRIA] Could not load settings; using defaults.", err instanceof Error ? err.message : err);
  }
  return out;
}

// Cached across requests; saving settings calls revalidateTag(SETTINGS_TAG).
export const getSettings = unstable_cache(loadSettings, ["abria-settings"], {
  tags: [SETTINGS_TAG],
  revalidate: 300,
});

export const settingOn = (s: Settings, key: SettingKey) => s[key] === "true";

// Public contact details derived from settings, in the shape the site uses.
export type SiteContact = {
  name: string;
  email: string;
  phone: string;
  phoneHref: string;
  whatsapp: string; // digits only, for wa.me links
  whatsappDisplay: string;
  address: string;
};

export function contactFrom(s: Settings): SiteContact {
  return {
    name: s["site.name"],
    email: s["site.email"],
    phone: s["site.phone"],
    phoneHref: `tel:${s["site.phone"].replace(/[^\d+]/g, "")}`,
    whatsapp: s["site.whatsapp"].replace(/\D/g, ""),
    whatsappDisplay: s["site.whatsapp"],
    address: s["site.address"],
  };
}
