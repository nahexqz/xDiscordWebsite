import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendDiscordDM } from "@/lib/discord-bot";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { discordId: true, username: true } } },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const reply = await prisma.ticketReply.create({
    data: { ticketId: id, userId: user!.id, message, isAdmin: true },
  });

  try {
    await sendDiscordDM(
      ticket.user.discordId,
      `💬 **Admin Reply — Ticket #${ticket.ticketNumber}**\n\n${message}\n\n_Reply on the website to continue the conversation._`
    );
  } catch {}

  return NextResponse.json({ reply });
}
