import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "featured";

  try {
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { roleName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    let orderBy: any = { sortOrder: "asc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "bestselling") orderBy = { soldCount: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };
    else if (sort === "featured") orderBy = [{ isFeatured: "desc" }, { sortOrder: "asc" }];

    const [products, topSelling] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: { select: { name: true, slug: true, emoji: true } },
        },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { soldCount: "desc" },
        take: 10,
        select: { id: true, name: true, price: true, soldCount: true },
      }),
    ]);

    return NextResponse.json({ products, topSelling });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
