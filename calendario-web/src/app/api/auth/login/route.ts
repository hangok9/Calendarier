import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { createSession } from "@/lib/auth"
import { tryCatch, notFound, unauthorized } from "@/lib/errors"
import { validate, loginSchema } from "@/lib/validate"

export async function POST(request: Request) {
  return tryCatch(async () => {
    const { username, password } = validate(loginSchema, await request.json())

    const usernameLower = username.toLowerCase().trim()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", usernameLower)
      .single()

    if (userError || !user) throw notFound("Usuario no encontrado")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw unauthorized("Contrasena incorrecta")

    await createSession({ user_id: user.id, username: user.username })

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    })
  })
}
