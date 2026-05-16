import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  const [fullUser, orders, verification] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user!.id },
      include: { wallet: true },
    }),
    prisma.order.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        product: { select: { name: true, roleName: true } },
      },
    }),
    prisma.verificationSubmission.findFirst({
      where: { userId: user!.id, status: "APPROVED" },
      orderBy: { level: "desc" },
      select: { level: true, status: true },
    }),
  ]);

  return NextResponse.json({ user: fullUser, orders, verification });
}
