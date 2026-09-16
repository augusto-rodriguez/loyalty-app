import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const programs = await prisma.loyaltyProgram.findMany({
      where: { businessId: session.businessId },
      select: { id: true },
    });

    const programIds = programs.map((p) => p.id);

    // Si no hay programas, devolver todo en cero
    if (programIds.length === 0) {
      return NextResponse.json({
        stats: {
          totalCustomers: 0,
          totalVisits: 0,
          recentVisits: 0,
          pendingRewards: 0,
          redeemedRewards: 0,
          totalPrograms: 0,
        },
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalCustomers, totalVisits, recentVisits, pendingRewards, redeemedRewards] =
      await Promise.all([
        prisma.customerCard.count({
          where: { loyaltyProgramId: { in: programIds } },
        }),
        prisma.visit.count({
          where: { customerCard: { loyaltyProgramId: { in: programIds } } },
        }),
        prisma.visit.count({
          where: {
            customerCard: { loyaltyProgramId: { in: programIds } },
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        prisma.reward.count({
          where: {
            isRedeemed: false,
            customerCard: { loyaltyProgramId: { in: programIds } },
          },
        }),
        prisma.reward.count({
          where: {
            isRedeemed: true,
            customerCard: { loyaltyProgramId: { in: programIds } },
          },
        }),
      ]);

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalVisits,
        recentVisits,
        pendingRewards,
        redeemedRewards,
        totalPrograms: programs.length,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Error al cargar estadísticas" },
      { status: 500 }
    );
  }
}
