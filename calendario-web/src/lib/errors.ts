import { NextResponse } from "next/server"

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function unauthorized(msg = "No autorizado") {
  return new AppError(msg, 401)
}

export function forbidden(msg = "Acceso denegado") {
  return new AppError(msg, 403)
}

export function notFound(msg = "No encontrado") {
  return new AppError(msg, 404)
}

export function badRequest(msg = "Solicitud invalida") {
  return new AppError(msg, 400)
}

export function conflict(msg = "Conflicto") {
  return new AppError(msg, 409)
}

export function apiError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode })
  }
  if (err instanceof Error) {
    console.error("Unhandled error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
  console.error("Internal error:", err)
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
}

export function tryCatch<T>(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  return fn().catch(apiError)
}
