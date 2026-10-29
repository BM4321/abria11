import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import AddMediaForm from "@/components/AddMediaForm";
import ActionButton from "@/components/ActionButton";
import { deleteMediaAction } from "@/app/admin/actions";
import { fmtRelative } from "@/lib/console";
import MediaPlacementSelect from "@/components/MediaPlacementSelect";
import { MEDIA_SLOTS } from "@/lib/media-slots";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  const taken = Object.fromEntries(
    media.filter((m) => m.placement).map((m) => [m.placement as string, m.fileName]),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Media" subtitle="Images and files used across the public website." />
      <AddMediaForm slots={MEDIA_SLOTS} taken={taken} />

      {media.length === 0 ? (
        <section style={{ padding: "48px 24px", textAlign: "center", borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)" }}>
          <i className="ph-duotone ph-images" aria-hidden="true" style={{ fontSize: 44, color: "var(--app-muted)" }} />
          <p style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600 }}>No media yet</p>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
            Drag an image into the box above to upload it.
          </p>
        </section>
      ) : (
        <section style={{ borderRadius: 16, background: "var(--app-card)", boxShadow: "var(--shadow-sm)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["File", "Shown on", "Category", "Uploaded", "By", ""].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    style={{
                      textAlign: h === "" ? "right" : "left",
                      padding: "12px 18px",
                      borderBottom: "1px solid var(--app-line)",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--app-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {media.map((m) => (
                <tr key={m.id}>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <a href={m.url} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.url}
                          alt={m.alt ?? ""}
                          loading="lazy"
                          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, background: "var(--app-page)", display: "block" }}
                        />
                      </a>
                      <div style={{ minWidth: 0 }}>
                        <a href={m.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: "var(--color-accent-700)", wordBreak: "break-all" }}>
                          {m.fileName}
                        </a>
                        {m.alt && <div style={{ fontSize: 12, color: "var(--app-muted)" }}>{m.alt}</div>}
                        {(m.size || m.dimensions) && (
                          <div style={{ fontSize: 12, color: "var(--app-muted)" }}>
                            {[m.dimensions, m.size].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>
                    <MediaPlacementSelect id={m.id} fileName={m.fileName} value={m.placement} slots={MEDIA_SLOTS} taken={taken} />
                  </td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)" }}>{m.category}</td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)", color: "var(--app-muted)", whiteSpace: "nowrap" }}>
                    {fmtRelative(m.createdAt)}
                  </td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)", color: "var(--app-muted)" }}>
                    {m.uploadedBy ?? "—"}
                  </td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--app-line)", textAlign: "right" }}>
                    <ActionButton
                      action={deleteMediaAction.bind(null, m.id)}
                      label="Delete"
                      icon="ph-trash"
                      tone="icon"
                      confirmText={
                        m.placement
                          ? `Remove ${m.fileName}? It is currently shown on the website.`
                          : `Remove ${m.fileName}?`
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
