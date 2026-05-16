import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user: admin, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { isBanned, isAdmin, banReason } = body;

    const updateData: {
      isBanned?: boolean;
      isAdmin?: boolean;
      banReason?: string | null;
    } = {};

    if (typeof isBanned === "boolean") updateData.isBanned = isBanned;
    if (typeof isAdmin === "boolean") updateData.isAdmin = isAdmin;
    if (banReason !== undefined) updateData.banReason = banReason;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, isBanned: true, isAdmin: true },
    });

    const action = isBanned !== undefined
      ? (isBanned ? "USER_BAN" : "USER_UNBAN")
      : isAdmin !== undefined
      ? (isAdmin ? "ADMIN_GRANT" : "ADMIN_REVOKE")
      : "USER_UPDATE";

    await prisma.adminLog.create({
      data: {
        performerId: admin!.id,
        targetId: id,
        action,
        description: `${action} for user ${updatedUser.username}`,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("User update error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}