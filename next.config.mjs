// Security headers for every response. The CSP deliberately leaves script/style
// sources open (the theme bootstrap is an inline script and components use
// inline styles); it locks down framing, <base> hijacking, plugins and form
// targets, which can't break the site.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

// Staff-only and auth screens must never be indexed.
const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      ...[
        "/admin/:path*",
        "/operations/:path*",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/setup",
        "/api/:path*",
      ].map((source) => ({ source, headers: noindex })),
    ];
  },
};

export default nextConfig;
