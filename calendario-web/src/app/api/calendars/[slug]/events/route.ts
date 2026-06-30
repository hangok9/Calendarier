import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireSession()
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (session.slug !== slug) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    let query = supabase
      .from("custom_events")
      .select("*, people!inner(name)")
      .eq("calendar_id", session.calendar_id)

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
    const session = await requireSession()
    const { slug } = await params

    if (session.slug !== slug) {
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
        calendar_id: session.calendar_id,
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
