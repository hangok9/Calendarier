import { z } from "zod"
import { NextResponse } from "next/server"

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.issues[0]
    throw new Error(firstError?.message || "Datos invalidos")
  }
  return result.data
}

export function validateOrError<T>(schema: z.ZodSchema<T>, data: unknown): NextResponse | null {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return NextResponse.json(
      { error: firstError?.message || "Datos invalidos" },
      { status: 400 }
    )
  }
  return null
}

export const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contrasena requerida"),
})

export const registerSchema = z.object({
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmacion requerida"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contrasenas no coinciden",
  path: ["confirmPassword"],
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Contrasena actual requerida"),
  newPassword: z.string().min(6, "La nueva contrasena debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmacion requerida"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Las contrasenas nuevas no coinciden",
  path: ["confirmPassword"],
})

export const updateProfileSchema = z.object({
  email: z.string().email("Email invalido").optional().nullable(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email requerido"),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
})

export const createCalendarSchema = z.object({
  name: z.string().min(1, "Nombre del calendario requerido"),
  year: z.number().int().optional(),
  months: z.array(z.number().int().min(1).max(12)).optional(),
  myName: z.string().min(1, "Tu nombre es requerido"),
})

export const updateCalendarSchema = z.object({
  name: z.string().min(1).optional(),
  year: z.number().int().optional(),
  months: z.array(z.number().int().min(1).max(12)).optional(),
})

export const availabilitySchema = z.object({
  person_id: z.string().uuid("person_id invalido"),
  date: z.string().min(1, "Fecha requerida"),
  code: z.string().nullable().optional(),
})

export const batchAvailabilitySchema = z.object({
  person_id: z.string().uuid("person_id invalido"),
  code: z.string().nullable().optional(),
  start_date: z.string().min(1, "start_date requerido"),
  end_date: z.string().min(1, "end_date requerido"),
})

export const createEventSchema = z.object({
  person_id: z.string().uuid("person_id invalido"),
  date: z.string().min(1, "Fecha requerida"),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
})

export const createPlanSchema = z.object({
  title: z.string().min(1, "Titulo requerido"),
  description: z.string().nullable().optional(),
  start_date: z.string().min(1, "start_date requerido"),
  end_date: z.string().min(1, "end_date requerido"),
})

export const respondPlanSchema = z.object({
  response: z.enum(["accept", "decline", "maybe"], {
    error: "response debe ser accept, decline o maybe",
  }),
})

export const addPersonSchema = z.object({
  username: z.string().min(1, "Nombre de usuario requerido"),
})

export const updatePersonSchema = z.object({
  alias: z.string().nullable().optional(),
  role: z.enum(["manager", "member"]).optional(),
})
