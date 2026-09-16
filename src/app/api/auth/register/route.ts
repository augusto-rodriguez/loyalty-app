import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { registerSchema, validate } from "@/lib/validations";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rl = await rateLimit(getIP(req), "auth");
    if (!rl.success) return rl.response!;

    const body = await req.json();
    const validation = validate(registerSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, email, password, phone } = validation.data;

    const existing = await prisma.business.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    let slug = slugify(name);
    const slugExists = await prisma.business.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const hashedPassword = await hashPassword(password);

    const business = await prisma.business.create({
      data: {
        name,
        slug,
        email,
        password: hashedPassword,
        phone: phone || null,
      },
    });

    const token = signToken({ businessId: business.id, email: business.email });

    const response = NextResponse.json({
      business: { id: business.id, name: business.name, slug: business.slug },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
