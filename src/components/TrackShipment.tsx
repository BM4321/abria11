"use client";

import { useState } from "react";
import { STAGES } from "@/lib/site";
import { useSite } from "@/lib/i18n";
import { STATUS_LABELS, RequestStatus } from "@/lib/status";

type TrackResult = {
  requestId: string;
  status: string;
  pickupLocation: string;
  deliveryLocation: string;
  cargoType: string;
  transportDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedPartner: {
    companyName: string | null;
    contactPerson: string;
    truckType: string;
    registrationNumber: string;
  } | null;
};

export default function TrackShipment() {
  const { T, wa } = useSite();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refError, setRefError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = id.trim();
    if (!value) {
      setRefError("Enter your ABR reference to track a shipment.");
      document.getElementById("track-ref")?.focus();
      return;
    }
    setRefError("");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Unable to find that request.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: "var(--page-max)",
        margin: "0 auto",
        padding: "clamp(48px,8vw,112px) clamp(20px,5vw,72px) 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
          }}
        >
          AB Track
        </span>
        <span className="tag tag-accent">{T("Live", "Moja kwa moja")}</span>
      </div>
      <h1
        style={{
          fontSize: "clamp(44px,6.4vw,88px)",
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
          margin: "0 0 0 -0.035em",
          maxWidth: "11em",
        }}
      >
        {T("Track your shipment.", "Fuatilia mzigo wako.")}
      </h1>
      <p
        style={{
          fontSize: 19,
          lineHeight: "30px",
          maxWidth: "34em",
          margin: "28px 0 0",
          color: "color-mix(in srgb,var(--color-text) 82%,transparent)",
        }}
      >
        {T(
          "Enter the ABR reference you received when you submitted your request to see its current stage. If you need more detail, the team can help on WhatsApp.",
          "Weka namba ya ABR uliyoipata ulipowasilisha ombi lako ili kuona hatua ya sasa. Ikiwa unahitaji maelezo zaidi, timu inaweza kukusaidia kwa WhatsApp."
        )}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
          gap: "56px clamp(40px,7vw,120px)",
          marginTop: "clamp(48px,6vw,80px)",
          alignItems: "start",
        }}
      >
        <section aria-labelledby="lookup-h">
          <h2 id="lookup-h" style={{ margin: 0, fontSize: 26 }}>
            {T("Look up a shipment", "Tafuta mzigo")}
          </h2>
          <form
            noValidate
            onSubmit={submit}
            style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="track-ref" style={{ fontSize: 14 }}>
                {T("ABR reference", "Namba ya ABR")}{" "}
                <span aria-hidden="true" style={{ color: "var(--color-accent-2-700)" }}>
                  *
                </span>
              </label>
              <input
                className="input"
                id="track-ref"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="ABR-2026-000001"
                aria-required={true}
                aria-invalid={refError ? "true" : "false"}
                aria-describedby={refError ? "track-ref-err" : undefined}
                style={{
                  minHeight: 46,
                  fontSize: 16,
                  textTransform: "uppercase",
                  borderColor: refError ? "var(--color-accent-2)" : "var(--color-divider)",
                }}
              />
              {refError && (
                <p
                  id="track-ref-err"
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--color-accent-2-700)",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <i
                    className="ph-duotone ph-warning-circle"
                    aria-hidden="true"
                    style={{ fontSize: 16 }}
                  />
                  {refError}
                </p>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ fontSize: 16, padding: "14px 24px", minHeight: 50 }}
              >
                {loading && (
                  <i
                    className="ph-duotone ph-truck"
                    aria-hidden="true"
                    style={{ fontSize: 20, animation: "abria-drive 0.7s ease-in-out infinite" }}
                  />
                )}
                {loading ? T("Tracking…", "Inafuatilia…") : T("Track shipment", "Fuatilia mzigo")}
              </button>
            </div>
          </form>

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 24,
                padding: 16,
                background: "var(--color-accent-2-100)",
                color: "var(--color-accent-2-800)",
                borderRadius: "var(--radius-md)",
                fontSize: 15,
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: 28,
                padding: 24,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 24 }}>{result.requestId}</h3>
                <span className="tag tag-accent">
                  {STATUS_LABELS[result.status as RequestStatus] ?? result.status}
                </span>
              </div>
              <dl
                style={{
                  margin: "20px 0 0",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))",
                  gap: "16px 24px",
                }}
              >
                <div>
                  <dt style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "color-mix(in srgb,var(--color-text) 66%,transparent)" }}>
                    {T("Route", "Njia")}
                  </dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 16 }}>
                    {result.pickupLocation} → {result.deliveryLocation}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "color-mix(in srgb,var(--color-text) 66%,transparent)" }}>
                    {T("Cargo", "Mzigo")}
                  </dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 16 }}>{result.cargoType}</dd>
                </div>
                {result.transportDate && (
                  <div>
                    <dt style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "color-mix(in srgb,var(--color-text) 66%,transparent)" }}>
                      {T("Date of transport", "Tarehe ya usafiri")}
                    </dt>
                    <dd style={{ margin: "4px 0 0", fontSize: 16 }}>
                      {new Date(result.transportDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div>
                  <dt style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "color-mix(in srgb,var(--color-text) 66%,transparent)" }}>
                    {T("Last updated", "Ilisasishwa mwisho")}
                  </dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 16 }}>
                    {new Date(result.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
              {result.assignedPartner && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    borderRadius: "var(--radius-md)",
                    background: "color-mix(in srgb,var(--color-accent) 8%,transparent)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--color-accent-700)",
                    }}
                  >
                    {T("Assigned transport", "Usafiri uliopangwa")}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 16 }}>
                    {result.assignedPartner.companyName ??
                      result.assignedPartner.contactPerson}
                  </div>
                  <div style={{ fontSize: 14, color: "color-mix(in srgb,var(--color-text) 70%,transparent)" }}>
                    {result.assignedPartner.truckType} ·{" "}
                    {result.assignedPartner.registrationNumber}
                  </div>
                </div>
              )}
            </div>
          )}

          <h2 style={{ margin: "56px 0 0", fontSize: 26 }}>
            {T("Need a status update today?", "Unahitaji taarifa ya hali leo?")}
          </h2>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 16,
              lineHeight: "26px",
              color: "color-mix(in srgb,var(--color-text) 80%,transparent)",
            }}
          >
            {T(
              "Send your ABR reference on WhatsApp and the team will reply with the current stage of your shipment.",
              "Tuma namba yako ya ABR kwa WhatsApp na timu itajibu na hatua ya sasa ya mzigo wako."
            )}
          </p>
          <a
            className="btn btn-secondary"
            href={wa(
              `Hello ABRIA, could I have a status update on my shipment?${
                id.trim() ? "\nReference: " + id.trim().toUpperCase() : "\nReference: ABR-"
              }`
            )}
            target="_blank"
            rel="noopener"
            style={{ marginTop: 20, fontSize: 16, padding: "14px 24px", minHeight: 50 }}
          >
            <i
              className="ph-duotone ph-whatsapp-logo"
              aria-hidden="true"
              style={{ fontSize: 20, color: "var(--color-accent)" }}
            />
            {T("Ask for a status update", "Uliza taarifa ya hali")}
          </a>
        </section>

        <section aria-labelledby="stages-h">
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "color-mix(in srgb,var(--color-text) 72%,transparent)",
            }}
          >
            {T("What tracking shows", "Kile ufuatiliaji unaonyesha")}
          </p>
          <h2 id="stages-h" style={{ margin: 0, fontSize: 26 }}>
            {T(
              "Each stage of your shipment, against its ABR reference.",
              "Kila hatua ya mzigo wako, kwa namba yake ya ABR."
            )}
          </h2>
          <ol data-stagger="1" style={{ listStyle: "none", margin: "28px 0 0", padding: 0 }}>
            {STAGES.map((label, i) => (
              <li
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px minmax(0,1fr)",
                  gap: 14,
                  paddingBottom: 16,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ position: "relative", display: "flex", justifyContent: "center" }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      bottom: -16,
                      width: 1,
                      background:
                        i === STAGES.length - 1
                          ? "transparent"
                          : "color-mix(in srgb,var(--color-text) 30%,transparent)",
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      marginTop: 8,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      border: "1.5px solid var(--color-text)",
                      background: "var(--color-bg)",
                    }}
                  />
                </span>
                <span style={{ fontSize: 17, lineHeight: "26px" }}>{label}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
