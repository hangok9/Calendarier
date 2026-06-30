import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, username, email")
      .eq("id", session.user_id)
      .single()

    // Get user's calendars via people
    const { data: memberships } = await supabase
      .from("people")
      .select("calendar_id, calendars!inner(id, slug, name)")
      .eq("user_id", session.user_id)
      .order("calendars(name)")

    const calendars = memberships?.map((m: any) => ({
      id: m.calendars.id,
      slug: m.calendars.slug,
      name: m.calendars.name,
    })) || []

    // Deduplicate calendars (user might be in same calendar with multiple entries)
    const uniqueCalendars = calendars.filter(
      (cal, i, arr) => arr.findIndex((c) => c.id === cal.id) === i
    )

    return NextResponse.json({
      session: {
        user_id: session.user_id,
        username: session.username,
      },
      user,
      calendars: uniqueCalendars,
    })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { email } = await request.json()

    if (email !== undefined && typeof email !== "string") {
      return NextResponse.json({ error: "Email invalido" }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    if (email !== undefined) {
      updateData.email = email.trim() || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", session.user_id)

    if (updateError) {
      console.error("Update user error:", updateError)
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
    }

    return NextResponse.json({ success: true, email: updateData.email })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
