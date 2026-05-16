// ─── Admin Tickets GET + PATCH status ────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/tickets
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, discordId: true, avatar: true } },
      replies: { orderBy: { createdAt: "asc" }, include: { user: { select: { username: true } } } },
    },
  });

  return NextResponse.json({ tickets });
}
