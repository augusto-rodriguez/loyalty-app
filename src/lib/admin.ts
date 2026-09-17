import { getSession } from "@/lib/auth";

// Los emails admin se definen en .env separados por coma
// ADMIN_EMAILS="tu@email.com,otro@admin.com"
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return adminEmails.includes(session.email.toLowerCase());
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    return { authorized: false as const, error: "No autorizado" };
  }
  return { authorized: true as const };
}
