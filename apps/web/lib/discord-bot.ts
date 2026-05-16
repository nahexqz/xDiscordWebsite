import { prisma } from "./prisma";

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

function botHeaders() {
  return {
    Authorization: `Bot ${BOT_TOKEN}`,
    "Content-Type": "application/json",
  };
}

// ── Grant Discord Role ────────────────────────────────────────────────────────
export async function grantDiscordRole(
  guildId: string,
  discordUserId: string,
  roleId: string
): Promise<boolean> {
  const res = await fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
    { method: "PUT", headers: botHeaders() }
  );
  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    console.error(`Failed to grant role ${roleId} to ${discordUserId}:`, err);
    return false;
  }
  return true;
}

// ── Remove Discord Role ───────────────────────────────────────────────────────
export async function removeDiscordRole(
  guildId: string,
  discordUserId: string,
  roleId: string
): Promise<boolean> {
  const res = await fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
    { method: "DELETE", headers: botHeaders() }
  );
  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    console.error(`Failed to remove role ${roleId} from ${discordUserId}:`, err);
    return false;
  }
  return true;
}

// ── Send DM to user ───────────────────────────────────────────────────────────
export async function sendDiscordDM(
  discordUserId: string,
  content: string,
  embeds?: object[]
): Promise<boolean> {
  // Create DM channel
  const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: botHeaders(),
    body: JSON.stringify({ recipient_id: discordUserId }),
  });

  if (!dmRes.ok) {
    console.error(`Failed to create DM channel for ${discordUserId}`);
    return false;
  }

  const dmChannel = await dmRes.json();

  const payload: any = {};
  if (content) payload.content = content;
  if (embeds) payload.embeds = embeds;

  const msgRes = await fetch(`${DISCORD_API}/channels/${dmChannel.id}/messages`, {
    method: "POST",
    headers: botHeaders(),
    body: JSON.stringify(payload),
  });

  if (!msgRes.ok) {
    const err = await msgRes.text();
    console.error(`Failed to send DM to ${discordUserId}:`, err);
    return false;
  }

  return true;
}

// ── Send message to channel ───────────────────────────────────────────────────
export async function sendChannelMessage(
  channelId: string,
  content: string,
  embeds?: object[],
  components?: object[]
): Promise<string | null> {
  const payload: any = {};
  if (content) payload.content = content;
  if (embeds) payload.embeds = embeds;
  if (components) payload.components = components;

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: botHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to send message to channel ${channelId}:`, err);
    return null;
  }

  const msg = await res.json();
  return msg.id;
}

// ── Send verification to admin channel with Approve/Reject buttons ─────────────
export async function sendVerificationToAdminChannel(verification: {
  id: string;
  level: number;
  firstName: string;
  lastName: string;
  discordUid: string;
  email: string;
  phone: string;
  birthdate: string | Date;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  profileScreenshot?: string | null;
  selfieImage?: string | null;
  idCardImage?: string | null;
  user: { username: string };
}): Promise<string | null> {
  const channelId = process.env.DISCORD_ADMIN_CHANNEL_ID!;

  const embed = {
    title: `🔐 New Verification Request — Level ${verification.level}`,
    color: 0x9333ea,
    fields: [
      { name: "👤 Discord User", value: `<@${verification.discordUid}> (${verification.user.username})`, inline: true },
      { name: "🆔 Discord ID", value: verification.discordUid, inline: true },
      { name: "📛 Full Name", value: `${verification.firstName} ${verification.lastName}`, inline: true },
      { name: "📧 Email", value: verification.email, inline: true },
      { name: "📱 Phone", value: verification.phone, inline: true },
      { name: "🎂 Birthdate", value: new Date(verification.birthdate).toLocaleDateString("th-TH"), inline: true },
      ...(verification.facebookUrl ? [{ name: "📘 Facebook", value: verification.facebookUrl }] : []),
      ...(verification.instagramUrl ? [{ name: "📸 Instagram", value: verification.instagramUrl }] : []),
    ],
    image: verification.profileScreenshot ? { url: verification.profileScreenshot } : undefined,
    thumbnail: verification.selfieImage ? { url: verification.selfieImage } : undefined,
    footer: { text: `Verification ID: ${verification.id}` },
    timestamp: new Date().toISOString(),
  };

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3, // Success/Green
          label: "✅ Approve",
          custom_id: `verify_approve_${verification.id}`,
        },
        {
          type: 2,
          style: 4, // Danger/Red
          label: "❌ Reject",
          custom_id: `verify_reject_${verification.id}`,
        },
      ],
    },
  ];

  return sendChannelMessage(channelId, "", [embed], components);
}

// ── Send ticket notification ──────────────────────────────────────────────────
export async function sendTicketNotification(ticket: {
  id: string;
  ticketNumber: number;
  category: string;
  subject: string;
  message: string;
  user: { discordId: string; username: string };
}): Promise<void> {
  const adminChannelId = process.env.DISCORD_TICKET_CHANNEL_ID || process.env.DISCORD_ADMIN_CHANNEL_ID!;

  const embed = {
    title: `🎫 New Support Ticket #${ticket.ticketNumber}`,
    color: 0x3b82f6,
    fields: [
      { name: "👤 User", value: `<@${ticket.user.discordId}> (${ticket.user.username})`, inline: true },
      { name: "📂 Category", value: ticket.category, inline: true },
      { name: "📝 Subject", value: ticket.subject },
      { name: "💬 Message", value: ticket.message.slice(0, 500) + (ticket.message.length > 500 ? "..." : "") },
    ],
    footer: { text: `Ticket ID: ${ticket.id}` },
    timestamp: new Date().toISOString(),
  };

  await sendChannelMessage(adminChannelId, "", [embed]);

  // Confirm DM to user
  const settings = await getBotSettings();
  const template = settings.ticket_created_message ||
    "🎫 **Ticket Created!**\n\nHi {username}, your support ticket **#{ticket_id}** has been received.\n\n📂 Category: {category}\n📝 Subject: {subject}\n\nOur team will respond soon!";

  const message = template
    .replace("{username}", ticket.user.username)
    .replace("{ticket_id}", ticket.ticketNumber.toString())
    .replace("{category}", ticket.category)
    .replace("{subject}", ticket.subject);

  await sendDiscordDM(ticket.user.discordId, message);
}

// ── Get bot settings from DB ──────────────────────────────────────────────────
export async function getBotSettings(): Promise<Record<string, string>> {
  const settings = await prisma.botSettings.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

// ── Handle verification approval (role assignment) ────────────────────────────
export async function handleVerificationApproval(
  verification: {
    id: string;
    level: number;
    user: { discordId: string; username: string };
  }
): Promise<void> {
  const guildId = process.env.DISCORD_GUILD_ID!;
  const discordId = verification.user.discordId;

  const ROLE_IDS: Record<number, string | undefined> = {
    1: process.env.DISCORD_ROLE_VERIFIED_L1,
    2: process.env.DISCORD_ROLE_VERIFIED_L2,
    3: process.env.DISCORD_ROLE_VERIFIED_L3,
  };

  // Remove lower-level roles
  for (let lvl = 1; lvl < verification.level; lvl++) {
    const oldRoleId = ROLE_IDS[lvl];
    if (oldRoleId) {
      await removeDiscordRole(guildId, discordId, oldRoleId).catch(() => {});
    }
  }

  // Grant new role
  const newRoleId = ROLE_IDS[verification.level];
  if (newRoleId) {
    await grantDiscordRole(guildId, discordId, newRoleId);
  }

  // Send approval DM
  const settings = await getBotSettings();
  const template = settings.verification_approved_message ||
    "✅ **Verification Approved!**\n\nCongratulations {username}! Your Level {level} verification has been approved.\n\n🎭 You've received the **Verified Level {level}** role.\n\nWelcome to the verified community! 🎉";

  const message = template
    .replace(/{username}/g, verification.user.username)
    .replace(/{level}/g, verification.level.toString());

  await sendDiscordDM(discordId, message);
}

// ── Handle verification rejection ─────────────────────────────────────────────
export async function handleVerificationRejection(
  verification: {
    level: number;
    user: { discordId: string; username: string };
  },
  reason: string
): Promise<void> {
  const settings = await getBotSettings();
  const template = settings.verification_rejected_message ||
    "❌ **Verification Rejected**\n\nHi {username}, your Level {level} verification has been rejected.\n\n📝 Reason: {reason}\n\nYou may re-submit your verification after addressing the issue.";

  const message = template
    .replace(/{username}/g, verification.user.username)
    .replace(/{level}/g, verification.level.toString())
    .replace(/{reason}/g, reason);

  await sendDiscordDM(verification.user.discordId, message);
}
