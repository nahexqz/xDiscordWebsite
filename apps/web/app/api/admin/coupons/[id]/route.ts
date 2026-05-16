import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireAdmin(request);
  if (error) return error;
  const body = await request.json();
  const coupon = await prisma.coupon.update({ where: { id }, data: body });
  return NextResponse.json({ coupon });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireAdmin(request);
  if (error) return error;
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
