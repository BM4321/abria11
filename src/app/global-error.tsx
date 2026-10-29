"use client";

// Last-resort boundary for errors in the root layout itself. It replaces the
// whole document, so it cannot rely on the app's stylesheets.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f3f2f2", color: "#201e1d" }}>
        <main role="alert" style={{ maxWidth: 560, margin: "0 auto", padding: "96px 20px" }}>
          <h1 style={{ fontSize: 32, margin: "0 0 12px" }}>ABRIA Logistics is temporarily unavailable</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 0 20px" }}>
            Please try again in a moment. Reference: {error.digest ?? "—"}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ minHeight: 44, padding: "0 20px", border: 0, borderRadius: 8, background: "#0088b0", color: "#fff", fontSize: 16, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
