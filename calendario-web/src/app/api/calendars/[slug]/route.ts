import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug } = await params

    const { data: calendar, error: calError } = await supabase
      .from("calendars")
      .select("*")
      .eq("slug", slug)
      .single()

    if (calError || !calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    const { data: people } = await supabase
      .from("people")
      .select("*")
      .eq("calendar_id", calendar.id)
      .order("sort_order")

    const { data: availability } = await supabase
      .from("availability")
      .select("*")
      .eq("calendar_id", calendar.id)

    // Find current user's person entry in this calendar
    const currentPerson = people?.find((p) => p.user_id === session.user_id)

    if (!currentPerson) {
      return NextResponse.json(
        { error: "No eres miembro de este calendario" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      calendar,
      people,
      availability,
      person_id: currentPerson.id,
    })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
