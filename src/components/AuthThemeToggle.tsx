"use client";

import { useEffect, useState } from "react";

function getTheme(): "light" | "dark" {
  try {
    const t = localStorage.getItem("abria-theme");
    if (t === "light" || t === "dark") return t;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function AuthThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [rot, setRot] = useState(0);

  useEffect(() => {
    setTheme(getTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("abria-theme", next);
    } catch {
      /* ignore */
    }
    setRot((r) => r + 180);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch theme"
      aria-pressed={theme === "dark"}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "1px solid var(--color-divider)",
        background: "transparent",
        color: "var(--color-text)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        flex: "none",
      }}
    >
      <i
        className={
          mounted && theme === "dark" ? "ph-duotone ph-sun" : "ph-duotone ph-moon"
        }
        aria-hidden="true"
        style={{
          fontSize: 20,
          transition: "transform .6s cubic-bezier(.4,0,.2,1)",
          transform: `rotate(${rot}deg)`,
        }}
      />
    </button>
  );
}
