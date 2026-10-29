import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { getSettings, settingOn } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // "Allow search engines to index the site" off (Admin > Settings > SEO).
  if (!settingOn(await getSettings(), "seo.index")) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/operations", "/api/", "/login", "/forgot-password", "/reset-password", "/setup", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
