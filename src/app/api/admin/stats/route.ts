import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalBusinesses,
      totalPrograms,
      activePrograms,
      totalCustomers,
      totalVisits,
      visitsLast7Days,
      visitsLast30Days,
      totalRewards,
      redeemedRewards,
      newBusinessesLast7Days,
      newBusinessesLast30Days,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.loyaltyProgram.count(),
      prisma.loyaltyProgram.count({ where: { isActive: true } }),
      prisma.customer.count(),
      prisma.visit.count(),
      prisma.visit.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.visit.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.reward.count(),
      prisma.reward.count({ where: { isRedeemed: true } }),
      prisma.business.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.business.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    return NextResponse.json({
      stats: {
        totalBusinesses,
        newBusinessesLast7Days,
        newBusinessesLast30Days,
        totalPrograms,
        activePrograms,
        totalCustomers,
        totalVisits,
        visitsLast7Days,
        visitsLast30Days,
        totalRewards,
        redeemedRewards,
        pendingRewards: totalRewards - redeemedRewards,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Error al cargar estadísticas" },
      { status: 500 }
    );
  }
}
