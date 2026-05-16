import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, getSessionToken } from "@/lib/auth";

const PROTECTED_ROUTES = ["/profile", "/tickets", "/verification", "/verification-2", "/verification-3"];
const ADMIN_ROUTES = ["/dashboard/admin"];
const AUTH_ROUTES = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = getSessionToken(request);
  let isAuthenticated = false;
  let isAdmin = false;

  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      isAuthenticated = true;
      // Check admin status from token (simplified - full check is in API routes)
      const adminIds = (process.env.ADMIN_DISCORD_IDS || "").split(",");
      isAdmin = adminIds.includes(payload.discordId);
    }
  }

  // Redirect authenticated users away from login
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated from protected routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect non-admins from admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && !isAdmin) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|images/).*)",
  ],
};
