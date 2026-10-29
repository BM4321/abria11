import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        maxWidth: "var(--page-max)",
        margin: "0 auto",
        padding: "clamp(56px,9vw,128px) clamp(20px,5vw,72px) 0",
      }}
    >
      <div
        className="cmyk-num"
        style={{
          fontSize: "clamp(120px,20vw,240px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
        }}
      >
        <span className="paper">404</span>
        <span className="plate plate-c" aria-hidden="true">
          404
        </span>
        <span className="plate plate-m" aria-hidden="true">
          404
        </span>
        <span className="plate plate-y" aria-hidden="true">
          404
        </span>
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          height: 44,
          maxWidth: 560,
          marginTop: "clamp(24px,3vw,40px)",
          overflow: "hidden",
        }}
      >
        <i
          className="ph-duotone ph-truck"
          style={{
            position: "absolute",
            bottom: 5,
            left: -48,
            fontSize: 38,
            color: "var(--color-accent)",
            animation: "abria-lost 7s ease-in-out infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            borderRadius: 3,
            background:
              "repeating-linear-gradient(90deg,var(--color-text) 0 16px,transparent 16px 28px)",
            animation: "abria-road 0.9s linear infinite",
          }}
        />
      </div>
      <h1
        style={{
          fontSize: "clamp(36px,4.8vw,60px)",
          lineHeight: 1.06,
          letterSpacing: "-0.02em",
          margin: "clamp(32px,4vw,48px) 0 0 -0.035em",
          maxWidth: "14em",
        }}
      >
        Looks like this shipment took a wrong turn.
      </h1>
      <p
        style={{
          fontSize: 18,
          lineHeight: "28px",
          maxWidth: "32em",
          margin: "20px 0 0",
          color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
        }}
      >
        The page you asked for isn&apos;t here. It may have moved, or the link may
        be out of date.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
        <Link
          className="btn btn-primary"
          href="/"
          style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
        >
          Return Home
        </Link>
        <Link
          className="btn btn-secondary"
          href="/solutions"
          style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
        >
          Explore Solutions
        </Link>
      </div>
      <style>{`@keyframes abria-lost{0%{left:-48px;transform:scaleX(1)}45%{left:calc(100% - 8px);transform:scaleX(1)}50%{left:calc(100% - 8px);transform:scaleX(-1)}95%{left:-48px;transform:scaleX(-1)}100%{left:-48px;transform:scaleX(1)}}@keyframes abria-road{to{background-position:-56px 0}}.cmyk-head .plate,.cmyk-num .plate{display:inline}@media (prefers-reduced-motion:reduce){*{animation:none!important}}`}</style>
    </main>
  );
}
