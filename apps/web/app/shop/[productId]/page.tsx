export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    include: {
      category: { select: { name: true, slug: true, emoji: true } },
    },
  });

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}