import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

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

    let query = supabase
      .from("custom_events")
      .select("*, people!inner(name)")
      .eq("calendar_id", calendar.id)

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query.order("date").order("start_time")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

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

    const { person_id, date, start_time, end_time, label, code } =
      await request.json()

    if (!person_id || !date) {
      return NextResponse.json(
        { error: "person_id y date son requeridos" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("custom_events")
      .insert({
        calendar_id: calendar.id,
        person_id,
        date,
        start_time: start_time || null,
        end_time: end_time || null,
        label: label || null,
        code: code || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, event: data })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
