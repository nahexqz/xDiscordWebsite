import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendVerificationToAdminChannel } from "@/lib/discord-bot";

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const formData = await request.formData();
    const level = Number(formData.get("level") || 1);

    // Check if user already has a pending submission for this level
    const existing = await prisma.verificationSubmission.findFirst({
      where: { userId: user!.id, level, status: "PENDING" },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending verification submission for this level." },
        { status: 400 }
      );
    }

    // Check if user is already approved at this level
    const approved = await prisma.verificationSubmission.findFirst({
      where: { userId: user!.id, level, status: "APPROVED" },
    });
    if (approved) {
      return NextResponse.json(
        { error: "You are already verified at this level." },
        { status: 400 }
      );
    }

    let profileScreenshotUrl: string | undefined;
    let selfieImageUrl: string | undefined;
    let idCardImageUrl: string | undefined;

    // Upload profile screenshot (Level 1)
    const screenshotFile = formData.get("profileScreenshot") as File | null;
    if (screenshotFile && screenshotFile.size > 0) {
      const buffer = Buffer.from(await screenshotFile.arrayBuffer());
      profileScreenshotUrl = await uploadToCloudinary(buffer, "verifications/screenshots", `${user!.id}_${Date.now()}`);
    }

    // Upload selfie (Level 2)
    const selfieFile = formData.get("selfieImage") as File | null;
    if (selfieFile && selfieFile.size > 0) {
      const buffer = Buffer.from(await selfieFile.arrayBuffer());
      selfieImageUrl = await uploadToCloudinary(buffer, "verifications/selfies", `${user!.id}_${Date.now()}`);
    }

    // Upload ID card (Level 3)
    const idCardFile = formData.get("idCardImage") as File | null;
    if (idCardFile && idCardFile.size > 0) {
      const buffer = Buffer.from(await idCardFile.arrayBuffer());
      idCardImageUrl = await uploadToCloudinary(buffer, "verifications/id-cards", `${user!.id}_${Date.now()}`);
    }

    // Build submission data
    const birthdateStr = formData.get("birthdate") as string;
    const birthdate = birthdateStr ? new Date(birthdateStr) : new Date();

    const submissionData: any = {
      userId: user!.id,
      level,
      status: "PENDING",
      firstName: (formData.get("firstName") as string) || "",
      lastName: (formData.get("lastName") as string) || "",
      birthdate,
      discordUid: (formData.get("discordUid") as string) || user!.discordId,
      email: (formData.get("email") as string) || user!.email || "",
      phone: (formData.get("phone") as string) || "",
      phoneVerified: true, // verified via Firebase OTP on frontend
      facebookUrl: (formData.get("facebookUrl") as string) || null,
      instagramUrl: (formData.get("instagramUrl") as string) || null,
      otherSocialUrl: (formData.get("otherSocialUrl") as string) || null,
    };

    if (profileScreenshotUrl) submissionData.profileScreenshot = profileScreenshotUrl;
    if (selfieImageUrl) submissionData.selfieImage = selfieImageUrl;
    if (idCardImageUrl) submissionData.idCardImage = idCardImageUrl;

    // Create submission
    const submission = await prisma.verificationSubmission.create({
      data: submissionData,
      include: { user: { select: { username: true, discordId: true } } },
    });

    // Send to admin Discord channel with approve/reject buttons
    try {
      const messageId = await sendVerificationToAdminChannel({
        ...submission,
        birthdate: submission.birthdate,
      });
      if (messageId) {
        await prisma.verificationSubmission.update({
          where: { id: submission.id },
          data: { discordMessageId: messageId },
        });
      }
    } catch (botErr) {
      console.error("Failed to send verification to Discord:", botErr);
    }

    return NextResponse.json({ success: true, submissionId: submission.id }, { status: 201 });
  } catch (err) {
    console.error("Verification submission error:", err);
    return NextResponse.json({ error: "Failed to submit verification" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  const submissions = await prisma.verificationSubmission.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, level: true, status: true, createdAt: true,
      reviewedAt: true, rejectReason: true,
    },
  });

  return NextResponse.json({ submissions });
}
