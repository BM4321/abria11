"use client";

import { useEffect } from "react";

// Ported from UI/_ds/.../_ds_bundle.js (print-plates.js). The separation
// filter defs must live in the document for .cmyk to resolve, and the press
// driver eases the plates into register on hover while publishing the pointer
// lean as --press-nx/--press-ny for the text-plate treatments.

export default function PrintPlates() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const svg = document.getElementById("broadsheet-print-plates");
    if (!svg) return;

    const BASE: Record<string, [number, number]> = {
      m: [5, 3],
      y: [-5, -3],
      k: [3, 6],
    };
    const LEAN_PX: [number, number] = [2.5, 2];
    const REGISTER_MS = 450;
    const nodes: Record<string, SVGFEOffsetElement | null> = {};
    svg.querySelectorAll<SVGFEOffsetElement>("feOffset[data-plate]").forEach((n) => {
      nodes[n.dataset.plate as string] = n;
    });
    const mats: Record<string, SVGFEColorMatrixElement | null> = {};
    svg
      .querySelectorAll<SVGFEColorMatrixElement>("feColorMatrix[data-plate-mat]")
      .forEach((n) => {
        mats[n.dataset.plateMat as string] = n;
      });
    const INK: Record<string, number[]> = {
      c: [1, 0, 0, 0, 0, 0.467, 0, 0, 0, 0.533, 0.31, 0, 0, 0, 0.69, 0, 0, 0, 0, 1],
      m: [0, 0.161, 0, 0, 0.839, 0, 1, 0, 0, 0, 0, 0.576, 0, 0, 0.424, 0, 0, 0, 0, 1],
      y: [0, 0, 0.071, 0, 0.929, 0, 0, 0.267, 0, 0.733, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      k: [0.112, 0.375, 0.038, 0, 0.475, 0.113, 0.379, 0.038, 0, 0.471, 0.113, 0.38, 0.038, 0, 0.468, 0, 0, 0, 0, 1],
    };
    const TRUE_: Record<string, number[]> = {
      c: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      m: [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      y: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      k: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    };
    const root = document.documentElement;
    let nx = 0,
      ny = 0,
      tx = 0,
      ty = 0,
      reg = 1,
      regFrom = 1,
      regTo = 1,
      regT0 = 0,
      raf = 0;
    let lastOffs = "",
      lastReg = -1,
      lastProps = "";
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      raf = 0;
      nx += (tx - nx) * 0.22;
      ny += (ty - ny) * 0.22;
      if (regTo !== reg || regT0) {
        const t = Math.min(1, (now - regT0) / REGISTER_MS);
        reg = regFrom + (regTo - regFrom) * ease(t);
        if (t >= 1) {
          reg = regTo;
          regT0 = 0;
        }
      }
      const lx = LEAN_PX[0] * nx,
        ly = LEAN_PX[1] * ny;
      const vals: Record<string, [string, string]> = {};
      let offsKey = "";
      for (const p in BASE) {
        const dx = ((BASE[p][0] + lx) * reg).toFixed(2);
        const dy = ((BASE[p][1] + ly) * reg).toFixed(2);
        vals[p] = [dx, dy];
        offsKey += dx + "," + dy + ";";
      }
      if (offsKey !== lastOffs) {
        lastOffs = offsKey;
        for (const p in BASE) {
          nodes[p]?.setAttribute("dx", vals[p][0]);
          nodes[p]?.setAttribute("dy", vals[p][1]);
        }
      }
      if (reg !== lastReg) {
        lastReg = reg;
        for (const p in mats) {
          const a = INK[p],
            b = TRUE_[p];
          const v = new Array(20);
          for (let i = 0; i < 20; i++)
            v[i] = (b[i] + (a[i] - b[i]) * reg).toFixed(3);
          mats[p]?.setAttribute("values", v.join(" "));
        }
      }
      const pk = nx.toFixed(3) + "," + ny.toFixed(3);
      if (pk !== lastProps) {
        lastProps = pk;
        root.style.setProperty("--press-nx", nx.toFixed(3));
        root.style.setProperty("--press-ny", ny.toFixed(3));
      }
      if (regT0 || Math.abs(tx - nx) > 0.002 || Math.abs(ty - ny) > 0.002) schedule();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      tx = (2 * e.clientX) / innerWidth - 1;
      ty = (2 * e.clientY) / innerHeight - 1;
      schedule();
    };
    const retarget = (to: number) => {
      regFrom = reg;
      regTo = to;
      regT0 = performance.now();
      schedule();
    };
    const onOver = (e: Event) => {
      const p = (e.target as HTMLElement)?.closest?.(".cmyk .print");
      if (p && !(e as PointerEvent).relatedTarget) retarget(0);
      else if (p) retarget(0);
    };
    const onOut = (e: Event) => {
      const p = (e.target as HTMLElement)?.closest?.(".cmyk .print");
      if (p) retarget(1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      id="broadsheet-print-plates"
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="sep-c" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0.467 0 0 0 0.533  0.310 0 0 0 0.690  0 0 0 0 1"
          />
        </filter>
        <filter id="sep-m" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0.161 0 0 0.839  0 1 0 0 0  0 0.576 0 0 0.424  0 0 0 0 1"
          />
        </filter>
        <filter id="sep-y" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0.071 0 0.929  0 0 0.267 0 0.733  0 0 1 0 0  0 0 0 0 1"
          />
        </filter>
        <filter id="sep-k" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.112 0.375 0.038 0 0.475  0.113 0.379 0.038 0 0.471  0.113 0.380 0.038 0 0.468  0 0 0 0 1"
          />
        </filter>
        <filter id="sep-all" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0.467 0 0 0 0.533  0.310 0 0 0 0.690  0 0 0 0 1"
            data-plate-mat="c"
            result="c0"
          />
          <feComposite in="c0" in2="SourceAlpha" operator="in" result="c" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0.161 0 0 0.839  0 1 0 0 0  0 0.576 0 0 0.424  0 0 0 0 1"
            data-plate-mat="m"
            result="m0"
          />
          <feComposite in="m0" in2="SourceAlpha" operator="in" result="m1" />
          <feOffset in="m1" dx="5" dy="3" data-plate="m" result="m" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0.071 0 0.929  0 0 0.267 0 0.733  0 0 1 0 0  0 0 0 0 1"
            data-plate-mat="y"
            result="y0"
          />
          <feComposite in="y0" in2="SourceAlpha" operator="in" result="y1" />
          <feOffset in="y1" dx="-5" dy="-3" data-plate="y" result="y" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.112 0.375 0.038 0 0.475  0.113 0.379 0.038 0 0.471  0.113 0.380 0.038 0 0.468  0 0 0 0 1"
            data-plate-mat="k"
            result="k0"
          />
          <feComposite in="k0" in2="SourceAlpha" operator="in" result="k1" />
          <feOffset in="k1" dx="3" dy="6" data-plate="k" result="k" />
          <feBlend in="m" in2="c" mode="multiply" result="s1" />
          <feBlend in="y" in2="s1" mode="multiply" result="s2" />
          <feBlend in="k" in2="s2" mode="multiply" />
        </filter>
      </defs>
    </svg>
  );
}
