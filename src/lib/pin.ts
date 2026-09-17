import crypto from "crypto";

export const PIN_VALIDITY_MINUTES = 10;

/**
 * Genera un PIN aleatorio de 4 dígitos
 */
export function generateRandomPin(): string {
  const num = crypto.randomInt(0, 10000);
  return num.toString().padStart(4, "0");
}

/**
 * Calcula la fecha de expiración a partir de ahora
 */
export function getExpirationDate(minutes: number = PIN_VALIDITY_MINUTES): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Verifica si un PIN ya expiró
 */
export function isPinExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}

/**
 * Minutos restantes hasta que expire el PIN (redondeado hacia arriba)
 */
export function minutesUntilExpiration(expiresAt: Date | string | null): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 60000));
}
