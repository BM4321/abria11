import { configuredSiteUrl } from "@/lib/safe-redirect";

// Public origin used for canonical URLs, the sitemap and Open Graph. Defaults
// to the production domain; override with NEXT_PUBLIC_SITE_URL.
export const SITE_URL = configuredSiteUrl() ?? "https://abrialogistics.co.tz";
