import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET: detalle del programa con clientes
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const program = await prisma.loyaltyProgram.findFirst({
    where: { id, businessId: session.businessId },
    include: {
      customerCards: {
        include: {
          customer: true,
          visits: { orderBy: { createdAt: "desc" }, take: 5 },
          reward: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!program) {
    return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ program });
}

// PATCH: actualizar programa
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  const program = await prisma.loyaltyProgram.updateMany({
    where: { id, businessId: session.businessId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.stampsRequired && { stampsRequired: Number(data.stampsRequired) }),
      ...(data.rewardTitle && { rewardTitle: data.rewardTitle }),
      ...(data.rewardDescription !== undefined && {
        rewardDescription: data.rewardDescription,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return NextResponse.json({ updated: program.count });
}

// DELETE: eliminar programa
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.loyaltyProgram.deleteMany({
    where: { id, businessId: session.businessId },
  });

  return NextResponse.json({ ok: true });
}
