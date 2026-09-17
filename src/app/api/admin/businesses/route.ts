import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        slug: true,
        createdAt: true,
        loyaltyPrograms: {
          select: {
            id: true,
            name: true,
            isActive: true,
            stampsRequired: true,
            rewardTitle: true,
            cooldownMinutes: true,
            createdAt: true,
            _count: {
              select: { customerCards: true },
            },
          },
        },
        _count: {
          select: { loyaltyPrograms: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Admin businesses error:", error);
    return NextResponse.json(
      { error: "Error al cargar negocios" },
      { status: 500 }
    );
  }
}
