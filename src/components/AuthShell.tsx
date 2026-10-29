import Link from "next/link";
import AuthThemeToggle from "@/components/AuthThemeToggle";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Show the "Back to site" link (default true). */
  backToSite?: boolean;
  maxWidth?: number;
};

// Shared shell for the sign-in / account pages. Uses the broadsheet design
// tokens so it matches the public site and respects light/dark themes.
export default function AuthShell({
  title,
  subtitle,
  children,
  backToSite = true,
  maxWidth = 440,
}: Props) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        // minmax(0,1fr) caps the column at the viewport; an auto track grows to
        // the card's widest content and pushed the header off-screen on phones.
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        padding: "40px clamp(20px,5vw,72px)",
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div style={{ width: "100%", maxWidth, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <Link
            href="/"
            aria-label="ABRIA Logistics, home"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              textDecoration: "none",
              color: "var(--color-text)",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 26,
                letterSpacing: "0.08em",
                lineHeight: 1,
              }}
            >
              ABRIA
            </span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "color-mix(in srgb,var(--color-text) 70%,transparent)",
              }}
            >
              Logistics
            </span>
          </Link>
          <AuthThemeToggle />
        </div>

        <div
          className="card elev-md"
          style={{
            padding: "clamp(24px,4vw,36px)",
            background: "var(--color-surface)",
            overflowWrap: "anywhere",
            gap: 0,
          }}
        >
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>{title}</h1>
          {subtitle && (
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 14,
                color: "color-mix(in srgb,var(--color-text) 70%,transparent)",
              }}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>

        {backToSite && (
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14 }}>
            <Link
              href="/"
              style={{
                color: "color-mix(in srgb,var(--color-text) 70%,transparent)",
                textDecoration: "none",
              }}
            >
              ← Back to abrialogistics.co.tz
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
