import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug, id } = await params

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

    const { error } = await supabase
      .from("custom_events")
      .delete()
      .eq("id", id)
      .eq("calendar_id", calendar.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
