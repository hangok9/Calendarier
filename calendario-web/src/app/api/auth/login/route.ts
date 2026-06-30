import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contrasena son requeridos" },
        { status: 400 }
      )
    }

    const usernameLower = username.toLowerCase().trim()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", usernameLower)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: "Contrasena incorrecta" },
        { status: 401 }
      )
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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
