import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch } from "@/lib/errors"
import { validate, createPlanSchema } from "@/lib/validate"
import { requireCalendarAccess } from "@/services/calendar.service"
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar } = await requireCalendarAccess(slug, session)

    const { data: plans, error } = await supabase
      .from("group_plans")
      .select(`
        *,
        creator:people!created_by(name),
        responses:plan_responses(*, person:people(name))
      `)
      .eq("calendar_id", calendar.id)
      .order("start_date", { ascending: false })

    if (error) throw error

    type PlanRow = {
      id: string; calendar_id: string; title: string; description: string | null
      start_date: string; end_date: string; created_by: string; created_at: string
      creator: { name: string }[]
      responses: { id: string; plan_id: string; person_id: string; response: string; created_at: string; person: { name: string }[] }[] | null
    }

    const formatted = (plans as unknown as PlanRow[]).map((plan) => ({
      ...plan,
      creator_name: plan.creator?.[0]?.name,
      responses: plan.responses?.map((r) => ({
        ...r,
        person_name: r.person?.[0]?.name,
      })),
    }))

    return NextResponse.json(formatted)
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar, person } = await requireCalendarAccess(slug, session)

    const body = await request.json()
    const { title, description, start_date, end_date } = validate(createPlanSchema, body)

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

    if (error) throw error
    return NextResponse.json({ success: true, plan: data })
  })
}
