import type { MetadataRoute } from "next";
import { solutions } from "@/lib/site";
import { SITE_URL } from "@/lib/site-url";

// Public marketing pages only; console, auth and API routes are excluded (and
// served with X-Robots-Tag: noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/solutions",
    "/how-it-works",
    "/for-shippers",
    "/for-carriers",
    "/about",
    "/contact",
    "/request-transport",
    "/register-truck",
    "/track",
    ...solutions.map((s) => s.href),
  ];
  return paths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
