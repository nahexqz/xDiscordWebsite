import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Product Categories ───────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { slug: "vip-roles" },
      update: {},
      create: { name: "VIP Roles", slug: "vip-roles", emoji: "👑", sortOrder: 1 },
    }),
    prisma.productCategory.upsert({
      where: { slug: "special-roles" },
      update: {},
      create: { name: "Special Roles", slug: "special-roles", emoji: "⭐", sortOrder: 2 },
    }),
    prisma.productCategory.upsert({
      where: { slug: "event-roles" },
      update: {},
      create: { name: "Event Roles", slug: "event-roles", emoji: "🎉", sortOrder: 3 },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ── Sample Products ──────────────────────────────────────────────────────
  const products = [
    {
      name: "VIP Member",
      slug: "vip-member",
      description: "Get exclusive VIP access with special perks, priority support, and VIP-only channels.",
      price: 9900,
      originalPrice: 14900,
      roleId: process.env.DISCORD_ROLE_VIP || "000000000000000001",
      roleName: "VIP Member",
      categoryId: categories[0].id,
      benefits: ["Access to VIP-only channels", "Priority support", "Custom color role", "Exclusive emojis"],
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "Legendary Member",
      slug: "legendary-member",
      description: "The ultimate membership. Legendary status with all premium features included.",
      price: 24900,
      originalPrice: 39900,
      roleId: process.env.DISCORD_ROLE_LEGENDARY || "000000000000000002",
      roleName: "Legendary",
      categoryId: categories[0].id,
      benefits: [
        "All VIP benefits",
        "Legendary badge",
        "Custom username color",
        "Monthly Nitro giveaway entry",
        "Direct admin access",
      ],
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: "Supporter Badge",
      slug: "supporter-badge",
      description: "Show your support for the community with a special supporter badge role.",
      price: 4900,
      roleId: process.env.DISCORD_ROLE_SUPPORTER || "000000000000000003",
      roleName: "Supporter",
      categoryId: categories[1].id,
      benefits: ["Supporter badge", "Thank you shoutout", "Special channel access"],
      sortOrder: 3,
    },
    {
      name: "Event Champion",
      slug: "event-champion",
      description: "For the winners and top participants of community events.",
      price: 7900,
      roleId: process.env.DISCORD_ROLE_CHAMPION || "000000000000000004",
      roleName: "Event Champion",
      categoryId: categories[2].id,
      benefits: ["Champion badge", "Trophy emoji", "Priority event slots"],
      duration: 30,
      stock: 50,
      sortOrder: 4,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`✅ Created ${products.length} products`);

  // ── Bot Settings ─────────────────────────────────────────────────────────
  const botSettings = [
    { key: "welcome_message", value: "👋 Welcome to **Legendary Community**, {username}!\n\n🎮 We're glad to have you here!" },
    { key: "purchase_success_message", value: "🎉 **Purchase Successful!**\n\nThank you {username}! Your **{role}** role has been granted.\n💰 Amount: ฿{amount} THB\n\nEnjoy your new role! 🎮" },
    { key: "purchase_failed_message", value: "❌ **Payment Failed**\n\nHi {username}, your payment for **{role}** could not be processed.\n\nPlease try again or contact support." },
    { key: "verification_approved_message", value: "✅ **Verification Approved!**\n\nCongratulations {username}! Your Level {level} verification has been approved. 🎉" },
    { key: "verification_rejected_message", value: "❌ **Verification Rejected**\n\nHi {username}, your Level {level} verification was rejected.\n\n📝 Reason: {reason}" },
    { key: "ticket_created_message", value: "🎫 **Ticket Created!**\n\nHi {username}, your ticket **#{ticket_id}** has been received. Our team will respond soon!" },
    { key: "ticket_updated_message", value: "📋 **Ticket Update**\n\nYour ticket **#{ticket_id}** status: **{status}**" },
  ];

  for (const setting of botSettings) {
    await prisma.botSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`✅ Created ${botSettings.length} bot settings`);

  // ── Sample Coupon ────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      description: "Welcome discount - 20% off your first purchase",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxUses: 100,
      isActive: true,
    },
  });

  console.log("✅ Created sample coupon: WELCOME20");

  // ── Sample Announcement ──────────────────────────────────────────────────
  await prisma.announcement.create({
    data: {
      title: "🎉 Welcome to Legendary Community!",
      message: "Use code WELCOME20 for 20% off your first role purchase. Join our Discord to get started!",
      type: "success",
      isActive: true,
    },
  }).catch(() => {}); // Ignore if already exists

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
