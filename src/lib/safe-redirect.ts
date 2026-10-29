// Helpers for building post-auth redirects without letting a request steer
// users (or emailed auth links) to another origin.

const BASE = "http://abria.invalid";

// A user-supplied `next` is only honoured when it is a same-origin path.
// `startsWith("/")` alone is not enough: "//evil.com" and "/\evil.com" are
// protocol-relative URLs that browsers resolve to another host.
export function safeNextPath(raw: string | null | undefined, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  // Reject control characters and backslashes, which browsers normalise unpredictably.
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return fallback;
  try {
    const url = new URL(raw, BASE);
    if (url.origin !== BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

// The canonical public origin, e.g. "https://abrialogistics.co.tz". Set
// NEXT_PUBLIC_SITE_URL in production so emailed links (password reset) and
// auth redirects never depend on request headers an attacker can influence.
export function configuredSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

// Origin to redirect to after an auth callback: the configured site URL when
// set, otherwise the public host the proxy reports (Netlify), otherwise the
// origin the request arrived on.
export function redirectOrigin(request: Request): string {
  const configured = configuredSiteUrl();
  if (configured) return configured;
  const origin = new URL(request.url).origin;
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.NODE_ENV !== "development" && forwardedHost && /^[a-z0-9.-]+(:\d+)?$/i.test(forwardedHost)) {
    return `https://${forwardedHost}`;
  }
  return origin;
}
