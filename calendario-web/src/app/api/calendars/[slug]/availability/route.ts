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

    const { person_id, date, code } = await request.json()

    if (!person_id || !date) {
      return NextResponse.json(
        { error: "person_id y date son requeridos" },
        { status: 400 }
      )
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
        calendar_id: session.calendar_id,
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
