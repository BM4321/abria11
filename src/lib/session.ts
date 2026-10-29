// Session inactivity policy, shared by the client idle timer and the
// server-side middleware guard.
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Cookie the client keeps fresh on activity; middleware reads it to enforce
// the timeout on the next request even if a tab was suspended/throttled.
export const ACTIVITY_COOKIE = "abria-active";

export const ACTIVITY_COOKIE_MAX_AGE = 60 * 60 * 24; // 24h
