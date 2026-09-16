import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanSchema, validate } from "@/lib/validations";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode } = await params;

  // Validar formato del QR code
  if (!/^[A-Z0-9]{8,16}$/.test(qrCode)) {
    return NextResponse.json(
      { error: "Código QR inválido" },
      { status: 400 }
    );
  }

  const program = await prisma.loyaltyProgram.findUnique({
    where: { qrCode },
    include: {
      business: { select: { name: true, logoUrl: true } },
    },
  });

  if (!program || !program.isActive) {
    return NextResponse.json(
      { error: "Programa no encontrado o inactivo" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    program: {
      id: program.id,
      name: program.name,
      description: program.description,
      stampsRequired: program.stampsRequired,
      rewardTitle: program.rewardTitle,
      rewardDescription: program.rewardDescription,
      businessName: program.business.name,
      businessLogo: program.business.logoUrl,
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode } = await params;

  try {
    // Rate limiting por IP
    const rl = await rateLimit(getIP(req), "scan");
    if (!rl.success) return rl.response!;

    // Validar formato del QR
    if (!/^[A-Z0-9]{8,16}$/.test(qrCode)) {
      return NextResponse.json({ error: "Código QR inválido" }, { status: 400 });
    }

    const body = await req.json();
    const validation = validate(scanSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { phone, email, name } = validation.data;

    // 1. Buscar programa
    const program = await prisma.loyaltyProgram.findUnique({
      where: { qrCode },
    });

    if (!program || !program.isActive) {
      return NextResponse.json(
        { error: "Programa no encontrado o inactivo" },
        { status: 404 }
      );
    }

    // 2. Buscar o crear cliente
    const identifier = phone && phone.length > 0 ? { phone } : { email: email! };
    let customer = await prisma.customer.findUnique({ where: identifier });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: phone && phone.length > 0 ? phone : null,
          email: email && email.length > 0 ? email : null,
          name: name && name.length > 0 ? name : null,
        },
      });
    }

    // 3. Buscar o crear tarjeta
    let card = await prisma.customerCard.findUnique({
      where: {
        customerId_loyaltyProgramId: {
          customerId: customer.id,
          loyaltyProgramId: program.id,
        },
      },
      include: { reward: true },
    });

    if (!card) {
      card = await prisma.customerCard.create({
        data: {
          customerId: customer.id,
          loyaltyProgramId: program.id,
        },
        include: { reward: true },
      });
    }

    // Si ya está completa, informar
    if (card.isCompleted) {
      return NextResponse.json({
        card: {
          stampsCount: card.stampsCount,
          stampsRequired: program.stampsRequired,
          isCompleted: true,
          rewardAvailable: !card.reward?.isRedeemed,
          rewardTitle: program.rewardTitle,
        },
        message: card.reward?.isRedeemed
          ? "¡Ya canjeaste tu recompensa! Espera a que el negocio reinicie tu tarjeta."
          : "¡Felicidades! Ya tienes tu recompensa lista para canjear.",
      });
    }

    // 4. Cooldown: mínimo 1 hora entre visitas
    const lastVisit = await prisma.visit.findFirst({
      where: { customerCardId: card.id },
      orderBy: { createdAt: "desc" },
    });

    if (lastVisit) {
      const hoursSinceLastVisit =
        (Date.now() - new Date(lastVisit.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastVisit < 1) {
        return NextResponse.json({
          card: {
            stampsCount: card.stampsCount,
            stampsRequired: program.stampsRequired,
            isCompleted: false,
            rewardAvailable: false,
            rewardTitle: program.rewardTitle,
          },
          message: "Ya registraste tu visita recientemente. Vuelve más tarde.",
          cooldown: true,
        });
      }
    }

    // 5. Registrar visita y actualizar sellos
    const newStamps = card.stampsCount + 1;
    const completed = newStamps >= program.stampsRequired;

    await prisma.visit.create({
      data: { customerCardId: card.id },
    });

    const updatedCard = await prisma.customerCard.update({
      where: { id: card.id },
      data: {
        stampsCount: newStamps,
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
    });

    if (completed) {
      await prisma.reward.create({
        data: { customerCardId: card.id },
      });
    }

    return NextResponse.json({
      card: {
        stampsCount: updatedCard.stampsCount,
        stampsRequired: program.stampsRequired,
        isCompleted: completed,
        rewardAvailable: completed,
        rewardTitle: program.rewardTitle,
      },
      message: completed
        ? `🎉 ¡Felicidades! Desbloqueaste: ${program.rewardTitle}`
        : `✅ ¡Visita registrada! ${newStamps}/${program.stampsRequired} sellos`,
      newStamp: true,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Error al registrar la visita" },
      { status: 500 }
    );
  }
}
