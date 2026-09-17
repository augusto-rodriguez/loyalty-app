import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateRandomPin, getExpirationDate, isPinExpired, minutesUntilExpiration, PIN_VALIDITY_MINUTES } from "@/lib/pin";

// GET: obtener el PIN actual. Si expiró, genera uno nuevo automáticamente.
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
      select: { requiresPin: true, currentPin: true, pinExpiresAt: true },
    });

    if (!program) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    if (!program.requiresPin) {
      return NextResponse.json({ error: "Este programa no usa PIN" }, { status: 400 });
    }

    // Si no hay PIN o ya expiró, generar uno nuevo
    if (!program.currentPin || isPinExpired(program.pinExpiresAt)) {
      const newPin = generateRandomPin();
      const expiresAt = getExpirationDate();

      await prisma.loyaltyProgram.update({
        where: { id },
        data: { currentPin: newPin, pinExpiresAt: expiresAt },
      });

      return NextResponse.json({
        pin: newPin,
        expiresAt,
        minutesLeft: PIN_VALIDITY_MINUTES,
      });
    }

    return NextResponse.json({
      pin: program.currentPin,
      expiresAt: program.pinExpiresAt,
      minutesLeft: minutesUntilExpiration(program.pinExpiresAt),
    });
  } catch (error) {
    console.error("Get PIN error:", error);
    return NextResponse.json({ error: "Error al obtener PIN" }, { status: 500 });
  }
}

// POST: forzar regeneración inmediata del PIN (botón "Actualizar ahora")
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

    const program = await prisma.loyaltyProgram.findFirst({
      where: { id, businessId: session.businessId },
      select: { requiresPin: true },
    });

    if (!program) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 });
    }

    if (!program.requiresPin) {
      return NextResponse.json({ error: "Este programa no usa PIN" }, { status: 400 });
    }

    const newPin = generateRandomPin();
    const expiresAt = getExpirationDate();

    await prisma.loyaltyProgram.update({
      where: { id },
      data: { currentPin: newPin, pinExpiresAt: expiresAt },
    });

    return NextResponse.json({
      pin: newPin,
      expiresAt,
      minutesLeft: PIN_VALIDITY_MINUTES,
    });
  } catch (error) {
    console.error("Regenerate PIN error:", error);
    return NextResponse.json({ error: "Error al regenerar PIN" }, { status: 500 });
  }
}
