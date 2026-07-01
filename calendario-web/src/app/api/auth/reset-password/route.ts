import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { verifyResetToken } from "@/lib/auth"
import { tryCatch, badRequest } from "@/lib/errors"
import { validate, resetPasswordSchema } from "@/lib/validate"

export async function POST(request: Request) {
  return tryCatch(async () => {
    const { token, password } = validate(resetPasswordSchema, await request.json())

    const { user_id } = await verifyResetToken(token)

    const hash = await bcrypt.hash(password, 10)
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hash })
      .eq("id", user_id)

    if (updateError) {
      console.error("Reset password update error:", updateError)
      throw badRequest("Error al actualizar la contrasena")
    }

    return NextResponse.json({ success: true })
  })
}
