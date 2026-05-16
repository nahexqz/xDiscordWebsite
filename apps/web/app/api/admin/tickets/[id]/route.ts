import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendDiscordDM, getBotSettings } from "@/lib/discord-bot";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { status } = await request.json();

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      status,
      assignedTo: user!.id,
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    },
    include: { user: { select: { discordId: true, username: true } } },
  });

  try {
    const settings = await getBotSettings();
    const template = settings.ticket_updated_message ||
      "📋 **Ticket Update**\n\nHi {username}, your ticket **#{ticket_id}** status has been updated to: **{status}**";

    const message = template
      .replace("{username}", ticket.user.username)
      .replace("{ticket_id}", ticket.ticketNumber.toString())
      .replace("{status}", status.replace("_", " "));

    await sendDiscordDM(ticket.user.discordId, message);
  } catch {}

  return NextResponse.json({ ticket });
}
