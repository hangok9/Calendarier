import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (session) {
      // Logged in: return public info + user's membership info
      const { data, error } = await supabase
        .from("calendars")
        .select(`
          id, slug, name, year, months,
          creator:created_by(username)
        `)
        .order("name")

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Get user's role in each calendar
      const { data: memberships } = await supabase
        .from("people")
        .select("calendar_id, role, alias, name")
        .eq("user_id", session.user_id)

      const membershipsMap = new Map()
      memberships?.forEach((m: any) => {
        membershipsMap.set(m.calendar_id, {
          role: m.role,
          alias: m.alias,
          name: m.name,
        })
      })

      const enriched = data.map((cal: any) => {
        const membership = membershipsMap.get(cal.id)
        return {
          slug: cal.slug,
          name: cal.name,
          year: cal.year,
          months: cal.months,
          created_by: cal.creator?.username,
          membership: membership || null,
        }
      })

      return NextResponse.json(enriched)
    }

    // Not logged in: public list only
    const { data, error } = await supabase
      .from("calendars")
      .select("slug, name")
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, year, months, myName } = await request.json()

    if (!name || !myName) {
      return NextResponse.json(
        { error: "Nombre del calendario y tu nombre son requeridos" },
        { status: 400 }
      )
    }

    // Generate slug
    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    if (!slug) {
      return NextResponse.json({ error: "Nombre de calendario invalido" }, { status: 400 })
    }

    // Ensure uniqueness
    const { data: existing } = await supabase
      .from("calendars")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      slug = slug + "-" + Math.random().toString(36).substring(2, 6)
    }

    const calYear = year || 2026
    const calMonths = months || [7, 8]

    // Create calendar
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

    if (calError || !calendar) {
      return NextResponse.json(
        { error: "Error al crear el calendario" },
        { status: 500 }
      )
    }

    // Add creator as manager
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
      // Rollback: delete calendar if person insert fails
      await supabase.from("calendars").delete().eq("id", calendar.id)
      return NextResponse.json(
        { error: "Error al crear el calendario" },
        { status: 500 }
      )
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
  } catch (error) {
    console.error("Create calendar error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
