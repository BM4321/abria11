import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
import { getSettings, settingOn } from "@/lib/settings";
import "./globals.css";
import "./broadsheet.css";
import "@phosphor-icons/web/regular";
import "@phosphor-icons/web/duotone";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
});

// Site-wide defaults come from Admin > Settings (SEO and Branding).
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const index = settingOn(s, "seo.index");
  const og = s["brand.ogImage"];
  return {
    metadataBase: new URL(SITE_URL),
    title: s["seo.title"],
    description: s["seo.description"],
    openGraph: {
      type: "website",
      siteName: s["site.name"],
      locale: "en_TZ",
      ...(og ? { images: [{ url: og, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: og ? "summary_large_image" : "summary", ...(og ? { images: [og] } : {}) },
    ...(s["brand.favicon"] ? { icons: { icon: s["brand.favicon"], apple: s["brand.favicon"] } } : {}),
    ...(s["seo.gsc"] ? { verification: { google: s["seo.gsc"] } } : {}),
    // Staging switch: keep every page out of search results.
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}

const themeBootstrap = `(function(){try{var t=localStorage.getItem('abria-theme');if(!t)t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${roboto.variable} font-sans`}>{children}</body>
    </html>
  );
}
