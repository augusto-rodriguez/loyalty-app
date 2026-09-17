import crypto from "crypto";

/**
 * Genera un PIN de 4 dígitos determinístico basado en un seed y la fecha actual.
 * El mismo seed + misma fecha = mismo PIN.
 * Cambia automáticamente a medianoche UTC.
 */
export function generateDailyPin(seed: string): string {
  const today = new Date().toISOString().split("T")[0]; // "2026-09-17"
  const hash = crypto
    .createHmac("sha256", seed)
    .update(today)
    .digest("hex");

  // Tomar los primeros 4 dígitos del hash convertido a número
  const num = parseInt(hash.substring(0, 8), 16) % 10000;
  return num.toString().padStart(4, "0");
}

/**
 * Genera un seed aleatorio para un programa nuevo
 */
export function generatePinSeed(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Verifica si un PIN ingresado coincide con el PIN actual del programa
 */
export function verifyPin(seed: string, inputPin: string): boolean {
  const correctPin = generateDailyPin(seed);
  return inputPin === correctPin;
}
