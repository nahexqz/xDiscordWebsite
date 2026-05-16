import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      totalRevenue,
      revenueToday,
      openTickets,
      pendingVerifications,
      totalOrders,
      topProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: today } },
        _sum: { amount: true },
      }),
      prisma.ticket.count({ where: { status: { in: ["PENDING", "IN_PROGRESS"] } } }),
      prisma.verificationSubmission.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { soldCount: "desc" },
        take: 10,
        select: { name: true, soldCount: true, price: true },
      }),
    ]);

    // Revenue chart: last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const revenueData = await Promise.all(
      last30Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const [revenue, orders] = await Promise.all([
          prisma.order.aggregate({
            where: {
              status: "COMPLETED",
              createdAt: { gte: date, lt: nextDay },
            },
            _sum: { amount: true },
          }),
          prisma.order.count({
            where: {
              status: "COMPLETED",
              createdAt: { gte: date, lt: nextDay },
            },
          }),
        ]);

        return {
          date: format(date, "MM/dd"),
          revenue: (revenue._sum.amount || 0) / 100,
          orders,
        };
      })
    );

    return NextResponse.json({
      totalUsers,
      newUsersToday,
      totalRevenue: totalRevenue._sum.amount || 0,
      revenueToday: revenueToday._sum.amount || 0,
      openTickets,
      pendingVerifications,
      totalOrders,
      topProducts: topProducts.map((p) => ({
        name: p.name,
        soldCount: p.soldCount,
        revenue: p.soldCount * p.price,
      })),
      revenueChart: revenueData,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
