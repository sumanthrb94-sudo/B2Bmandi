import { NextResponse } from "next/server";

/**
 * Small shared helpers for route handlers. These never change existing
 * success response shapes — callers pass the exact payload they want returned.
 */

/** JSON success response. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** JSON error response with the standard `{ error }` shape. */
export function fail(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Safely parse a JSON request body. Returns `null` instead of throwing when the
 * body is missing or malformed, so callers can respond with a 400.
 */
export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Best-effort client IP extraction from common proxy headers. Falls back to a
 * sentinel so rate-limit keys are still stable when no header is present.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
