import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch, notFound, unauthorized, badRequest } from "@/lib/errors"
import { validate, changePasswordSchema } from "@/lib/validate"

export async function POST(request: Request) {
  return tryCatch(async () => {
    const session = await requireSession()

    const { oldPassword, newPassword } = validate(changePasswordSchema, await request.json())

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password")
      .eq("id", session.user_id)
      .single()

    if (userError || !user) throw notFound("Usuario no encontrado")

    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) throw unauthorized("La contrasena actual no es correcta")

    const newHash = await bcrypt.hash(newPassword, 10)
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: newHash })
      .eq("id", session.user_id)

    if (updateError) {
      console.error("Update password error:", updateError)
      throw badRequest("Error al actualizar la contrasena")
    }

    return NextResponse.json({ success: true })
  })
}
