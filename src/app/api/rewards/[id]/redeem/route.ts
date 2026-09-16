import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST: el negocio valida/canjea una recompensa
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  // Verificar que el reward pertenece a un programa del negocio
  const reward = await prisma.reward.findUnique({
    where: { id },
    include: {
      customerCard: {
        include: {
          loyaltyProgram: true,
        },
      },
    },
  });

  if (!reward || reward.customerCard.loyaltyProgram.businessId !== session.businessId) {
    return NextResponse.json(
      { error: "Recompensa no encontrada" },
      { status: 404 }
    );
  }

  if (reward.isRedeemed) {
    return NextResponse.json(
      { error: "Esta recompensa ya fue canjeada" },
      { status: 400 }
    );
  }

  await prisma.reward.update({
    where: { id },
    data: { isRedeemed: true, redeemedAt: new Date() },
  });

  return NextResponse.json({ ok: true, message: "Recompensa canjeada exitosamente" });
}
