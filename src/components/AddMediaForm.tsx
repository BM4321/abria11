"use client";

import { useEffect, useRef, useState } from "react";
import { IMAGE_ACCEPT as ACCEPT, checkImage, fmtSize, uploadImage } from "@/lib/upload-image";
import type { MediaSlot } from "@/lib/media-slots";

const fieldLabel: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "var(--app-muted)" };
const fieldInput: React.CSSProperties = { minHeight: 42, borderRadius: 10, background: "var(--app-page)" };

export default function AddMediaForm({
  slots,
  taken,
}: {
  slots: MediaSlot[];
  /** slot id → file name currently shown there */
  taken: Record<string, string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [alt, setAlt] = useState("");
  const [category, setCategory] = useState("");
  const [placement, setPlacement] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pick(f: File | undefined) {
    setError(null);
    setDone(null);
    if (!f) return;
    const invalid = checkImage(f);
    if (invalid) {
      setError(invalid);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clear() {
    setFile(null);
    setPreview(null);
    setAlt("");
    setCategory("");
    setPlacement("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !preview) return;
    setError(null);
    setDone(null);
    setStatus("uploading");
    try {
      await uploadImage(file, { alt, category, placement, onSaving: () => setStatus("saving") });
      const slot = slots.find((s) => s.id === placement);
      setDone(slot ? `Uploaded and now showing on ${slot.label}.` : "Uploaded to the media library.");
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setStatus("idle");
    }
  }


  const busy = status !== "idle";
  const chosenSlot = slots.find((s) => s.id === placement);

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 18,
        borderRadius: 16,
        background: "var(--app-card)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an image: drop a file here or press Enter to browse"
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) pick(e.dataTransfer.files?.[0]);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
          minHeight: 150,
          padding: 20,
          borderRadius: 12,
          border: `2px dashed ${dragging ? "var(--color-accent)" : "var(--app-line)"}`,
          background: dragging
            ? "color-mix(in srgb,var(--color-accent) 8%,var(--app-page))"
            : "var(--app-page)",
          cursor: busy ? "progress" : "pointer",
          textAlign: "center",
          transition: "border-color .15s, background .15s",
        }}
      >
        {preview && file ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              style={{ width: 140, aspectRatio: chosenSlot?.aspect ?? "4/3", objectFit: "cover", borderRadius: 10 }}
            />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, wordBreak: "break-all" }}>{file.name}</div>
              <div style={{ fontSize: 13, color: "var(--app-muted)" }}>{fmtSize(file.size)}</div>
              <div style={{ fontSize: 13, color: "var(--color-accent-700)", marginTop: 6 }}>
                Click or drop to replace
              </div>
            </div>
          </>
        ) : (
          <div>
            <i className="ph-duotone ph-upload-simple" aria-hidden="true" style={{ fontSize: 36, color: "var(--app-muted)" }} />
            <div style={{ fontWeight: 600, marginTop: 6 }}>Drag and drop an image here</div>
            <div style={{ fontSize: 13, color: "var(--app-muted)" }}>
              or <span style={{ color: "var(--color-accent-700)", fontWeight: 500 }}>browse your files</span> · JPG,
              PNG, WebP, GIF, AVIF up to 10 MB
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      {file && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="m-place" style={fieldLabel}>Show on</label>
            <select
              id="m-place"
              className="input"
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              style={fieldInput}
            >
              <option value="">Library only (not shown on the site)</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                  {taken[s.id] ? ` (replaces ${taken[s.id]})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="m-alt" style={fieldLabel}>Alt text</label>
            <input
              id="m-alt"
              className="input"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
              required={Boolean(placement)}
              style={fieldInput}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="m-cat" style={fieldLabel}>Category</label>
            <input
              id="m-cat"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="General"
              style={fieldInput}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ minHeight: 42, borderRadius: 10, flex: 1 }}>
              <i className="ph ph-upload-simple" aria-hidden="true" />
              {status === "uploading" ? "Uploading…" : status === "saving" ? "Saving…" : "Upload"}
            </button>
            <button type="button" className="btn" disabled={busy} onClick={clear} style={{ minHeight: 42, borderRadius: 10 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 14, color: "var(--color-danger, #b42318)" }}>
          {error}
        </p>
      )}
      {done && (
        <p role="status" style={{ margin: 0, fontSize: 14, color: "var(--color-success, #067647)" }}>
          {done}
        </p>
      )}
    </form>
  );
}
