import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductPage({ params }: { params: { productId: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId, isActive: true },
    include: {
      category: { select: { name: true, slug: true, emoji: true } },
    },
  });

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
