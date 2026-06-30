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

    const { data: plans, error } = await supabase
      .from("group_plans")
      .select(`
        *,
        creator:people!created_by(name),
        responses:plan_responses(*, person:people(name))
      `)
      .eq("calendar_id", calendar.id)
      .order("start_date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = plans.map((plan: any) => ({
      ...plan,
      creator_name: plan.creator?.name,
      responses: plan.responses?.map((r: any) => ({
        ...r,
        person_name: r.person?.name,
      })),
    }))

    return NextResponse.json(formatted)
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

    const { title, description, start_date, end_date } = await request.json()

    if (!title || !start_date || !end_date) {
      return NextResponse.json(
        { error: "title, start_date y end_date son requeridos" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("group_plans")
      .insert({
        calendar_id: calendar.id,
        title,
        description: description || null,
        start_date,
        end_date,
        created_by: person.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan: data })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
