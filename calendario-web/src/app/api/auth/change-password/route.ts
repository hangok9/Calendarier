import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { oldPassword, newPassword, confirmPassword } = await request.json()

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contrasenas nuevas no coinciden" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contrasena debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password")
      .eq("id", session.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: "La contrasena actual no es correcta" },
        { status: 401 }
      )
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: newHash })
      .eq("id", session.user_id)

    if (updateError) {
      console.error("Update password error:", updateError)
      return NextResponse.json(
        { error: "Error al actualizar la contrasena" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
