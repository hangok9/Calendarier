import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug } = await params

    const { data: calendar } = await supabase
      .from("calendars")
      .select("id")
      .eq("slug", slug)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    const { data: person } = await supabase
      .from("people")
      .select("id")
      .eq("calendar_id", calendar.id)
      .eq("user_id", session.user_id)
      .maybeSingle()

    if (!person) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { person_id, date, code } = await request.json()

    if (!person_id || !date) {
      return NextResponse.json(
        { error: "person_id y date son requeridos" },
        { status: 400 }
      )
    }

    // Verify person_id belongs to this user
    if (person_id !== person.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { data: existing } = await supabase
      .from("availability")
      .select("id")
      .eq("person_id", person_id)
      .eq("date", date)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("availability")
        .update({ code: code || null, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await supabase.from("availability").insert({
        calendar_id: calendar.id,
        person_id,
        date,
        code: code || null,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
