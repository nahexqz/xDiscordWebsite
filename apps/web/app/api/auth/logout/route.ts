import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionToken, clearSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = getSessionToken(request);
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
