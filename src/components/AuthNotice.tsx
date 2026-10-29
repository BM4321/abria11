type Tone = "success" | "error" | "warning";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: "var(--color-accent-100)", fg: "var(--color-accent-800)" },
  warning: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)" },
  error: { bg: "var(--color-accent-2-100)", fg: "var(--color-accent-2-800)" },
};

const ICONS: Record<Tone, string> = {
  success: "ph-duotone ph-check-circle",
  warning: "ph-duotone ph-warning",
  error: "ph-duotone ph-x-circle",
};

export default function AuthNotice({
  tone,
  title,
  children,
}: {
  tone: Tone;
  title?: string;
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        borderRadius: "var(--radius-md)",
        background: t.bg,
        color: t.fg,
        padding: "12px 14px",
        fontSize: 13.5,
        lineHeight: 1.5,
        marginBottom: 16,
      }}
    >
      <i
        className={ICONS[tone]}
        aria-hidden="true"
        style={{ fontSize: 18, flex: "none", marginTop: 1 }}
      />
      <div>
        {title && <p style={{ margin: "0 0 2px", fontWeight: 600 }}>{title}</p>}
        {children}
      </div>
    </div>
  );
}
