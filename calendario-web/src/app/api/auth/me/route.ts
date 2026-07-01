import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch, badRequest } from "@/lib/errors"
import { validate, updateProfileSchema } from "@/lib/validate"

export async function GET() {
  return tryCatch(async () => {
    const session = await requireSession()

    const [{ data: user }, { data: memberships }] = await Promise.all([
      supabase.from("users").select("id, username, email").eq("id", session.user_id).single(),
      supabase.from("people").select("calendar_id, calendars!inner(id, slug, name)").eq("user_id", session.user_id).order("calendars(name)"),
    ])

    const calendars =
      (memberships as { calendar_id: string; calendars: { id: string; slug: string; name: string } }[] | null)?.map((m) => ({
        id: m.calendars.id,
        slug: m.calendars.slug,
        name: m.calendars.name,
      })) || []

    const uniqueCalendars = calendars.filter(
      (cal, i, arr) => arr.findIndex((c) => c.id === cal.id) === i
    )

    return NextResponse.json({
      session: { user_id: session.user_id, username: session.username },
      user,
      calendars: uniqueCalendars,
    })
  })
}

export async function PATCH(request: Request) {
  return tryCatch(async () => {
    const session = await requireSession()

    const { email } = validate(updateProfileSchema, await request.json())

    const updateData: Record<string, string | null> = {}
    if (email !== undefined) {
      updateData.email = email?.trim() || null
    }

    if (Object.keys(updateData).length === 0) {
      throw badRequest("Nada que actualizar")
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", session.user_id)

    if (updateError) {
      console.error("Update user error:", updateError)
      throw badRequest("Error al actualizar")
    }

    return NextResponse.json({ success: true, email: updateData.email })
  })
}
