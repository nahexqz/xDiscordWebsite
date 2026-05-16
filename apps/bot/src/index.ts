import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
  EmbedBuilder,
} from "discord.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

// ── Ready ────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Legendary Community Bot ready as ${c.user.tag}`);
  c.user.setPresence({
    status: "online",
    activities: [{ name: "Legendary Community", type: 3 }],
  });
});

// ── Interaction Create (buttons, modals) ──────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    }
  } catch (err) {
    console.error("Interaction error:", err);
    if (interaction.isRepliable() && !interaction.replied) {
      await interaction.reply({ content: "❌ An error occurred.", ephemeral: true });
    }
  }
});

// ── Handle Button Interactions ────────────────────────────────────────────────
async function handleButton(interaction: ButtonInteraction) {
  const { customId } = interaction;

  // Verification approve
  if (customId.startsWith("verify_approve_")) {
    const verificationId = customId.replace("verify_approve_", "");
    await handleVerificationApprove(interaction, verificationId);
    return;
  }

  // Verification reject
  if (customId.startsWith("verify_reject_")) {
    const verificationId = customId.replace("verify_reject_", "");
    await showRejectModal(interaction, verificationId);
    return;
  }
}

// ── Handle Modal Submissions ───────────────────────────────────────────────────
async function handleModalSubmit(interaction: ModalSubmitInteraction) {
  const { customId } = interaction;

  if (customId.startsWith("reject_modal_")) {
    const verificationId = customId.replace("reject_modal_", "");
    const reason = interaction.fields.getTextInputValue("reject_reason");
    await handleVerificationReject(interaction, verificationId, reason);
    return;
  }
}

// ── Verification Approve ──────────────────────────────────────────────────────
async function handleVerificationApprove(interaction: ButtonInteraction, verificationId: string) {
  await interaction.deferReply({ ephemeral: true });

  const verification = await prisma.verificationSubmission.findUnique({
    where: { id: verificationId },
    include: { user: { select: { discordId: true, username: true } } },
  });

  if (!verification) {
    await interaction.editReply("❌ Verification not found.");
    return;
  }

  if (verification.status !== "PENDING") {
    await interaction.editReply(`⚠️ This verification has already been ${verification.status.toLowerCase()}.`);
    return;
  }

  // Update status
  await prisma.verificationSubmission.update({
    where: { id: verificationId },
    data: { status: "APPROVED", reviewedAt: new Date() },
  });

  const ROLE_IDS: Record<number, string | undefined> = {
    1: process.env.DISCORD_ROLE_VERIFIED_L1,
    2: process.env.DISCORD_ROLE_VERIFIED_L2,
    3: process.env.DISCORD_ROLE_VERIFIED_L3,
  };

  const guildId = process.env.DISCORD_GUILD_ID!;

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(verification.user.discordId);

    // Remove lower-level verification roles
    for (let lvl = 1; lvl < verification.level; lvl++) {
      const oldRoleId = ROLE_IDS[lvl];
      if (oldRoleId) {
        await member.roles.remove(oldRoleId).catch(() => {});
      }
    }

    // Grant new role
    const newRoleId = ROLE_IDS[verification.level];
    if (newRoleId) {
      await member.roles.add(newRoleId);
    }

    // Send DM to user
    const dmEmbed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("✅ Verification Approved!")
      .setDescription(
        `Congratulations **${verification.user.username}**! Your Level ${verification.level} verification has been approved.\n\n🎭 You've received the **Verified Level ${verification.level}** role.\n\nWelcome to the verified community! 🎉`
      )
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] }).catch(() => {});

    // Update the original admin message
    await interaction.message.edit({
      content: `✅ **Approved** by <@${interaction.user.id}>`,
      components: [],
    }).catch(() => {});

    await interaction.editReply(`✅ Verification approved for <@${verification.user.discordId}>. Role granted.`);
  } catch (err) {
    console.error("Approve error:", err);
    await interaction.editReply("❌ Failed to approve. Please check bot permissions and try again.");
  }
}

// ── Show Reject Modal ─────────────────────────────────────────────────────────
async function showRejectModal(interaction: ButtonInteraction, verificationId: string) {
  const modal = new ModalBuilder()
    .setCustomId(`reject_modal_${verificationId}`)
    .setTitle("Reject Verification");

  const reasonInput = new TextInputBuilder()
    .setCustomId("reject_reason")
    .setLabel("Reason for rejection")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Please provide a clear reason for rejection...")
    .setRequired(true)
    .setMinLength(10)
    .setMaxLength(500);

  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput));
  await interaction.showModal(modal);
}

// ── Verification Reject ───────────────────────────────────────────────────────
async function handleVerificationReject(
  interaction: ModalSubmitInteraction,
  verificationId: string,
  reason: string
) {
  await interaction.deferReply({ ephemeral: true });

  const verification = await prisma.verificationSubmission.findUnique({
    where: { id: verificationId },
    include: { user: { select: { discordId: true, username: true } } },
  });

  if (!verification) {
    await interaction.editReply("❌ Verification not found.");
    return;
  }

  if (verification.status !== "PENDING") {
    await interaction.editReply(`⚠️ This verification has already been ${verification.status.toLowerCase()}.`);
    return;
  }

  await prisma.verificationSubmission.update({
    where: { id: verificationId },
    data: { status: "REJECTED", reviewedAt: new Date(), rejectReason: reason },
  });

  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!);
    const member = await guild.members.fetch(verification.user.discordId);

    const dmEmbed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle("❌ Verification Rejected")
      .setDescription(
        `Hi **${verification.user.username}**, your Level ${verification.level} verification has been rejected.\n\n📝 **Reason:** ${reason}\n\nYou may re-submit your verification after addressing the issue.`
      )
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] }).catch(() => {});

    // Update the original admin message
    await interaction.message?.edit({
      content: `❌ **Rejected** by <@${interaction.user.id}>: ${reason}`,
      components: [],
    }).catch(() => {});

    await interaction.editReply(`❌ Verification rejected for <@${verification.user.discordId}>.`);
  } catch (err) {
    console.error("Reject error:", err);
    await interaction.editReply("❌ Failed to process rejection.");
  }
}

// ── Guild Member Add (welcome) ────────────────────────────────────────────────
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const settings = await prisma.botSettings.findMany();
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    const welcomeMsg = settingsMap.welcome_message ||
      `👋 Welcome to **Legendary Community**, <@${member.id}>!\n\n🎮 We're glad to have you here! Head to #verification to get started and unlock exclusive roles.`;

    const embed = new EmbedBuilder()
      .setColor(0x9333ea)
      .setTitle("🎉 Welcome to Legendary Community!")
      .setDescription(welcomeMsg.replace("{username}", member.displayName))
      .addFields(
        { name: "🛒 Shop Roles", value: "Visit our website to purchase exclusive Discord roles", inline: true },
        { name: "🔐 Verification", value: "Complete verification to unlock special features", inline: true },
        { name: "🎫 Support", value: "Open a ticket if you need help", inline: true }
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    await member.send({ embeds: [embed] }).catch(() => {});
  } catch (err) {
    console.error("Welcome DM error:", err);
  }
});

// ── Error handling ────────────────────────────────────────────────────────────
client.on(Events.Error, (err) => console.error("Discord client error:", err));
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));

// ── Start bot ────────────────────────────────────────────────────────────────
client.login(process.env.DISCORD_BOT_TOKEN).catch((err) => {
  console.error("Failed to login:", err);
  process.exit(1);
});


import express, { Request, Response } from "express"

const app = express()

app.get("/", (_req: Request, res: Response) => {
  res.send("Bot is running")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`)
})