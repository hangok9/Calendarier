import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireSession()
    const { slug } = await params

    if (session.slug !== slug) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

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

    return NextResponse.json({ calendar, people, availability })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
