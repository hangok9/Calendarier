import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch, forbidden } from "@/lib/errors"
import { validate, availabilitySchema } from "@/lib/validate"
import { requireCalendarAccess } from "@/services/calendar.service"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar, person } = await requireCalendarAccess(slug, session)

    const body = await request.json()
    const { person_id, date, code } = validate(availabilitySchema, body)

    if (person_id !== person.id) throw forbidden("No autorizado")

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
        calendar_id: calendar.id,
        person_id,
        date,
        code: code || null,
      })
    }

    return NextResponse.json({ success: true })
  })
}
