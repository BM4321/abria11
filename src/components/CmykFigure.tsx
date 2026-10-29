"use client";

import { ReactNode } from "react";

// Stands in for the design's <image-slot> photo frame. Renders the Broadsheet
// .cmyk process-plate treatment when an image is supplied, and a labelled
// placeholder otherwise (mirrors the empty slot in the prototypes).

export default function CmykFigure({
  src,
  alt,
  placeholder,
  aspect = "4/5",
  style,
}: {
  src?: string;
  alt?: string;
  placeholder?: string;
  aspect?: string;
  style?: React.CSSProperties;
}) {
  return (
    <figure
      data-reveal="1"
      className="cmyk"
      style={{ margin: 0, overflow: "visible", ...style }}
    >
      {/* Height is capped so a portrait frame in a wide column never runs past
          the screen; object-fit: cover crops the photo to fit. */}
      <div className="print" style={{ aspectRatio: aspect, maxHeight: "min(78vh, 820px)", width: "100%" }}>
        {src ? (
          // broadsheet.css hides `.cmyk img:first-child` (the sizing base) and
          // prints the `img + img` layer over it, so the photo is the second img.
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt ?? ""} />
          </>
        ) : (
          <div
            role="img"
            aria-label={alt ?? placeholder ?? "Image placeholder"}
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 16,
              background: "var(--color-surface)",
              color: "color-mix(in srgb,var(--color-text) 60%,transparent)",
              fontSize: 13,
              lineHeight: 1.4,
              borderRadius: "var(--radius-lg)",
            }}
          >
            <span>{placeholder ?? "Approved photograph"}</span>
          </div>
        )}
      </div>
    </figure>
  );
}

export function Rail() {
  return (
    <div style={{ position: "relative" }}>
      <span
        data-drive="1"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          bottom: "100%",
          marginBottom: 1,
          display: "flex",
          color: "var(--color-accent)",
        }}
      >
        <i className="ph-duotone ph-truck" style={{ fontSize: 34 }} />
      </span>
      <hr
        style={{
          height: 5,
          border: 0,
          margin: 0,
          borderTop: "2px solid var(--color-text)",
          borderBottom: "1px solid var(--color-text)",
        }}
      />
    </div>
  );
}

export function Section({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: "var(--page-max)",
        margin: "0 auto",
        padding:
          "clamp(64px,9vw,128px) clamp(20px,5vw,72px) 0",
      }}
    >
      {children}
    </section>
  );
}
