"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { tone } from "@/lib/console";

export type Cell = {
  t?: string;
  sub?: string;
  href?: string;
  badge?: string;
  align?: "left" | "right";
  mono?: boolean;
};

export type Row = {
  id: string;
  href?: string;
  date?: string | null;
  search?: string;
  cells: Record<string, Cell>;
  f?: Record<string, string>;
  s?: Record<string, string | number | null>;
  actions?: { label: string; icon: string; href: string }[];
};

export type Column = {
  key: string;
  label: string;
  align?: "left" | "right";
  sort?: boolean;
};

export default function DataTable({
  title,
  subtitle,
  columns,
  rows,
  filters = [],
  initial = {},
  search = "Search",
  dateFilter = false,
  primary,
  noun = "records",
  pageSize = 10,
  emptyTitle = "Nothing here yet",
  emptyText = "",
  emptyIcon = "ph-tray",
  footLink,
}: {
  title?: string;
  subtitle?: string;
  columns: Column[];
  rows: Row[];
  filters?: { key: string; label: string; options: string[] }[];
  initial?: Record<string, string>;
  search?: string;
  dateFilter?: boolean;
  primary?: { label: string; href: string };
  noun?: string;
  pageSize?: number;
  emptyTitle?: string;
  emptyText?: string;
  emptyIcon?: string;
  footLink?: { label: string; href: string };
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<string | null>(null);
  const [dir, setDir] = useState(1);
  const [page, setPage] = useState(0);
  const [f, setF] = useState<Record<string, string>>(initial);
  const [range, setRange] = useState("");
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (!window.ResizeObserver || !rootRef.current) return;
    const ro = new ResizeObserver((es) => {
      setNarrow(es[0].contentRect.width < 640);
    });
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, []);

  const ql = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    const inRange = (iso?: string | null) => {
      if (!range || !iso) return true;
      const dd = Math.round(
        (Date.parse(iso.slice(0, 10)) - Date.parse(new Date().toISOString().slice(0, 10))) /
          86400000
      );
      if (range === "today") return dd === 0;
      return dd <= 0 && dd > -Number(range);
    };
    let out = rows.filter(
      (r) =>
        (!ql || (r.search ?? "").toLowerCase().includes(ql)) &&
        Object.keys(f).every((k) => !f[k] || (r.f?.[k] ?? "") === f[k]) &&
        inRange(r.date)
    );
    if (sort) {
      const sv = (r: Row) => {
        if (r.s && r.s[sort] != null) return r.s[sort] as string | number;
        const c = r.cells[sort] ?? {};
        return c.badge ?? c.t ?? "";
      };
      out = out.slice().sort((a, b) => {
        const x = sv(a);
        const y = sv(b);
        return (x > y ? 1 : x < y ? -1 : 0) * dir;
      });
    }
    return out;
  }, [rows, ql, f, range, sort, dir]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const anyFilter = q || range || Object.keys(f).some((k) => f[k]);

  const clearAll = () => {
    setQ("");
    setRange("");
    setF({});
    setPage(0);
  };

  const start = Math.max(0, Math.min(safePage - 2, pages - 5));
  const pageBtns = [];
  for (let i = start; i < Math.min(pages, start + 5); i++) pageBtns.push(i);

  return (
    <section
      ref={rootRef}
      aria-label={title || noun}
      style={{
        background: "var(--app-card)",
        borderRadius: 16,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {(title || !false) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "10px 12px",
            padding: "16px 16px 12px",
          }}
        >
          {title && (
            <div style={{ marginRight: "auto", minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: 0 }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--app-muted)" }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 340 }}>
            <i
              className="ph ph-magnifying-glass"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                color: "var(--app-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              className="input"
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder={search}
              aria-label={search}
              style={{
                paddingLeft: 36,
                minHeight: 40,
                borderRadius: 10,
                background: "var(--app-page)",
                fontSize: 14,
              }}
            />
          </div>
          {filters.map((x) => (
            <select
              key={x.key}
              className="input"
              aria-label={x.label}
              value={f[x.key] ?? ""}
              onChange={(e) => {
                setF((s) => ({ ...s, [x.key]: e.target.value }));
                setPage(0);
              }}
              style={{
                width: "auto",
                minHeight: 40,
                borderRadius: 10,
                background: "var(--app-page)",
                fontSize: 14,
                paddingRight: 28,
                color: f[x.key] ? "var(--color-accent-800)" : "var(--color-text)",
              }}
            >
              <option value="">All {x.label.toLowerCase()}</option>
              {x.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
          {dateFilter && (
            <select
              className="input"
              aria-label="Date range"
              value={range}
              onChange={(e) => {
                setRange(e.target.value);
                setPage(0);
              }}
              style={{
                width: "auto",
                minHeight: 40,
                borderRadius: 10,
                background: "var(--app-page)",
                fontSize: 14,
                paddingRight: 28,
              }}
            >
              <option value="">Any date</option>
              <option value="today">Today</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
          )}
          {anyFilter && (
            <button
              type="button"
              onClick={clearAll}
              className="btn btn-ghost"
              style={{ minHeight: 40, fontSize: 13 }}
            >
              Clear
            </button>
          )}
          {primary && (
            <Link
              className="btn btn-primary"
              href={primary.href}
              style={{ minHeight: 40, borderRadius: 10, marginLeft: title ? 0 : "auto" }}
            >
              <i className="ph ph-plus" aria-hidden="true" style={{ fontSize: 16 }} />
              {primary.label}
            </Link>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <span
            style={{
              width: 56,
              height: 56,
              margin: "0 auto",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "color-mix(in srgb,var(--color-accent) 12%,transparent)",
              color: "var(--color-accent-700)",
            }}
          >
            <i className={`ph-duotone ${emptyIcon}`} aria-hidden="true" style={{ fontSize: 28 }} />
          </span>
          <p style={{ margin: "16px 0 4px", fontSize: 17, fontWeight: 600 }}>{emptyTitle}</p>
          <p
            style={{
              margin: "0 auto",
              maxWidth: "40ch",
              fontSize: 14,
              color: "var(--app-muted)",
            }}
          >
            {emptyText}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <i className="ph-duotone ph-funnel-x" aria-hidden="true" style={{ fontSize: 32, color: "var(--app-muted)" }} />
          <p style={{ margin: "10px 0 4px", fontSize: 16, fontWeight: 600 }}>No results</p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>
            Nothing matches the current search or filters.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="btn btn-secondary"
            style={{ marginTop: 14, minHeight: 38, borderRadius: 10 }}
          >
            Clear filters
          </button>
        </div>
      ) : narrow ? (
        <ul style={{ listStyle: "none", margin: 0, padding: "4px 12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {slice.map((r) => {
            const first = r.cells[columns[0].key] ?? {};
            return (
              <li
                key={r.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "var(--app-page)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {first.href ? (
                      <Link
                        href={first.href}
                        style={{ fontWeight: 600, fontSize: 15, color: "var(--color-accent-700)", textDecoration: "none" }}
                      >
                        {first.t}
                      </Link>
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{first.t}</span>
                    )}
                    {first.sub && (
                      <span style={{ display: "block", fontSize: 12, color: "var(--app-muted)" }}>
                        {first.sub}
                      </span>
                    )}
                  </div>
                  {columns.map((c) => {
                    const cell = r.cells[c.key];
                    if (!cell?.badge) return null;
                    const t = tone(cell.badge);
                    return (
                      <span
                        key={c.key}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "3px 10px 3px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 500,
                          background: t.bg,
                          color: t.fg,
                          whiteSpace: "nowrap",
                          flex: "none",
                        }}
                      >
                        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: t.dot }} />
                        {cell.badge}
                      </span>
                    );
                  })}
                </div>
                <dl style={{ margin: "10px 0 0", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "8px 16px" }}>
                  {columns.slice(1).map((c) => {
                    const cell = r.cells[c.key];
                    if (!cell) return null;
                    return (
                      <div key={c.key} style={{ minWidth: 0 }}>
                        <dt style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--app-muted)" }}>
                          {c.label}
                        </dt>
                        <dd style={{ margin: "2px 0 0", fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cell.badge ?? cell.t ?? "—"}
                          {cell.sub ? ` · ${cell.sub}` : ""}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            );
          })}
        </ul>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {columns.map((c) => {
                  const s = sort === c.key;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      style={{
                        textAlign: c.align ?? "left",
                        padding: "10px 16px",
                        borderBottom: "1px solid var(--app-line)",
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: "0.03em",
                        color: "var(--app-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.sort === false ? (
                        c.label
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSort(c.key);
                            setDir((d) => (sort === c.key ? -d : 1));
                            setPage(0);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            border: 0,
                            background: "none",
                            padding: "4px 0",
                            font: "inherit",
                            fontWeight: 500,
                            color: s ? "var(--color-text)" : "var(--app-muted)",
                            cursor: "pointer",
                          }}
                        >
                          {c.label}
                          <i
                            className={s ? (dir > 0 ? "ph ph-caret-up" : "ph ph-caret-down") : "ph ph-caret-up-down"}
                            aria-hidden="true"
                            style={{ fontSize: 12, opacity: s ? 1 : 0.45 }}
                          />
                        </button>
                      )}
                    </th>
                  );
                })}
                <th
                  scope="col"
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--app-line)",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--app-muted)",
                    textAlign: "right",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => {
                    const cell = r.cells[c.key] ?? {};
                    const t = cell.badge ? tone(cell.badge) : null;
                    return (
                      <td
                        key={c.key}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--app-line)",
                          textAlign: c.align ?? "left",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "3px 10px 3px 8px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 500,
                              background: t.bg,
                              color: t.fg,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: t.dot }} />
                            {cell.badge}
                          </span>
                        ) : cell.href ? (
                          <Link
                            href={cell.href}
                            style={{
                              fontWeight: 600,
                              color: "var(--color-accent-700)",
                              textDecoration: "none",
                              fontFeatureSettings: "'tnum' 1",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cell.t}
                          </Link>
                        ) : (
                          <span
                            style={{
                              display: "block",
                              fontFeatureSettings: "'tnum' 1",
                              fontWeight: cell.mono ? 600 : 400,
                            }}
                          >
                            {cell.t ?? "—"}
                          </span>
                        )}
                        {cell.sub && (
                          <span
                            style={{
                              display: "block",
                              marginTop: 1,
                              fontSize: 12,
                              color: "var(--app-muted)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cell.sub}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid var(--app-line)",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(r.actions ?? []).map((a) => (
                      <Link
                        key={a.label}
                        href={a.href}
                        title={a.label}
                        aria-label={a.label}
                        style={{
                          display: "inline-grid",
                          placeItems: "center",
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          color: "var(--app-muted)",
                          textDecoration: "none",
                        }}
                      >
                        <i className={`ph ${a.icon}`} aria-hidden="true" style={{ fontSize: 18 }} />
                      </Link>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(filtered.length > 0 || (footLink && rows.length > 0)) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "10px 16px 14px",
            fontSize: 13,
            color: "var(--app-muted)",
          }}
        >
          <span>
            {filtered.length
              ? `${safePage * pageSize + 1}–${Math.min(filtered.length, safePage * pageSize + pageSize)} of ${filtered.length}`
              : ""}
          </span>
          {footLink ? (
            <Link
              href={footLink.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-accent-700)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {footLink.label}
              <i className="ph ph-arrow-right" aria-hidden="true" />
            </Link>
          ) : (
            pages > 1 && (
              <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setPage(Math.max(0, safePage - 1))}
                  disabled={safePage === 0}
                  aria-label="Previous page"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: 0,
                    background: "transparent",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    opacity: safePage === 0 ? 0.35 : 1,
                  }}
                >
                  <i className="ph ph-caret-left" aria-hidden="true" />
                </button>
                {pageBtns.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    aria-current={i === safePage ? "page" : undefined}
                    style={{
                      minWidth: 34,
                      height: 34,
                      borderRadius: 10,
                      border: 0,
                      background:
                        i === safePage
                          ? "color-mix(in srgb,var(--color-accent) 16%,transparent)"
                          : "transparent",
                      color: i === safePage ? "var(--color-accent-800)" : "var(--color-text)",
                      font: "inherit",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(Math.min(pages - 1, safePage + 1))}
                  disabled={safePage >= pages - 1}
                  aria-label="Next page"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: 0,
                    background: "transparent",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    opacity: safePage >= pages - 1 ? 0.35 : 1,
                  }}
                >
                  <i className="ph ph-caret-right" aria-hidden="true" />
                </button>
              </nav>
            )
          )}
        </div>
      )}
    </section>
  );
}
