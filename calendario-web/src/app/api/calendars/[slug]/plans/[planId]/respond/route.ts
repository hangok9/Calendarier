import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch } from "@/lib/errors"
import { validate, respondPlanSchema } from "@/lib/validate"
import { requireCalendarAccess } from "@/services/calendar.service"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; planId: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug, planId } = await params

    const { person } = await requireCalendarAccess(slug, session)

    const body = await request.json()
    const { response } = validate(respondPlanSchema, body)

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
  })
}
