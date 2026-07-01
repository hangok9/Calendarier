import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch } from "@/lib/errors"
import { validate, createEventSchema } from "@/lib/validate"
import { requireCalendarAccess } from "@/services/calendar.service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    const { calendar } = await requireCalendarAccess(slug, session)

    let query = supabase
      .from("custom_events")
      .select("*, people!inner(name)")
      .eq("calendar_id", calendar.id)

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query.order("date").order("start_time")

    if (error) throw error
    return NextResponse.json(data)
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar } = await requireCalendarAccess(slug, session)

    const body = await request.json()
    const { person_id, date, start_time, end_time, label, code } = validate(createEventSchema, body)

    const { data, error } = await supabase
      .from("custom_events")
      .insert({
        calendar_id: calendar.id,
        person_id,
        date,
        start_time: start_time || null,
        end_time: end_time || null,
        label: label || null,
        code: code || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, event: data })
  })
}
