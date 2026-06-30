import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; planId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug, planId } = await params

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

    const { response } = await request.json()

    if (!response || !["accept", "decline", "maybe"].includes(response)) {
      return NextResponse.json(
        { error: "response debe ser accept, decline o maybe" },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from("plan_responses")
      .select("id")
      .eq("plan_id", planId)
      .eq("person_id", person.id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("plan_responses")
        .update({ response })
        .eq("id", existing.id)
    } else {
      await supabase.from("plan_responses").insert({
        plan_id: planId,
        person_id: person.id,
        response,
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
