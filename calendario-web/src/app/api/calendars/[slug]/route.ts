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

    const { data: calendar, error: calError } = await supabase
      .from("calendars")
      .select("*")
      .eq("slug", slug)
      .single()

    if (calError || !calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    const { data: people } = await supabase
      .from("people")
      .select("*")
      .eq("calendar_id", calendar.id)
      .order("sort_order")

    const { data: availability } = await supabase
      .from("availability")
      .select("*")
      .eq("calendar_id", calendar.id)

    // Find current user's person entry in this calendar
    const currentPerson = people?.find((p) => p.user_id === session.user_id)

    if (!currentPerson) {
      return NextResponse.json(
        { error: "No eres miembro de este calendario" },
        { status: 403 }
      )
    }

    // Enrich people with display name (alias || name)
    const enrichedPeople = people?.map((p) => ({
      ...p,
      display_name: p.alias || p.name,
    }))

    return NextResponse.json({
      calendar,
      people: enrichedPeople,
      availability,
      person_id: currentPerson.id,
      my_role: currentPerson.role,
    })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(
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
      .select("id, created_by")
      .eq("slug", slug)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    if (calendar.created_by !== session.user_id) {
      return NextResponse.json(
        { error: "Solo el creador del calendario puede eliminarlo" },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("calendars")
      .delete()
      .eq("id", calendar.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()

    const { data: calendar } = await supabase
      .from("calendars")
      .select("id, created_by")
      .eq("slug", slug)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    if (calendar.created_by !== session.user_id) {
      return NextResponse.json(
        { error: "Solo el creador puede editar el calendario" },
        { status: 403 }
      )
    }

    const updates: Record<string, any> = {}
    if (body.name) updates.name = body.name.trim()
    if (body.year) updates.year = body.year
    if (body.months) updates.months = body.months

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nada que actualizar" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("calendars")
      .update(updates)
      .eq("id", calendar.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
