import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "mrrms_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export type AppSession = {
  userId: number;
  name: string;
  username: string;
  role: "USER" | "ADMIN";
  division: string;
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || "mrrms-dev-secret-change-me";
}

function sign(data: string) {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(session: Omit<AppSession, "exp">) {
  const payload: AppSession = {
    ...session,
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function readSessionFromToken(token?: string | null): AppSession | null {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString()) as AppSession;
    if (session.exp < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return readSessionFromToken(token);
}

export const authCookieName = SESSION_COOKIE;
export const authCookieMaxAgeSeconds = SESSION_TTL_MS / 1000;
