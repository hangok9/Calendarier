import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, username, password, confirmPassword } = await request.json()

    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contrasenas no coinciden" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contrasena debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const usernameLower = username.toLowerCase().trim()

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", usernameLower)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "El nombre de usuario ya esta registrado" },
        { status: 409 }
      )
    }

    const hash = await bcrypt.hash(password, 10)

    const { data: user, error: createError } = await supabase
      .from("users")
      .insert({ username: usernameLower, email: email || null, password: hash })
      .select()
      .single()

    if (createError || !user) {
      console.error("Create user error:", createError)
      return NextResponse.json(
        { error: "Error al crear el usuario" },
        { status: 500 }
      )
    }

    // Link to existing people entries (same name, case-insensitive)
    const { data: matchingPeople } = await supabase
      .from("people")
      .select("id, calendar_id")
      .eq("user_id", null)
      .ilike("name", usernameLower)

    if (matchingPeople && matchingPeople.length > 0) {
      const ids = matchingPeople.map((p) => p.id)
      await supabase.from("people").update({ user_id: user.id }).in("id", ids)
    }

    // Stub email (replace with real email service later)
    try {
      console.log(`[EMAIL STUB] Bienvenido a Calendarier, ${username}!
    Usuario: ${usernameLower}
    Email: ${email || "no especificado"}
    (El envio real se implementara con Resend/SendGrid mas adelante)`)
    } catch {
      // Email sending is best-effort
    }

    await createSession({
      user_id: user.id,
      username: user.username,
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
