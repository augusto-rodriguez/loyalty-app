import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateProgramSchema, validate } from "@/lib/validations";

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
          visits: { orderBy: { createdAt: "desc" } },
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const validation = validate(updateProgramSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data;

    // Si se está desactivando el PIN, limpiar el PIN actual también
    const updateData: Record<string, unknown> = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.stampsRequired && { stampsRequired: data.stampsRequired }),
      ...(data.cooldownMinutes !== undefined && { cooldownMinutes: data.cooldownMinutes }),
      ...(data.rewardTitle && { rewardTitle: data.rewardTitle }),
      ...(data.rewardDescription !== undefined && { rewardDescription: data.rewardDescription }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    if (data.requiresPin !== undefined) {
      updateData.requiresPin = data.requiresPin;
      if (!data.requiresPin) {
        // Al desactivar, limpiar el PIN vigente
        updateData.currentPin = null;
        updateData.pinExpiresAt = null;
      }
    }

    const result = await prisma.loyaltyProgram.updateMany({
      where: { id, businessId: session.businessId },
      data: updateData,
    });

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("Update program error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

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
