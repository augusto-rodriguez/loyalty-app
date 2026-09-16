import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { loginSchema, validate } from "@/lib/validations";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(getIP(req), "auth");
    if (!rl.success) return rl.response!;

    const body = await req.json();
    const validation = validate(loginSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password } = validation.data;

    const business = await prisma.business.findUnique({ where: { email } });
    if (!business) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, business.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
