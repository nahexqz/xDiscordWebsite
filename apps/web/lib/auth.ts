import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me");
const COOKIE_NAME = "lc_session";

// ── Sign JWT ──────────────────────────────────────────────────────────────────
export async function signJWT(payload: Record<string, string>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

// ── Verify JWT ────────────────────────────────────────────────────────────────
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; discordId: string };
  } catch {
    return null;
  }
}

// ── Get session token from cookie ─────────────────────────────────────────────
export function getSessionToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

// ── Set session cookie ────────────────────────────────────────────────────────
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// ── Clear session cookie ──────────────────────────────────────────────────────
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}

// ── Get current user from request ─────────────────────────────────────────────
export async function getSessionUser(request: NextRequest) {
  const token = getSessionToken(request);
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload) return null;

  // Validate session exists in DB
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: { wallet: true },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const { user } = session;
  if (user.isBanned) return null;

  return {
    id: user.id,
    discordId: user.discordId,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    isAdmin: user.isAdmin,
    wallet: user.wallet ? { balance: user.wallet.balance } : undefined,
  };
}

// ── Require auth middleware helper ─────────────────────────────────────────────
export async function requireAuth(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

// ── Require admin middleware helper ────────────────────────────────────────────
export async function requireAdmin(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return { user: null, error };
  if (!user!.isAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user, error: null };
}
