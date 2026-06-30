import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import { supabase } from "@/lib/supabase"
import { sendPasswordResetEmail } from "@/lib/email"

const resetSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || "calendarier-jwt-secret-change-in-production-2026"
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, username")
      .eq("email", email)
      .maybeSingle()

    // Don't reveal whether the email exists or not
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Si el email existe, recibiras un enlace para restablecer tu contrasena",
      })
    }

    const token = await new SignJWT({ user_id: user.id, purpose: "reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(resetSecret)

    try {
      await sendPasswordResetEmail(email, token)
    } catch (e) {
      console.error("Reset email error:", e)
    }

    return NextResponse.json({
      success: true,
      message: "Si el email existe, recibiras un enlace para restablecer tu contrasena",
    })
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
