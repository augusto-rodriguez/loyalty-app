import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createProgramSchema, validate } from "@/lib/validations";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const rl = await rateLimit(getIP(req), "api");
  if (!rl.success) return rl.response!;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const programs = await prisma.loyaltyProgram.findMany({
    where: { businessId: session.businessId },
    include: {
      _count: { select: { customerCards: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ programs });
}

export async function POST(req: Request) {
  const rl = await rateLimit(getIP(req), "api");
  if (!rl.success) return rl.response!;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = validate(createProgramSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, description, stampsRequired, cooldownMinutes, rewardTitle, rewardDescription } =
      validation.data;

    const qrCode = uuidv4().replace(/-/g, "").substring(0, 12).toUpperCase();

    const program = await prisma.loyaltyProgram.create({
      data: {
        businessId: session.businessId,
        name,
        description: description || null,
        stampsRequired,
        cooldownMinutes: cooldownMinutes ?? 60,
        rewardTitle,
        rewardDescription: rewardDescription || null,
        qrCode,
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error("Create program error:", error);
    return NextResponse.json(
      { error: "Error al crear el programa" },
      { status: 500 }
    );
  }
}
