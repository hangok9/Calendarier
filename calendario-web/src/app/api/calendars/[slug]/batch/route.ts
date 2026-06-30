import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"

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

    const { person_id, code, start_date, end_date } = await request.json()

    if (!person_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: "person_id, start_date y end_date son requeridos" },
        { status: 400 }
      )
    }

    const start = new Date(start_date)
    const end = new Date(end_date)
    const dates: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0])
    }

    const inserts = dates.map((date) => ({
      calendar_id: session.calendar_id,
      person_id,
      date,
      code: code || null,
    }))

    const { error } = await supabase.from("availability").upsert(inserts, {
      onConflict: "person_id, date",
      ignoreDuplicates: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: dates.length })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
