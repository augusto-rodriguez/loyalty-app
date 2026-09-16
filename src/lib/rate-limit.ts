import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Si no hay credenciales de Upstash, el rate limiting se desactiva
// (para desarrollo local)
const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Diferentes límites para diferentes endpoints
const limiters = {
  // Login/Register: 5 intentos por minuto por IP
  auth: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") })
    : null,

  // Escaneo QR: 10 escaneos por minuto por IP
  scan: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") })
    : null,

  // API general: 60 requests por minuto por IP
  api: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m") })
    : null,
};

type LimiterType = keyof typeof limiters;

export async function rateLimit(
  identifier: string,
  type: LimiterType = "api"
): Promise<{ success: boolean; response?: NextResponse }> {
  const limiter = limiters[type];

  // Si no hay Redis configurado, dejar pasar (desarrollo)
  if (!limiter) {
    return { success: true };
  }

  try {
    const result = await limiter.limit(identifier);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": result.limit.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.reset.toString(),
            },
          }
        ),
      };
    }

    return { success: true };
  } catch {
    // Si Redis falla, dejar pasar (mejor disponibilidad que seguridad perfecta)
    console.error("Rate limit check failed, allowing request");
    return { success: true };
  }
}

// Helper para extraer IP del request
export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}
