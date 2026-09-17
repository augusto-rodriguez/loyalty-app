import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const { id } = await params;

    const business = await prisma.business.findUnique({
      where: { id },
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
            cooldownMinutes: true,
            rewardTitle: true,
            qrCode: true,
            createdAt: true,
            customerCards: {
              select: {
                id: true,
                stampsCount: true,
                isCompleted: true,
                createdAt: true,
                customer: {
                  select: { name: true, phone: true, email: true },
                },
                reward: {
                  select: { isRedeemed: true, redeemedAt: true },
                },
                _count: { select: { visits: true } },
              },
              orderBy: { updatedAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Admin business detail error:", error);
    return NextResponse.json(
      { error: "Error al cargar negocio" },
      { status: 500 }
    );
  }
}
