import { z } from "zod";

// === AUTH ===
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es muy largo")
    .trim(),
  email: z
    .string()
    .email("Email inválido")
    .max(255)
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(128),
  phone: z
    .string()
    .max(20)
    .trim()
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido").trim().toLowerCase(),
  password: z.string().min(1, "La contraseña es requerida"),
});

// === PROGRAMAS ===
export const createProgramSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100)
    .trim(),
  description: z.string().max(500).trim().optional().or(z.literal("")),
  stampsRequired: z
    .number()
    .int()
    .min(2, "Mínimo 2 sellos")
    .max(50, "Máximo 50 sellos"),
  cooldownMinutes: z
    .number()
    .int()
    .min(0, "El cooldown no puede ser negativo")
    .max(43200, "Máximo 1 mes")
    .default(60),
  requiresPin: z.boolean().default(false),
  rewardTitle: z
    .string()
    .min(2, "La recompensa debe tener al menos 2 caracteres")
    .max(200)
    .trim(),
  rewardDescription: z.string().max(500).trim().optional().or(z.literal("")),
});

export const updateProgramSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  stampsRequired: z.number().int().min(2).max(50).optional(),
  cooldownMinutes: z.number().int().min(0).max(43200).optional(),
  requiresPin: z.boolean().optional(),
  rewardTitle: z.string().min(2).max(200).trim().optional(),
  rewardDescription: z.string().max(500).trim().optional(),
  isActive: z.boolean().optional(),
});

// === ESCANEO (cliente) ===
export const scanSchema = z.object({
  phone: z
    .string()
    .min(6, "Teléfono muy corto")
    .max(20, "Teléfono muy largo")
    .trim()
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .max(255)
    .trim()
    .toLowerCase()
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .max(100)
    .trim()
    .optional()
    .or(z.literal("")),
  pin: z
    .string()
    .length(4, "El PIN debe tener 4 dígitos")
    .regex(/^\d{4}$/, "El PIN debe ser numérico")
    .optional()
    .or(z.literal("")),
}).refine(
  (data) => (data.phone && data.phone.length > 0) || (data.email && data.email.length > 0),
  { message: "Se necesita teléfono o email", path: ["phone"] }
);

export function validate<T>(schema: z.ZodSchema<T>, data: unknown):
  { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError.message };
}
