import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  productId: z.string().cuid(),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { productId, couponCode } = schema.parse(body);

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check stock
    if (product.stock !== null && product.stock <= 0) {
      return NextResponse.json({ error: "Product is out of stock" }, { status: 400 });
    }

    // Check for existing pending order
    const existingOrder = await prisma.order.findFirst({
      where: { userId: user!.id, productId, status: "PENDING" },
    });
    if (existingOrder) {
      return NextResponse.json({ error: "You already have a pending order for this product" }, { status: 400 });
    }

    let finalAmount = product.price;
    let couponId: string | undefined;
    let discountAmount = 0;

    // Apply coupon
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), isActive: true },
      });

      if (coupon) {
        const isExpired = coupon.expiresAt && coupon.expiresAt < new Date();
        const isExhausted = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
        const meetsMinimum = product.price >= coupon.minOrderAmount;
        const appliesToProduct = coupon.productIds.length === 0 || coupon.productIds.includes(productId);

        if (!isExpired && !isExhausted && meetsMinimum && appliesToProduct) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = Math.floor(product.price * (coupon.discountValue / 100));
          } else {
            discountAmount = coupon.discountValue;
          }
          finalAmount = Math.max(0, product.price - discountAmount);
          couponId = coupon.id;
        }
      }
    }

    // Create pending order
    const order = await prisma.order.create({
      data: {
        userId: user!.id,
        productId,
        amount: finalAmount,
        currency: "thb",
        status: "PENDING",
        couponId,
        discountAmount,
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "promptpay"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: product.name,
              description: product.description.slice(0, 200),
              metadata: { productId, roleId: product.roleId },
            },
            unit_amount: finalAmount, // already in satang
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel?orderId=${order.id}`,
      metadata: {
        orderId: order.id,
        userId: user!.id,
        productId,
        discordId: user!.discordId,
        roleId: product.roleId,
        roleName: product.roleName,
      },
      customer_email: user!.email || undefined,
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
