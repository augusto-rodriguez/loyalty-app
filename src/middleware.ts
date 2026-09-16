import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Nota: no podemos importar jsonwebtoken en middleware (Edge Runtime)
// Así que hacemos una verificación básica de estructura JWT
// La verificación completa de firma se hace en cada API route con getSession()

function isValidJWTStructure(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    // Verificar que las partes son base64 válido
    const payload = JSON.parse(atob(parts[1]));

    // Verificar que no esté expirado
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    // Verificar que tenga los campos esperados
    if (!payload.businessId || !payload.email) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Rutas protegidas: todo lo que empiece con /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!token || !isValidJWTStructure(token)) {
      // Limpiar cookie inválida
      const response = NextResponse.redirect(new URL("/login", request.url));
      if (token) {
        response.cookies.set("auth-token", "", { maxAge: 0, path: "/" });
      }
      return response;
    }
  }

  // Si ya está logueado, redirigir login/register al dashboard
  if (pathname === "/login" || pathname === "/register") {
    if (token && isValidJWTStructure(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Headers de seguridad para todas las respuestas
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
