import { NextResponse } from "next/server";

// Small request-validation helpers shared by the API routes, so malformed or
// hostile input becomes a 400 with a readable message instead of a Prisma
// exception (500) or an oversized row.

export class ValidationError extends Error {}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Parses a JSON object body. Returns null when the body is not a JSON object.
export async function readJsonObject(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await req.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

type StrOpts = { required?: boolean; max?: number; label?: string };

// Trimmed string field; empty becomes null. Throws ValidationError on a wrong
// type, a missing required value or a value longer than `max`.
export function str(body: Record<string, unknown>, key: string, opts: StrOpts = {}): string | null {
  const { required = false, max = 500, label = key } = opts;
  const raw = body[key];
  if (raw === undefined || raw === null || raw === "") {
    if (required) throw new ValidationError(`${label} is required.`);
    return null;
  }
  if (typeof raw !== "string" && typeof raw !== "number") {
    throw new ValidationError(`${label} must be text.`);
  }
  const value = String(raw).trim();
  if (!value) {
    if (required) throw new ValidationError(`${label} is required.`);
    return null;
  }
  if (value.length > max) throw new ValidationError(`${label} must be at most ${max} characters.`);
  return value;
}

type NumOpts = { int?: boolean; min?: number; max?: number; label?: string };

// Optional numeric field (number or numeric string); empty becomes null.
export function num(body: Record<string, unknown>, key: string, opts: NumOpts = {}): number | null {
  const { int = false, min = 0, max = 1e12, label = key } = opts;
  const raw = body[key];
  if (raw === undefined || raw === null || raw === "") return null;
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.trim()) : NaN;
  if (!Number.isFinite(value)) throw new ValidationError(`${label} must be a number.`);
  if (int && !Number.isInteger(value)) throw new ValidationError(`${label} must be a whole number.`);
  if (value < min || value > max) throw new ValidationError(`${label} must be between ${min} and ${max}.`);
  return value;
}

// Optional date field (ISO string); empty becomes null.
export function date(body: Record<string, unknown>, key: string, label = key): Date | null {
  const raw = body[key];
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw !== "string") throw new ValidationError(`${label} must be a date.`);
  const value = new Date(raw);
  if (Number.isNaN(value.getTime())) throw new ValidationError(`${label} must be a valid date.`);
  return value;
}

export function email(body: Record<string, unknown>, key: string, label = key): string | null {
  const value = str(body, key, { max: 254, label });
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new ValidationError(`${label} must be a valid email address.`);
  }
  return value ? value.toLowerCase() : null;
}

export function phone(body: Record<string, unknown>, key: string, label = key): string | null {
  const value = str(body, key, { required: true, max: 32, label });
  if (value && !/^\+?[0-9 ()-]{7,}$/.test(value)) {
    throw new ValidationError(`${label} must be a valid phone number.`);
  }
  return value;
}

// Best-effort, per-instance throttle for public form endpoints. On serverless
// hosts each instance has its own memory, so this blunts bursts from one client
// rather than enforcing a global limit; edge/WAF rate limiting is the real fix.
const hits = new Map<string, number[]>();

export function tooManyRequests(req: Request, bucket: string, limit = 5, windowMs = 10 * 60_000): boolean {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return recent.length > limit;
}
