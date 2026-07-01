import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createResetToken } from "@/lib/auth"
import { tryCatch } from "@/lib/errors"
import { validate, forgotPasswordSchema } from "@/lib/validate"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  return tryCatch(async () => {
    const { email } = validate(forgotPasswordSchema, await request.json())

    const { data: user } = await supabase
      .from("users")
      .select("id, username")
      .eq("email", email)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Si el email existe, recibiras un enlace para restablecer tu contrasena",
      })
    }

    const token = await createResetToken(user.id)

    sendPasswordResetEmail(email, token).catch((e) =>
      console.error("Reset email error:", e)
    )

    return NextResponse.json({
      success: true,
      message: "Si el email existe, recibiras un enlace para restablecer tu contrasena",
    })
  })
}
