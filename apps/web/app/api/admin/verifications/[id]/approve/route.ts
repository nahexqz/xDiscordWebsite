import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleVerificationApproval } from "@/lib/discord-bot";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const verification = await prisma.verificationSubmission.findUnique({
      where: { id },
      include: { user: { select: { discordId: true, username: true } } },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    if (verification.status !== "PENDING") {
      return NextResponse.json({ error: "Verification is not pending" }, { status: 400 });
    }

    await prisma.verificationSubmission.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedBy: user!.id,
        reviewedAt: new Date(),
      },
    });

    await handleVerificationApproval({
      id: verification.id,
      level: verification.level,
      user: verification.user,
    });

    await prisma.adminLog.create({
      data: {
        performerId: user!.id,
        targetId: verification.userId,
        action: "VERIFICATION_APPROVE",
        description: `Approved Level ${verification.level} verification for ${verification.user.username}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verification approval error:", err);
    return NextResponse.json({ error: "Failed to approve verification" }, { status: 500 });
  }
}
