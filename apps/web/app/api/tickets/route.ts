import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendTicketNotification } from "@/lib/discord-bot";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  const tickets = await prisma.ticket.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { username: true } } },
      },
    },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const formData = await request.formData();
    const category = formData.get("category") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!category || !subject || !message) {
      return NextResponse.json({ error: "Category, subject, and message are required" }, { status: 400 });
    }

    // Rate limit: max 5 open tickets per user
    const openCount = await prisma.ticket.count({
      where: { userId: user!.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
    });
    if (openCount >= 5) {
      return NextResponse.json(
        { error: "You have too many open tickets. Please wait for existing ones to be resolved." },
        { status: 429 }
      );
    }

    let screenshotUrl: string | undefined;
    const screenshotFile = formData.get("screenshot") as File | null;
    if (screenshotFile && screenshotFile.size > 0) {
      const buffer = Buffer.from(await screenshotFile.arrayBuffer());
      screenshotUrl = await uploadToCloudinary(buffer, "tickets", `${user!.id}_${Date.now()}`);
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId: user!.id,
        category,
        subject: subject.slice(0, 100),
        message: message.slice(0, 2000),
        screenshot: screenshotUrl,
        status: "PENDING",
        priority: "MEDIUM",
      },
      include: { user: { select: { username: true, discordId: true } } },
    });

    // Send to Discord
    try {
      await sendTicketNotification({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        category: ticket.category,
        subject: ticket.subject,
        message: ticket.message,
        user: { discordId: ticket.user.discordId, username: ticket.user.username },
      });
    } catch (botErr) {
      console.error("Failed to send ticket notification:", botErr);
    }

    return NextResponse.json({ success: true, ticketId: ticket.id }, { status: 201 });
  } catch (err) {
    console.error("Ticket creation error:", err);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
