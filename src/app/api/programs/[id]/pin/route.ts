import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateDailyPin } from "@/lib/pin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const program = await prisma.loyaltyProgram.findFirst({
      where: { id, businessId: session.businessId },
      select: { requiresPin: true, pinSeed: true },
    });

    if (!program) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    if (!program.requiresPin || !program.pinSeed) {
      return NextResponse.json({ error: "Este programa no usa PIN" }, { status: 400 });
    }

    const pin = generateDailyPin(program.pinSeed);

    return NextResponse.json({ pin });
  } catch (error) {
    console.error("Get PIN error:", error);
    return NextResponse.json({ error: "Error al obtener PIN" }, { status: 500 });
  }
}
