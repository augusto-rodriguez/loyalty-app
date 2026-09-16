import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const programs = await prisma.loyaltyProgram.findMany({
    where: { businessId: session.businessId },
    select: { id: true },
  });

  const programIds = programs.map((p) => p.id);

  const [totalCustomers, totalVisits, pendingRewards, redeemedRewards] =
    await Promise.all([
      prisma.customerCard.count({
        where: { loyaltyProgramId: { in: programIds } },
      }),
      prisma.visit.count({
        where: { customerCard: { loyaltyProgramId: { in: programIds } } },
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

  // Visitas de los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentVisits = await prisma.visit.count({
    where: {
      customerCard: { loyaltyProgramId: { in: programIds } },
      createdAt: { gte: sevenDaysAgo },
    },
  });

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
}
