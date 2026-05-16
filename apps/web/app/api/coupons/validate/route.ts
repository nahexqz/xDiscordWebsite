import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim(), isActive: true },
    });

    if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
      return NextResponse.json({ error: "Coupon has reached its usage limit" }, { status: 400 });

    return NextResponse.json({
      valid: true,
      discount: coupon.discountValue,
      type: coupon.discountType,
      description: coupon.description,
    });
  } catch {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
