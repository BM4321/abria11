"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, ReactNode } from "react";
import { useSite } from "@/lib/i18n";
import { initials } from "@/lib/console";

export type Counts = {
  newReq: number;
  expiring: number;
  delayed: number;
  pendingCar: number;
  unread: number;
};

type NavItem = {
  k: string;
  label: string;
  icon: string;
  href: string;
  count?: number;
};

type Group = { id: string; label?: string; items: NavItem[] };

function navFor(isAdmin: boolean, c: Counts): Group[] {
  const it = (k: string, label: string, icon: string, href: string, count = 0): NavItem => ({
    k,
    label,
    icon,
    href,
    count,
  });
  const ops = [
    it("requests", "Requests", "ph-duotone ph-clipboard-text", "/operations/requests", c.newReq),
    it("quotes", "Quotes", "ph-duotone ph-receipt", "/operations/quotes", c.expiring),
    it("shipments", "Shipments", "ph-duotone ph-package", "/operations/shipments", c.delayed),
    it("deliveries", "Deliveries", "ph-duotone ph-seal-check", "/operations/deliveries"),
  ];
  const net = [
    it("customers", "Customers", "ph-duotone ph-users", "/operations/customers"),
    it("carriers", "Carriers", "ph-duotone ph-truck", "/operations/carriers", c.pendingCar),
    it("trucks", "Trucks", "ph-duotone ph-steering-wheel", "/operations/trucks"),
  ];
  if (!isAdmin) {
    return [
      { id: "main", items: [it("dash", "Dashboard", "ph-duotone ph-squares-four", "/operations/dashboard")] },
      { id: "ops", label: "Operations", items: ops },
      { id: "net", label: "Network", items: net },
      {
        id: "ins",
        label: "Insights",
        items: [
          it("reports", "Reports", "ph-duotone ph-chart-line-up", "/operations/reports"),
          it("notifications", "Notifications", "ph-duotone ph-bell", "/operations/notifications", c.unread),
        ],
      },
    ];
  }
  return [
    { id: "main", items: [it("admin", "Dashboard", "ph-duotone ph-squares-four", "/admin")] },
    {
      id: "ops",
      label: "Operations",
      items: [
        ...ops,
        ...net,
        it("reports", "Reports", "ph-duotone ph-chart-line-up", "/operations/reports"),
      ],
    },
    {
      id: "web",
      label: "Website",
      items: [
        it("web:homepage", "Homepage", "ph-duotone ph-house-line", "/admin/website/homepage"),
        it("web:pages", "Pages", "ph-duotone ph-files", "/admin/website/pages"),
        it("web:media", "Media", "ph-duotone ph-images", "/admin/website/media"),
      ],
    },
    {
      id: "forms",
      label: "Forms",
      items: [
        it("forms:all", "All forms", "ph-duotone ph-list-bullets", "/admin/forms"),
        it("forms:submissions", "Submissions", "ph-duotone ph-tray", "/admin/forms/submissions"),
      ],
    },
    {
      id: "users",
      label: "Users",
      items: [
        it("users:all", "Users", "ph-duotone ph-users-three", "/admin/users"),
        it("users:roles", "Roles & Permissions", "ph-duotone ph-shield-check", "/admin/users/roles"),
      ],
    },
    {
      id: "settings",
      label: "Settings",
      items: [
        it("settings:general", "General", "ph-duotone ph-gear", "/admin/settings/general"),
        it("settings:branding", "Branding", "ph-duotone ph-palette", "/admin/settings/branding"),
        it("settings:seo", "SEO", "ph-duotone ph-magnifying-glass", "/admin/settings/seo"),
        it("settings:notifications", "Notifications", "ph-duotone ph-bell-ringing", "/admin/settings/notifications"),
        it("settings:integrations", "Integrations", "ph-duotone ph-plugs", "/admin/settings/integrations"),
        it("settings:security", "Security", "ph-duotone ph-lock-key", "/admin/settings/security"),
      ],
    },
    { id: "audit", items: [it("audit", "Audit Logs", "ph-duotone ph-scroll", "/admin/audit")] },
  ];
}

function deriveActive(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  const seg = p.split("/").filter(Boolean);
  const last = seg[seg.length - 1] ?? "";
  const map: Record<string, string> = {
    dashboard: "dash",
    requests: "requests",
    quotes: "quotes",
    shipments: "shipments",
    deliveries: "deliveries",
    customers: "customers",
    carriers: "carriers",
    trucks: "trucks",
    reports: "reports",
    notifications: "notifications",
    audit: "audit",
    users: "users:all",
    roles: "users:roles",
    forms: "forms:all",
    submissions: "forms:submissions",
    homepage: "web:homepage",
    media: "web:media",
    pages: "web:pages",
    admin: "admin",
  };
  if (p === "/admin") return "admin";
  if (p.startsWith("/admin/users")) return p.endsWith("roles") ? "users:roles" : "users:all";
  if (p.startsWith("/admin/forms")) return p.includes("/submissions") ? "forms:submissions" : "forms:all";
  if (p.startsWith("/admin/website")) return map[last] ?? "web:pages";
  if (p.startsWith("/admin/settings")) return `settings:${p === "/admin/settings" ? "general" : last}`;
  return map[last] ?? "dash";
}

export default function ConsoleShell({
  children,
  active,
  isAdmin = false,
  userName = "Ops User",
  userRole = "Operations",
  userEmail = "",
  counts = { newReq: 0, expiring: 0, delayed: 0, pendingCar: 0, unread: 0 },
  notifications = [],
}: {
  children: ReactNode;
  active: string;
  isAdmin?: boolean;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  counts?: Counts;
  notifications?: {
    id: string;
    title: string;
    category: string;
    icon: string;
    href: string | null;
    read: boolean;
    when: string;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useSite();
  const activeKey = active || deriveActive(pathname);
  const [wide, setWide] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [bell, setBell] = useState(false);
  const [user, setUser] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [rot, setRot] = useState(0);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("abria-sidebar") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth >= 1024;
      setWide((prev) => {
        if (prev !== w) setDrawer(false);
        return w;
      });
    };
    const onScroll = () => setScrolled(window.scrollY > 4);
    const onDoc = (e: PointerEvent) => {
      const inside = (r: React.RefObject<HTMLDivElement | null>) =>
        r.current && r.current.contains(e.target as Node);
      if (searchOpen && !inside(searchRef)) setSearchOpen(false);
      if (bell && !inside(bellRef)) setBell(false);
      if (user && !inside(userRef)) setUser(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setBell(false);
        setUser(false);
        setDrawer(false);
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onDoc);
    window.addEventListener("keydown", onKey);
    onResize();
    onScroll();
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, bell, user]);

  const col = wide && collapsed;
  const showLabels = !col;
  const sideW = wide ? (col ? "76px" : "256px") : "280px";
  const groups = navFor(isAdmin, counts);
  const meInit = initials(userName);

  const toggleCollapse = () => {
    const v = !collapsed;
    try {
      localStorage.setItem("abria-sidebar", v ? "1" : "0");
    } catch {
      /* ignore */
    }
    setCollapsed(v);
  };

  const on = (x: boolean) => (x ? "var(--app-hover)" : "transparent");

  const itemView = (x: NavItem) => {
    const isActive = x.k === activeKey;
    return {
      ...x,
      isActive,
      aria: (isActive ? "page" : undefined) as "page" | undefined,
      title: col ? x.label : undefined,
      fw: isActive ? 600 : 400,
      fg: isActive ? "var(--color-accent-800)" : "var(--color-text)",
      ic: isActive ? "var(--color-accent)" : "var(--app-muted)",
      bg: isActive
        ? "color-mix(in srgb,var(--color-accent) 14%,transparent)"
        : "transparent",
      px: col ? "0" : "12px",
      jc: col ? "center" : "flex-start",
      pill: showLabels && (x.count ?? 0) > 0,
      dot: col && (x.count ?? 0) > 0,
    };
  };

  const bottom: NavItem[] = isAdmin
    ? [
        { k: "site", label: "Public website", icon: "ph-duotone ph-globe-hemisphere-east", href: "/" },
        { k: "signout", label: "Sign out", icon: "ph-duotone ph-sign-out", href: "/api/auth/logout" },
      ]
    : [
        { k: "settings", label: "Settings", icon: "ph-duotone ph-gear", href: "/operations/settings" },
        { k: "site", label: "Public website", icon: "ph-duotone ph-globe-hemisphere-east", href: "/" },
        { k: "signout", label: "Sign out", icon: "ph-duotone ph-sign-out", href: "/api/auth/logout" },
      ];

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const areaLabel = isAdmin ? "Admin" : "Operations";
  const unread = counts.unread;

  return (
    <div style={{ background: "var(--app-page)", minHeight: "100vh" }}>
      {!wide && drawer && (
        <div
          onClick={() => setDrawer(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 79,
            background: "color-mix(in srgb,#000 42%,transparent)",
            animation: "abria-fade .2s ease",
          }}
        />
      )}
      <aside
        aria-label="Console navigation"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 80,
          width: sideW,
          background: "var(--app-card)",
          boxShadow: wide ? "1px 0 0 var(--app-line)" : "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          transform: wide || drawer ? "translateX(0)" : "translateX(-105%)",
          transition:
            "width .25s cubic-bezier(.4,0,.2,1), transform .25s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: col ? "0 20px" : "0 18px",
            flex: "none",
          }}
        >
          <Link
            href={isAdmin ? "/admin" : "/operations/dashboard"}
            aria-label="ABRIA console home"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--color-text)",
              minWidth: 0,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flex: "none",
                display: "grid",
                placeItems: "center",
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: "0.02em",
              }}
            >
              A
            </span>
            {showLabels && (
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "0.08em" }}>
                  ABRIA
                </span>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--app-muted)",
                  }}
                >
                  {areaLabel}
                </span>
              </span>
            )}
          </Link>
          {!wide && (
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawer(false)}
              style={{
                marginLeft: "auto",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: 0,
                background: "transparent",
                color: "var(--color-text)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <i className="ph ph-x" aria-hidden="true" style={{ fontSize: 20 }} />
            </button>
          )}
        </div>
        <nav
          aria-label="Sections"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "4px 12px 12px",
            scrollbarWidth: "thin",
          }}
        >
          {groups.map((g, gi) => {
            const hasActive = g.items.some((i) => i.k === activeKey);
            const collapsible = isAdmin && !!g.label;
            const gOpen =
              open[g.id] == null ? hasActive || !isAdmin || g.id === "ops" : open[g.id];
            return (
              <div key={g.id} style={{ marginTop: gi === 0 ? 0 : col ? 0 : 14 }}>
                {g.label && showLabels && (
                  <button
                    type="button"
                    onClick={() =>
                      collapsible &&
                      setOpen((s) => ({ ...s, [g.id]: !gOpen }))
                    }
                    aria-expanded={gOpen}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      height: 32,
                      padding: "0 12px",
                      border: 0,
                      background: "transparent",
                      cursor: collapsible ? "pointer" : "default",
                      font: "inherit",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--app-muted)",
                      borderRadius: 8,
                    }}
                  >
                    {g.label}
                    {collapsible && (
                      <i
                        className="ph ph-caret-down"
                        aria-hidden="true"
                        style={{
                          fontSize: 12,
                          transition: "transform .2s ease",
                          transform: `rotate(${gOpen ? "0deg" : "-90deg"})`,
                        }}
                      />
                    )}
                  </button>
                )}
                {col && g.label && (
                  <div
                    aria-hidden="true"
                    style={{ height: 1, margin: "8px 10px", background: "var(--app-line)" }}
                  />
                )}
                {(col || !collapsible || gOpen) &&
                  g.items.map((x) => {
                    const v = itemView(x);
                    return (
                      <Link
                        key={x.k}
                        href={x.href}
                        title={v.title}
                        aria-current={v.aria}
                        data-ripple="1"
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          height: 40,
                          padding: `0 ${v.px}`,
                          marginTop: 2,
                          borderRadius: 10,
                          textDecoration: "none",
                          fontSize: 14,
                          fontWeight: v.fw,
                          color: v.fg,
                          background: v.bg,
                          justifyContent: v.jc,
                        }}
                      >
                        <i
                          className={x.icon}
                          aria-hidden="true"
                          style={{ fontSize: 20, flex: "none", color: v.ic }}
                        />
                        {showLabels && (
                          <span
                            style={{
                              flex: 1,
                              minWidth: 0,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {x.label}
                          </span>
                        )}
                        {v.pill && (
                          <span
                            style={{
                              minWidth: 22,
                              height: 20,
                              padding: "0 6px",
                              borderRadius: 999,
                              display: "grid",
                              placeItems: "center",
                              fontSize: 11,
                              fontWeight: 600,
                              background: "var(--color-accent)",
                              color: "var(--color-bg)",
                            }}
                          >
                            {x.count}
                          </span>
                        )}
                        {v.dot && (
                          <span
                            aria-label={String(x.count)}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 14,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "var(--color-accent-2)",
                            }}
                          />
                        )}
                      </Link>
                    );
                  })}
              </div>
            );
          })}
        </nav>
        <div
          style={{
            flex: "none",
            padding: "8px 12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {bottom.map((x) => {
            const v = itemView({ ...x, k: x.k });
            const isSignout = x.k === "signout";
            return (
              <button
                key={x.k}
                type="button"
                onClick={() => {
                  if (isSignout) signOut();
                  else router.push(x.href);
                }}
                title={v.title}
                aria-current={v.aria}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  height: 40,
                  padding: `0 ${v.px}`,
                  borderRadius: 10,
                  border: 0,
                  background: v.bg,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 14,
                  color: v.fg,
                  justifyContent: v.jc,
                }}
              >
                <i className={x.icon} aria-hidden="true" style={{ fontSize: 20, flex: "none" }} />
                {showLabels && <span>{x.label}</span>}
              </button>
            );
          })}
          {wide && (
            <button
              type="button"
              onClick={toggleCollapse}
              aria-label={col ? "Expand sidebar" : "Collapse sidebar"}
              title={col ? "Expand sidebar" : "Collapse sidebar"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 40,
                padding: `0 ${col ? "0" : "12px"}`,
                borderRadius: 10,
                border: 0,
                background: "transparent",
                cursor: "pointer",
                font: "inherit",
                fontSize: 14,
                color: "var(--app-muted)",
                justifyContent: col ? "center" : "flex-start",
              }}
            >
              <i
                className={col ? "ph ph-sidebar-simple" : "ph ph-caret-double-left"}
                aria-hidden="true"
                style={{ fontSize: 20 }}
              />
              {showLabels && <span>Collapse</span>}
            </button>
          )}
        </div>
      </aside>

      <header
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: wide ? sideW : 0,
          height: 64,
          zIndex: 70,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 clamp(12px,2vw,24px)",
          background: "color-mix(in srgb,var(--app-page) 86%,transparent)",
          backdropFilter: "saturate(1.2) blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: scrolled ? "0 1px 0 var(--app-line), var(--shadow-sm)" : "none",
          transition: "left .25s cubic-bezier(.4,0,.2,1), box-shadow .2s ease",
        }}
      >
        {!wide && (
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: 0,
              background: "transparent",
              color: "var(--color-text)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              flex: "none",
            }}
          >
            <i className="ph ph-list" aria-hidden="true" style={{ fontSize: 24 }} />
          </button>
        )}
        <div ref={searchRef} role="search" style={{ position: "relative", flex: "1 1 auto", maxWidth: 520, minWidth: 0 }}>
          <i
            className="ph ph-magnifying-glass"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "var(--app-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder={wide ? "Search shipments, requests, customers…" : "Search…"}
            aria-label="Search"
            style={{
              width: "100%",
              height: 42,
              padding: "0 14px 0 42px",
              borderRadius: 999,
              border: "1px solid transparent",
              background: "var(--app-card)",
              color: "var(--color-text)",
              font: "inherit",
              fontSize: 14,
              boxShadow: "var(--shadow-sm)",
              outline: "none",
            }}
          />
          {searchOpen && q.trim().length >= 2 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                background: "var(--app-card)",
                borderRadius: 14,
                boxShadow: "var(--shadow-lg)",
                padding: 8,
                animation: "abria-in .16s ease",
              }}
            >
              <p style={{ margin: 0, padding: "12px", fontSize: 13, color: "var(--app-muted)" }}>
                Search runs against live records on each console page. Try a
                reference like ABR-2026-000001.
              </p>
            </div>
          )}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, flex: "none" }}>
          <button
            type="button"
            data-ripple="1"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={(e) => {
              setRot((r) => r + 180);
              toggleTheme(e);
            }}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: 0,
              background: "transparent",
              color: "var(--color-text)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <i
              className={mounted && theme === "dark" ? "ph-duotone ph-sun" : "ph-duotone ph-moon"}
              aria-hidden="true"
              style={{
                fontSize: 21,
                transition: "transform .6s cubic-bezier(.4,0,.2,1)",
                transform: `rotate(${rot}deg)`,
              }}
            />
          </button>
          <div ref={bellRef} style={{ position: "relative" }}>
            <button
              type="button"
              data-ripple="1"
              aria-label={`Notifications, ${unread} unread`}
              aria-expanded={bell}
              onClick={() => {
                setBell((b) => !b);
                setUser(false);
                setSearchOpen(false);
              }}
              style={{
                position: "relative",
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: 0,
                background: on(bell),
                color: "var(--color-text)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <i className="ph-duotone ph-bell" aria-hidden="true" style={{ fontSize: 22 }} />
              {unread > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    minWidth: 17,
                    height: 17,
                    padding: "0 4px",
                    borderRadius: 999,
                    background: "var(--color-accent-2)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 0 0 2px var(--app-page)",
                  }}
                >
                  {unread}
                </span>
              )}
            </button>
            {bell && (
              <div
                role="dialog"
                aria-label="Notifications"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: -8,
                  width: "min(380px,calc(100vw - 24px))",
                  background: "var(--app-card)",
                  borderRadius: 16,
                  boxShadow: "var(--shadow-lg)",
                  animation: "abria-in .16s ease",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px 8px",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15 }}>Notifications</span>
                  <Link
                    href={isAdmin ? "/admin/notifications" : "/operations/notifications"}
                    style={{ fontSize: 13, fontWeight: 500, color: "var(--color-accent-700)", textDecoration: "none" }}
                  >
                    View all
                  </Link>
                </div>
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {notifications.length === 0 && (
                    <p style={{ margin: 0, padding: "8px 16px 16px", fontSize: 13, color: "var(--app-muted)" }}>
                      No notifications yet.
                    </p>
                  )}
                  {notifications.slice(0, 6).map((n) => (
                    <Link
                      key={n.id}
                      href={n.href ?? "#"}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "var(--color-text)",
                        background: n.read
                          ? "transparent"
                          : "color-mix(in srgb,var(--color-accent) 5%,transparent)",
                      }}
                    >
                      <i
                        className={`ph-duotone ${n.icon}`}
                        aria-hidden="true"
                        style={{ fontSize: 20, color: "var(--color-accent)", flex: "none", marginTop: 1 }}
                      />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 13.5, fontWeight: n.read ? 400 : 600, lineHeight: 1.35 }}>
                          {n.title}
                        </span>
                        <span style={{ display: "block", marginTop: 2, fontSize: 12, color: "var(--app-muted)" }}>
                          {n.category} · {n.when}
                        </span>
                      </span>
                      {!n.read && (
                        <span
                          aria-label="Unread"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--color-accent)",
                            flex: "none",
                            marginTop: 6,
                          }}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div ref={userRef} style={{ position: "relative" }}>
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={user}
              onClick={() => {
                setUser((u) => !u);
                setBell(false);
                setSearchOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 44,
                padding: wide ? "0 12px 0 4px" : "0 4px",
                borderRadius: 999,
                border: 0,
                background: on(user),
                color: "var(--color-text)",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "var(--color-accent-2)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {meInit}
              </span>
              {wide && (
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.15 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{userName}</span>
                  <span style={{ fontSize: 11.5, color: "var(--app-muted)" }}>{userRole}</span>
                </span>
              )}
              {wide && (
                <i className="ph ph-caret-down" aria-hidden="true" style={{ fontSize: 12, color: "var(--app-muted)" }} />
              )}
            </button>
            {user && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 260,
                  background: "var(--app-card)",
                  borderRadius: 16,
                  boxShadow: "var(--shadow-lg)",
                  padding: 8,
                  animation: "abria-in .16s ease",
                }}
              >
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{userName}</div>
                  <div style={{ fontSize: 13, color: "var(--app-muted)" }}>
                    {userRole}
                    {userEmail ? ` · ${userEmail}` : ""}
                  </div>
                </div>
                <div style={{ height: 1, background: "var(--app-line)", margin: "0 4px 6px" }} />
                <button
                  type="button"
                  onClick={() => {
                    setUser(false);
                    router.push("/");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    height: 42,
                    padding: "0 12px",
                    borderRadius: 10,
                    border: 0,
                    background: "transparent",
                    textDecoration: "none",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: 14,
                  }}
                >
                  <i className="ph-duotone ph-globe-hemisphere-east" aria-hidden="true" style={{ fontSize: 19 }} />
                  Public website
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    height: 42,
                    padding: "0 12px",
                    borderRadius: 10,
                    border: 0,
                    background: "transparent",
                    color: "var(--color-accent-2-700)",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: 14,
                  }}
                >
                  <i className="ph-duotone ph-sign-out" aria-hidden="true" style={{ fontSize: 19 }} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main
        style={{
          padding: `88px clamp(16px,3vw,32px) 56px calc(${wide ? sideW : "0px"} + clamp(16px,3vw,32px))`,
          transition: "padding-left .25s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div style={{ maxWidth: "var(--console-max)", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
