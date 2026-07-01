import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "username y password requeridos" }, { status: 400 })
    }

    const usernameLower = username.toLowerCase().trim()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", usernameLower)
      .single()

    if (userError) {
      return NextResponse.json({
        error: "Error al buscar usuario",
        details: userError,
      })
    }

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" })
    }

    const storedHash = user.password
    const hashPrefix = storedHash.substring(0, 7)
    const hashLength = storedHash.length
    const compareResult = await bcrypt.compare(password, storedHash)
    const newHash = await bcrypt.hash(password, 10)

    return NextResponse.json({
      found: true,
      username: user.username,
      hash_info: {
        prefix: hashPrefix,
        length: hashLength,
        full_hash: storedHash,
      },
      compare_result: compareResult,
      new_hash_for_same_password: newHash,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
