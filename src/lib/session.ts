// Session inactivity policy, shared by the client idle timer and the
// server-side middleware guard.
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Cookie the client keeps fresh on activity; middleware reads it to enforce
// the timeout on the next request even if a tab was suspended/throttled.
export const ACTIVITY_COOKIE = "abria-active";

export const ACTIVITY_COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

// One console session per account. Signing in stores a random id on the
// OpsUser row and in this cookie; a request whose cookie doesn't match the row
// belongs to a session that was replaced by a sign-in on another device.
export const SESSION_COOKIE = "abria-sid";

// How often a live session refreshes OpsUser.sessionSeenAt (page loads and the
// console heartbeat), so another device can tell whether it is still in use.
export const SESSION_SEEN_INTERVAL_MS = 60 * 1000;

// A session counts as in use on another device if it was seen within the idle
// timeout: anything quieter has been (or is about to be) signed out anyway.
export function activeSessionElsewhere(
  row: { sessionId: string | null; sessionSeenAt: Date | null },
  cookieSessionId: string | null | undefined,
  now: number = Date.now()
): boolean {
  if (!row.sessionId || !row.sessionSeenAt) return false;
  if (cookieSessionId && cookieSessionId === row.sessionId) return false;
  return now - row.sessionSeenAt.getTime() < IDLE_TIMEOUT_MS;
}
