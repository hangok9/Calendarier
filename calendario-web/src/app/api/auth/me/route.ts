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
