import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleVerificationRejection } from "@/lib/discord-bot";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { reason } = await request.json();
    if (!reason?.trim()) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    const verification = await prisma.verificationSubmission.findUnique({
      where: { id },
      include: { user: { select: { discordId: true, username: true } } },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    await prisma.verificationSubmission.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: user!.id,
        reviewedAt: new Date(),
        rejectReason: reason,
      },
    });

    await handleVerificationRejection(
      { level: verification.level, user: verification.user },
      reason
    );

    await prisma.adminLog.create({
      data: {
        performerId: user!.id,
        targetId: verification.userId,
        action: "VERIFICATION_REJECT",
        description: `Rejected Level ${verification.level} verification for ${verification.user.username}. Reason: ${reason}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verification rejection error:", err);
    return NextResponse.json({ error: "Failed to reject verification" }, { status: 500 });
  }
}
