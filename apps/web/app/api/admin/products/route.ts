import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().min(0),
  originalPrice: z.number().int().min(0).optional(),
  roleId: z.string().min(1),
  roleName: z.string().min(1),
  categoryId: z.string().optional(),
  stock: z.number().int().min(0).nullable().optional(),
  duration: z.number().int().min(1).nullable().optional(),
  benefits: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now();

    const product = await prisma.product.create({
      data: { ...data, slug },
    });

    await prisma.adminLog.create({
      data: {
        performerId: user!.id,
        action: "PRODUCT_CREATE",
        description: `Created product: ${product.name}`,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data", details: err.errors }, { status: 400 });
    }
    console.error("Product create error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
