import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: calendar } = await supabase
      .from("calendars")
      .select("id, slug, name, year, months")
      .eq("id", session.calendar_id)
      .single()

    const { data: person } = await supabase
      .from("people")
      .select("id, name")
      .eq("id", session.person_id)
      .single()

    return NextResponse.json({
      session: {
        calendar_id: session.calendar_id,
        person_id: session.person_id,
        slug: session.slug,
        name: session.name,
      },
      calendar,
      person,
    })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
