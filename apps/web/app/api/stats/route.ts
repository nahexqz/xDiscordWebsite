import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    // Get online count from Socket.io if available
    const io = (global as any).io;
    const onlineCount = io ? io.engine.clientsCount : 0;

    // Get total member count from DB
    const totalUsers = await prisma.user.count({ where: { isBanned: false } });

    return NextResponse.json({
      online: onlineCount,
      total: totalUsers,
    });
  } catch {
    return NextResponse.json({ online: 0, total: 0 });
  }
}
