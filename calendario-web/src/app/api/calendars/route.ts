import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession, requireSession } from "@/lib/auth"
import { tryCatch } from "@/lib/errors"
import { validate, createCalendarSchema } from "@/lib/validate"
import { generateUniqueSlug } from "@/services/calendar.service"

export async function GET() {
  return tryCatch(async () => {
    const session = await getSession()

    if (session) {
      const { data, error } = await supabase
        .from("calendars")
        .select(`
          id, slug, name, year, months,
          creator:created_by(username),
          people!left(calendar_id, role, alias, name)
        `)
        .eq("people.user_id", session.user_id)
        .order("name")

      if (error) throw error

      const enriched = (data as any[]).map((cal: any) => {
        const membership = cal.people?.[0]
          ? { role: cal.people[0].role, alias: cal.people[0].alias, name: cal.people[0].name }
          : null
        return {
          slug: cal.slug,
          name: cal.name,
          year: cal.year,
          months: cal.months,
          created_by: cal.creator?.[0]?.username,
          membership,
        }
      })

      return NextResponse.json(enriched)
    }

    const { data, error } = await supabase
      .from("calendars")
      .select("slug, name")
      .order("name")

    if (error) throw error
    return NextResponse.json(data)
  })
}

export async function POST(request: Request) {
  return tryCatch(async () => {
    const session = await requireSession()
    const body = await request.json()
    const { name, myName, year, months } = validate(createCalendarSchema, body)

    const slug = await generateUniqueSlug(name)
    const calYear = year || 2026
    const calMonths = months || [7, 8]

    const { data: calendar, error: calError } = await supabase
      .from("calendars")
      .insert({
        slug,
        name: name.trim(),
        year: calYear,
        months: calMonths,
        created_by: session.user_id,
      })
      .select()
      .single()

    if (calError || !calendar) throw calError ?? new Error("Error al crear el calendario")

    const displayName = myName.toUpperCase().trim()
    const { error: personError } = await supabase
      .from("people")
      .insert({
        calendar_id: calendar.id,
        name: displayName,
        sort_order: 0,
        user_id: session.user_id,
        role: "manager",
      })

    if (personError) {
      await supabase.from("calendars").delete().eq("id", calendar.id)
      throw new Error("Error al crear el calendario")
    }

    return NextResponse.json({
      success: true,
      calendar: {
        slug: calendar.slug,
        name: calendar.name,
        year: calendar.year,
        months: calendar.months,
      },
    })
  })
}
