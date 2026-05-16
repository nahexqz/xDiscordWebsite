import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";
  const level = searchParams.get("level");

  const where: any = {};
  if (status !== "all") where.status = status;
  if (level) where.level = Number(level);

  const verifications = await prisma.verificationSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { username: true, avatar: true, discordId: true },
      },
    },
  });

  return NextResponse.json({ verifications });
}
