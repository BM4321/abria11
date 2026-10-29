"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACTIVITY_COOKIE,
  ACTIVITY_COOKIE_MAX_AGE,
  IDLE_TIMEOUT_MS,
  SESSION_SEEN_INTERVAL_MS,
} from "@/lib/session";

const WARN_BEFORE_MS = 60 * 1000; // show the warning in the final minute
const COOKIE_WRITE_THROTTLE_MS = 10 * 1000;
const STORAGE_KEY = "abria-last-activity";

function writeCookie(ts: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACTIVITY_COOKIE}=${ts}; path=/; max-age=${ACTIVITY_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

// Watches for user inactivity inside the authenticated console and signs the
// user out after IDLE_TIMEOUT_MS. Activity is mirrored to a cookie (read by the
// middleware on the next request) and localStorage (shared across tabs).
export default function IdleLogout() {
  const lastRef = useRef<number>(Date.now());
  const lastCookieRef = useRef<number>(0);
  const loggingOutRef = useRef(false);
  const [remaining, setRemaining] = useState<number>(IDLE_TIMEOUT_MS);

  const markActive = useCallback(() => {
    const now = Date.now();
    lastRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {
      /* ignore */
    }
    if (now - lastCookieRef.current > COOKIE_WRITE_THROTTLE_MS) {
      lastCookieRef.current = now;
      writeCookie(now);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore network errors — still redirect */
    }
    window.location.href = "/login?timeout=1";
  }, []);

  // Seed from the shared activity timestamp (across tabs), then mark active so
  // the server guard knows the session is in use.
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(STORAGE_KEY));
      if (Number.isFinite(stored) && stored > 0 && stored <= Date.now()) {
        lastRef.current = stored;
      }
    } catch {
      /* ignore */
    }
    markActive();
    writeCookie(lastRef.current);
  }, [markActive]);

  // Track activity from user input and cross-tab updates.
  useEffect(() => {
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
      "focus",
    ];
    const onActivity = () => markActive();
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const onVisibility = () => {
      if (document.visibilityState === "visible") markActive();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const ts = Number(e.newValue);
        if (Number.isFinite(ts) && ts > lastRef.current) lastRef.current = ts;
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, [markActive]);

  // Heartbeat while the user is active: marks the session as in use (so a
  // sign-in elsewhere is warned) and leaves at once if another device took it.
  useEffect(() => {
    const check = async () => {
      if (loggingOutRef.current) return;
      if (Date.now() - lastRef.current > SESSION_SEEN_INTERVAL_MS) return;
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const body = (await res.json()) as { status?: string };
        if (body.status === "SESSION_REPLACED" || body.status === "SESSION_MISSING") {
          loggingOutRef.current = true;
          window.location.href =
            body.status === "SESSION_REPLACED" ? "/api/auth/logout?replaced=1" : "/api/auth/logout";
        }
      } catch {
        /* offline or server error: try again on the next beat */
      }
    };
    const timer = window.setInterval(check, SESSION_SEEN_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Poll the idle state; log out once the timeout passes, warn in the last minute.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const idle = Date.now() - lastRef.current;
      const left = IDLE_TIMEOUT_MS - idle;
      setRemaining(left > 0 ? left : 0);
      if (idle >= IDLE_TIMEOUT_MS) {
        void signOut();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [signOut]);

  const warning = remaining <= WARN_BEFORE_MS && remaining > 0;
  if (!warning) return null;

  const seconds = Math.ceil(remaining / 1000);

  return (
    <div
      role="alertdialog"
      aria-label="Session about to expire"
      aria-live="assertive"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "color-mix(in srgb,var(--color-neutral-900) 50%,transparent)",
        animation: "abria-fade .2s ease",
      }}
    >
      <div
        className="card elev-lg"
        style={{
          width: "min(420px,100%)",
          background: "var(--color-surface)",
          padding: "clamp(20px,4vw,28px)",
          gap: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <i
            className="ph-duotone ph-timer"
            aria-hidden="true"
            style={{ fontSize: 24, color: "var(--color-accent-2)" }}
          />
          <h2 style={{ margin: 0, fontSize: 20 }}>Still there?</h2>
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 14, color: "color-mix(in srgb,var(--color-text) 72%,transparent)" }}>
          You&apos;ll be signed out for inactivity in{" "}
          <strong>{seconds}s</strong>.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void signOut()}
            style={{ minHeight: 42 }}
          >
            Sign out now
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={markActive}
            style={{ minHeight: 42 }}
            autoFocus
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
