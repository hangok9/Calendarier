import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch, forbidden, badRequest } from "@/lib/errors"
import { validate, batchAvailabilitySchema } from "@/lib/validate"
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
    const { person_id, code, start_date, end_date } = validate(batchAvailabilitySchema, body)

    if (person_id !== person.id) throw forbidden("No autorizado")

    const start = new Date(start_date)
    const end = new Date(end_date)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const MAX_BATCH_DAYS = 93

    if (totalDays > MAX_BATCH_DAYS) {
      throw badRequest(`Maximo ${MAX_BATCH_DAYS} dias por operacion`)
    }

    const dates: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0])
    }

    const inserts = dates.map((date) => ({
      calendar_id: calendar.id,
      person_id,
      date,
      code: code || null,
    }))

    const { error } = await supabase.from("availability").upsert(inserts, {
      onConflict: "person_id, date",
      ignoreDuplicates: false,
    })

    if (error) throw error
    return NextResponse.json({ success: true, updated: dates.length })
  })
}
