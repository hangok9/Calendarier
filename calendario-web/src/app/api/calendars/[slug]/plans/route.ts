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

    const { data: plans, error } = await supabase
      .from("group_plans")
      .select(`
        *,
        creator:people!created_by(name),
        responses:plan_responses(*, person:people(name))
      `)
      .eq("calendar_id", session.calendar_id)
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
    const session = await requireSession()
    const { slug } = await params

    if (session.slug !== slug) {
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
        calendar_id: session.calendar_id,
        title,
        description: description || null,
        start_date,
        end_date,
        created_by: session.person_id,
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
