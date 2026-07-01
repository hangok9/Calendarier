import { z } from "zod"

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
  email: z.string().email("Email invalido").optional().or(z.literal("")),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email requerido"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmacion requerida"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contrasenas no coinciden",
  path: ["confirmPassword"],
})

export const createCalendarSchema = z.object({
  name: z.string().min(1, "Nombre del calendario requerido"),
  myName: z.string().min(1, "Tu nombre es requerido"),
})

export const addPersonSchema = z.object({
  username: z.string().min(1, "Nombre de usuario requerido"),
})

export const batchAvailabilitySchema = z.object({
  personId: z.string().min(1, "Persona requerida"),
  code: z.string(),
  startDate: z.string().min(1, "Fecha inicio requerida"),
  endDate: z.string().min(1, "Fecha fin requerida"),
})

export const createEventSchema = z.object({
  personId: z.string().min(1, "Persona requerida"),
  date: z.string().min(1, "Fecha requerida"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  label: z.string().optional(),
  code: z.string().optional(),
})

export const createPlanSchema = z.object({
  title: z.string().min(1, "Titulo requerido"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Fecha inicio requerida"),
  endDate: z.string().min(1, "Fecha fin requerida"),
})
