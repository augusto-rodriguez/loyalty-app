import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST: quitar el sello más reciente de una tarjeta (para revertir fraude)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que la tarjeta pertenece a un programa del negocio
    const card = await prisma.customerCard.findUnique({
      where: { id },
      include: {
        loyaltyProgram: true,
        reward: true,
        visits: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!card || card.loyaltyProgram.businessId !== session.businessId) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
    }

    if (card.stampsCount <= 0) {
      return NextResponse.json(
        { error: "Esta tarjeta no tiene sellos para quitar" },
        { status: 400 }
      );
    }

    // Si la tarjeta estaba completa y tenía reward sin canjear, hay que eliminarlo
    // porque al quitar un sello ya no cumple el requisito
    if (card.reward && !card.reward.isRedeemed) {
      await prisma.reward.delete({ where: { id: card.reward.id } });
    } else if (card.reward && card.reward.isRedeemed) {
      // Si ya fue canjeado, no permitir quitar el sello sin más contexto
      return NextResponse.json(
        { error: "No se puede quitar un sello: la recompensa ya fue canjeada" },
        { status: 400 }
      );
    }

    // Eliminar la visita más reciente (si existe)
    if (card.visits.length > 0) {
      await prisma.visit.delete({ where: { id: card.visits[0].id } });
    }

    // Actualizar el contador de sellos
    const updatedCard = await prisma.customerCard.update({
      where: { id },
      data: {
        stampsCount: card.stampsCount - 1,
        isCompleted: false,
        completedAt: null,
      },
    });

    return NextResponse.json({
      ok: true,
      stampsCount: updatedCard.stampsCount,
    });
  } catch (error) {
    console.error("Remove stamp error:", error);
    return NextResponse.json(
      { error: "Error al quitar el sello" },
      { status: 500 }
    );
  }
}
