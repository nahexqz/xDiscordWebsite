import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { grantDiscordRole, sendDiscordDM, getBotSettings } from "@/lib/discord-bot";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as unknown as Record<string, unknown>;
        await handlePaymentSuccess(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as unknown as Record<string, unknown>;
        await handlePaymentExpired(session);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as unknown as Record<string, unknown>;
        await handlePaymentFailed(paymentIntent);
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(session: Record<string, unknown>) {
  const metadata = (session.metadata || {}) as Record<string, string>;
  const { orderId, userId, productId, discordId, roleId, roleName } = metadata;
  if (!orderId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, product: true },
  });

  if (!order || order.status !== "PENDING") return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
      stripePaymentIntent: session.payment_intent as string,
      roleGranted: false,
    },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      soldCount: { increment: 1 },
      ...(order.product.stock !== null ? { stock: { decrement: 1 } } : {}),
    },
  });

  if (order.couponId) {
    await prisma.coupon.update({
      where: { id: order.couponId },
      data: { usedCount: { increment: 1 } },
    });
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (wallet) {
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: -order.amount,
        type: "PURCHASE",
        description: `Purchased: ${order.product.name}`,
        orderId,
      },
    });
  }

  try {
    const grantSuccess = await grantDiscordRole(
      process.env.DISCORD_GUILD_ID!,
      discordId,
      roleId
    );

    if (grantSuccess) {
      await prisma.order.update({
        where: { id: orderId },
        data: { roleGranted: true, roleGrantedAt: new Date() },
      });
    }
  } catch (roleErr) {
    console.error("Failed to grant Discord role:", roleErr);
  }

  try {
    const settings = await getBotSettings();
    const template = settings.purchase_success_message ||
      "🎉 **Purchase Successful!**\n\nThank you {username}! Your purchase of **{role}** has been processed.\n\n💰 Amount: ฿{amount} THB\n\nEnjoy your new role! 🎮";

    const message = template
      .replace("{username}", order.user.username)
      .replace("{role}", roleName || order.product.roleName)
      .replace("{amount}", (order.amount / 100).toFixed(0))
      .replace("{order_id}", orderId);

    await sendDiscordDM(discordId, message);
    await prisma.order.update({ where: { id: orderId }, data: { dmSent: true } });
  } catch (dmErr) {
    console.error("Failed to send success DM:", dmErr);
  }

  try {
    await sendDiscordChannelMessage(
      process.env.DISCORD_LOG_CHANNEL_ID!,
      `✅ **New Purchase**\n👤 User: <@${discordId}>\n🎭 Role: ${roleName}\n💰 Amount: ฿${(order.amount / 100).toFixed(0)} THB\n📋 Order: \`${orderId}\``
    );
  } catch {}

  console.log(`Payment success processed for order ${orderId}`);
}

async function handlePaymentExpired(session: Record<string, unknown>) {
  const metadata = (session.metadata || {}) as Record<string, string>;
  const { orderId } = metadata;
  if (!orderId) return;

  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}

async function handlePaymentFailed(paymentIntent: Record<string, unknown>) {
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntent: paymentIntent.id as string },
    include: { user: true, product: true },
  });

  if (!order) return;

  const lastError = (paymentIntent.last_payment_error || {}) as Record<string, string>;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "FAILED",
      failureReason: lastError.message || "Payment failed",
    },
  });

  try {
    const settings = await getBotSettings();
    const template = settings.purchase_failed_message ||
      "❌ **Payment Failed**\n\nHi {username}, your payment for **{role}** could not be processed.\n\nReason: {reason}\n\nPlease try again or contact support.";

    const message = template
      .replace("{username}", order.user.username)
      .replace("{role}", order.product.roleName)
      .replace("{reason}", lastError.message || "Unknown error");

    await sendDiscordDM(order.user.discordId, message);
  } catch (err) {
    console.error("Failed to send failure DM:", err);
  }
}

async function sendDiscordChannelMessage(channelId: string, message: string) {
  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  });
}