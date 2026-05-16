import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  try {
    const body = await request.json();
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        description: body.description,
        discountType: body.discountType,
        discountValue: Number(body.discountValue),
        minOrderAmount: body.minOrderAmount ? Number(body.minOrderAmount) : 0,
        maxUses: body.maxUses ? Number(body.maxUses) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive ?? true,
      },
    });
    await prisma.adminLog.create({
      data: {
        performerId: user!.id,
        action: "COUPON_CREATE",
        description: `Created coupon: ${coupon.code}`,
      },
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
