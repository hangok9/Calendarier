import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch, forbidden, badRequest } from "@/lib/errors"
import { validate, updateCalendarSchema } from "@/lib/validate"
import { requireCalendarAccess, enrichPeople } from "@/services/calendar.service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar, person } = await requireCalendarAccess(slug, session)

    const [{ data: people }, { data: availability }] = await Promise.all([
      supabase.from("people").select("*").eq("calendar_id", calendar.id).order("sort_order"),
      supabase.from("availability").select("*").eq("calendar_id", calendar.id),
    ])

    const enrichedPeople = enrichPeople(people || [])

    return NextResponse.json({
      calendar,
      people: enrichedPeople,
      availability,
      person_id: person.id,
      my_role: person.role,
    })
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar } = await requireCalendarAccess(slug, session)

    if (calendar.created_by !== session.user_id) {
      throw forbidden("Solo el creador del calendario puede eliminarlo")
    }

    const { error } = await supabase.from("calendars").delete().eq("id", calendar.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar } = await requireCalendarAccess(slug, session)

    if (calendar.created_by !== session.user_id) {
      throw forbidden("Solo el creador puede editar el calendario")
    }

    const body = await request.json()
    const { name, year, months } = validate(updateCalendarSchema, body)

    const updates: Record<string, string | number | number[]> = {}
    if (name) updates.name = name.trim()
    if (year) updates.year = year
    if (months) updates.months = months

    if (Object.keys(updates).length === 0) {
      throw badRequest("Nada que actualizar")
    }

    const { error } = await supabase.from("calendars").update(updates).eq("id", calendar.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  })
}
