/**
 * Minimal signed-cookie session, server-only.
 *
 * No database or session store -- Vercel's serverless functions don't have
 * one to write to anyway. The cookie itself carries the (signed) identity,
 * so any instance can verify it statelessly. Good enough for a handful of
 * trusted test users; not meant to be a hardened auth system.
 */

import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "arlo_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days, matching the demo's own expiry window
const SECRET = process.env.ARLO_SESSION_SECRET || "arlo-demo-dev-secret-not-for-real-use";

export interface SessionPayload {
  email: string;
  name: string;
}

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSessionToken(payload: SessionPayload): string {
  const body = JSON.stringify({ ...payload, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });
  const encoded = Buffer.from(body, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
