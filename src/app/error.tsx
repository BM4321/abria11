"use client";

import Link from "next/link";
import { useEffect } from "react";

// Route-level error boundary: a failed render or data load shows a recoverable
// message instead of a blank screen. Details go to the console/server logs only.
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ABRIA] Unhandled route error", error.digest ?? "", error);
  }, [error]);

  return (
    <main
      role="alert"
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "clamp(48px,10vw,120px) 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h1 style={{ margin: 0, fontSize: "clamp(28px,5vw,40px)" }}>Something went wrong</h1>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
        We couldn&apos;t load this page. Please try again. If it keeps happening, contact ABRIA on
        WhatsApp or email and quote reference {error.digest ?? "—"}.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link className="btn" href="/">
          Go to the homepage
        </Link>
      </div>
    </main>
  );
}
