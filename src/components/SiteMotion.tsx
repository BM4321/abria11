"use client";

import { useEffect } from "react";

// Ported from UI/abria-data.js + UI/image-slot.js. Recreates the first-visit
// truck loader, scroll reveals, ink ripple and the pointer "press lean" — all
// via the Web Animations API so they survive React re-renders.

const TRUCK = `<svg viewBox="0 0 64 40" width="64" height="40" style="fill:none;stroke:var(--color-text)" stroke-width="2.2" stroke-linejoin="round"><g data-body><rect x="2" y="6" width="36" height="22" rx="3" style="fill:var(--color-accent-200)"/><path d="M38 13h12l9 9v6H38z" style="fill:var(--color-accent)" fill-opacity=".85"/><path d="M42 16h6l5 6h-11z" style="fill:var(--color-bg)"/></g><g data-w><circle cx="13" cy="31" r="5" style="fill:var(--color-bg)"/><path d="M13 27v8M9 31h8" stroke-width="1.6"/></g><g data-w><circle cx="49" cy="31" r="5" style="fill:var(--color-bg)"/><path d="M49 27v8M45 31h8" stroke-width="1.6"/></g></svg>`;

function motionOK() {
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function loader() {
  if (!motionOK()) return;
  const force = /[?&]loader\b/.test(location.search);
  try {
    if (!force && sessionStorage.getItem("abria-loaded")) return;
    sessionStorage.setItem("abria-loaded", "1");
  } catch {
    /* ignore */
  }
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText =
    "position:fixed;inset:0;z-index:1000;background:var(--color-bg);display:grid;place-items:center";
  el.innerHTML =
    `<div style="width:min(340px,72vw)"><div style="font:600 30px/1 Roboto,system-ui,sans-serif;letter-spacing:.08em;color:var(--color-text)">ABRIA</div>` +
    `<div style="font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:color-mix(in srgb,var(--color-text) 70%,transparent);margin:8px 0 36px">Connected Logistics</div>` +
    `<div data-lane style="position:relative;height:46px"><div data-truck style="position:absolute;left:0;bottom:4px">${TRUCK}</div>` +
    `<div data-road style="position:absolute;left:0;right:0;bottom:0;height:3px;border-radius:3px;background:repeating-linear-gradient(90deg,var(--color-text) 0 16px,transparent 16px 28px)"></div></div></div>`;
  document.body.appendChild(el);
  const lane = el.querySelector("[data-lane]") as HTMLElement;
  const truck = el.querySelector("[data-truck]") as HTMLElement;
  const dist = lane.getBoundingClientRect().width - 64;
  truck.animate(
    [{ transform: "translateX(-8px)" }, { transform: `translateX(${dist}px)` }],
    { duration: 1500, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" }
  );
  el.querySelector("[data-body]")?.animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(-1.2px)" },
      { transform: "translateY(0)" },
    ],
    { duration: 260, iterations: Infinity }
  );
  el.querySelectorAll("[data-w]").forEach((w) => {
    const el2 = w as HTMLElement;
    el2.style.transformBox = "fill-box";
    el2.style.transformOrigin = "center";
    el2.animate(
      [{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }],
      { duration: 420, iterations: Infinity }
    );
  });
  el.querySelector("[data-road]")?.animate(
    [{ backgroundPosition: "0 0" }, { backgroundPosition: "-56px 0" }],
    { duration: 500, iterations: Infinity }
  );
  setTimeout(() => {
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 320,
      easing: "ease",
      fill: "forwards",
    }).onfinish = () => el.remove();
  }, 1650);
}

function reveal() {
  if (!motionOK() || !("IntersectionObserver" in window)) return;
  const seen = new WeakSet<Element>();
  const ease = "cubic-bezier(.2,.7,.2,1)";
  function run(t: Element) {
    if (t.hasAttribute("data-drive")) {
      (t as HTMLElement).animate(
        [{ left: "0px" }, { left: "calc(100% - 40px)" }],
        {
          duration: 2600,
          easing: "cubic-bezier(.5,0,.2,1)",
          fill: "forwards",
        }
      );
      (t as HTMLElement).animate(
        [
          { transform: "translateY(0)" },
          { transform: "translateY(-1px)" },
          { transform: "translateY(0)" },
        ],
        { duration: 240, iterations: 10 }
      );
      return true;
    }
    const kids = t.hasAttribute("data-stagger")
      ? Array.prototype.slice.call(t.children)
      : [t];
    if (!kids.length) return false;
    kids.forEach((k: Element, i: number) => {
      (k as HTMLElement).animate(
        [
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 640,
          delay: Math.min(i, 8) * 90,
          easing: ease,
          fill: "backwards",
        }
      );
    });
    return true;
  }
  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting && run(e.target)) io.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  function scan() {
    document
      .querySelectorAll("[data-reveal],[data-stagger],[data-drive]")
      .forEach((t) => {
        if (seen.has(t)) return;
        seen.add(t);
        io.observe(t);
      });
  }
  scan();
  new MutationObserver(scan).observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function ripple() {
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!motionOK() || (e as PointerEvent).button !== 0) return;
      const target = (e.target as HTMLElement)?.closest?.(
        ".btn, [data-ripple]"
      ) as HTMLElement | null;
      if (!target || (target as HTMLButtonElement).disabled) return;
      const r = target.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2.2;
      if (getComputedStyle(target).position === "static")
        target.style.position = "relative";
      target.style.overflow = "hidden";
      const s = document.createElement("span");
      const dark =
        /btn-primary/.test(target.className) ||
        target.hasAttribute("data-ripple-light");
      s.style.cssText = `position:absolute;pointer-events:none;border-radius:50%;width:${d}px;height:${d}px;left:${(e as PointerEvent).clientX - r.left - d / 2}px;top:${(e as PointerEvent).clientY - r.top - d / 2}px;background:${dark ? "rgba(255,255,255,.35)" : "rgba(0,136,176,.18)"}`;
      target.appendChild(s);
      const a = s.animate(
        [
          { transform: "scale(0)", opacity: 1 },
          { transform: "scale(1)", opacity: 0 },
        ],
        { duration: 560, easing: "cubic-bezier(.2,.6,.3,1)" }
      );
      a.onfinish = () => s.remove();
    },
    { passive: true }
  );
}

function pressLean() {
  if (!motionOK()) return;
  const root = document.documentElement;
  let frame = 0;
  let nx = 0;
  let ny = 0;
  const apply = () => {
    frame = 0;
    root.style.setProperty("--press-nx", nx.toFixed(3));
    root.style.setProperty("--press-ny", ny.toFixed(3));
  };
  window.addEventListener(
    "pointermove",
    (e) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    },
    { passive: true }
  );
}

export default function SiteMotion() {
  useEffect(() => {
    if (motionOK()) {
      document.documentElement.style.scrollBehavior = "smooth";
      document.documentElement.style.scrollPaddingTop = "88px";
    }
    loader();
    reveal();
    ripple();
    pressLean();
  }, []);

  return null;
}
