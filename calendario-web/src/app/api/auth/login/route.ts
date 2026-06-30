import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { slug, name, password } = await request.json()

    if (!slug || !name || !password) {
      return NextResponse.json(
        { error: "slug, name y password son requeridos" },
        { status: 400 }
      )
    }

    const nameUpper = name.toUpperCase().trim()
    const slugLower = slug.toLowerCase().trim()

    const { data: calendar, error: calError } = await supabase
      .from("calendars")
      .select("*")
      .eq("slug", slugLower)
      .single()

    if (calError || !calendar) {
      return NextResponse.json(
        { error: "Calendario no encontrado" },
        { status: 404 }
      )
    }

    const valid = await bcrypt.compare(password, calendar.password)
    if (!valid) {
      return NextResponse.json(
        { error: "Contrasena incorrecta" },
        { status: 401 }
      )
    }

    const { data: person } = await supabase
      .from("people")
      .select("*")
      .eq("calendar_id", calendar.id)
      .eq("name", nameUpper)
      .maybeSingle()

    if (!person) {
      return NextResponse.json(
        { error: "Persona no encontrada en este calendario" },
        { status: 404 }
      )
    }

    await createSession({
      calendar_id: calendar.id,
      person_id: person.id,
      slug: calendar.slug,
      name: person.name,
    })

    return NextResponse.json({
      success: true,
      person: { id: person.id, name: person.name },
      calendar: { id: calendar.id, slug: calendar.slug, name: calendar.name },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
