// Settings tabs, shared by the server page and the client view.
export const SETTINGS_TABS = [
  { id: "general", label: "General", icon: "ph-gear", sub: "Company details used across the site, quotes and emails." },
  { id: "branding", label: "Branding", icon: "ph-palette", sub: "Favicon and the default image shown when the site is shared." },
  { id: "seo", label: "SEO", icon: "ph-magnifying-glass", sub: "Default title, description and search settings." },
  { id: "forms", label: "Forms", icon: "ph-clipboard-text", sub: "Configure public forms." },
  { id: "notifications", label: "Notifications", icon: "ph-bell-ringing", sub: "Choose which events notify the team, and how." },
  { id: "integrations", label: "Integrations", icon: "ph-plugs", sub: "Services ABRIA connects to, and whether they work." },
  { id: "security", label: "Security", icon: "ph-lock-key", sub: "Password and access rules for the console." },
] as const;
