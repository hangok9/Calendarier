import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { createSession } from "@/lib/auth"
import { tryCatch, conflict, badRequest } from "@/lib/errors"
import { validate, registerSchema } from "@/lib/validate"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: Request) {
  return tryCatch(async () => {
    const { email, username, password } = validate(registerSchema, await request.json())

    const usernameLower = username.toLowerCase().trim()

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", usernameLower)
      .maybeSingle()

    if (existing) throw conflict("El nombre de usuario ya esta registrado")

    const hash = await bcrypt.hash(password, 10)

    const { data: user, error: createError } = await supabase
      .from("users")
      .insert({ username: usernameLower, email: email || null, password: hash })
      .select()
      .single()

    if (createError || !user) {
      console.error("Create user error:", createError)
      throw badRequest("Error al crear el usuario")
    }

    const { data: matchingPeople } = await supabase
      .from("people")
      .select("id, calendar_id")
      .eq("user_id", null)
      .ilike("name", usernameLower)

    if (matchingPeople && matchingPeople.length > 0) {
      const ids = matchingPeople.map((p) => p.id)
      await supabase.from("people").update({ user_id: user.id }).in("id", ids)
    }

    if (user.email) {
      sendWelcomeEmail(user.email, user.username).catch((e) =>
        console.error("Welcome email error:", e)
      )
    }

    await createSession({ user_id: user.id, username: user.username })

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    })
  })
}
