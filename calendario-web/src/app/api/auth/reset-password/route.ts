import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { jwtVerify } from "jose"
import { supabase } from "@/lib/supabase"

const resetSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || "calendarier-jwt-secret-change-in-production-2026"
)

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contrasena requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contrasena debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    let payload: { user_id: string; purpose: string }
    try {
      const { payload: verified } = await jwtVerify(token, resetSecret)
      payload = verified as unknown as typeof payload
    } catch {
      return NextResponse.json(
        { error: "El enlace ha expirado o no es valido. Solicita uno nuevo." },
        { status: 400 }
      )
    }

    if (payload.purpose !== "reset") {
      return NextResponse.json({ error: "Token invalido" }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hash })
      .eq("id", payload.user_id)

    if (updateError) {
      console.error("Reset password update error:", updateError)
      return NextResponse.json({ error: "Error al actualizar la contrasena" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
