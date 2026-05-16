import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: body,
    });

    await prisma.adminLog.create({
      data: {
        performerId: user!.id,
        action: "PRODUCT_UPDATE",
        description: `Updated product: ${product.name}`,
        metadata: body,
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const product = await prisma.product.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        performerId: user!.id,
        action: "PRODUCT_DELETE",
        description: `Deleted product: ${product.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
