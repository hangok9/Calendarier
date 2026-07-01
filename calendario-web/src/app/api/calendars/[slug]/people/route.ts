import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch, notFound, conflict } from "@/lib/errors"
import { validate, addPersonSchema } from "@/lib/validate"
import { getManagerAccess } from "@/services/calendar.service"
import { sendInvitationEmail } from "@/lib/email"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar } = await getManagerAccess(slug, session)

    const { data: people } = await supabase
      .from("people")
      .select("id, name, alias, role, sort_order, user_id, users!inner(username)")
      .eq("calendar_id", calendar.id)
      .order("sort_order")

    const formatted = (people || []).map((p: { id: string; name: string; alias: string | null; role: string; sort_order: number; user_id: string; users: { username: string }[] }) => ({
      id: p.id,
      name: p.name,
      alias: p.alias,
      display_name: p.alias || p.name,
      role: p.role,
      sort_order: p.sort_order,
      username: p.users[0]?.username,
    }))

    return NextResponse.json(formatted)
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar, person } = await getManagerAccess(slug, session)

    const body = await request.json()
    const { username } = validate(addPersonSchema, body)
    const usernameLower = username.toLowerCase().trim()

    const [userResult, maxOrderResult] = await Promise.all([
      supabase.from("users").select("id, email").eq("username", usernameLower).maybeSingle(),
      supabase.from("people").select("sort_order").eq("calendar_id", calendar.id).order("sort_order", { ascending: false }).limit(1).maybeSingle(),
    ])

    const user = userResult.data
    if (!user) throw notFound("Usuario no encontrado. El usuario debe registrarse primero.")

    const { data: existingMember } = await supabase
      .from("people")
      .select("id")
      .eq("calendar_id", calendar.id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingMember) throw conflict("La persona ya pertenece a este calendario")

    const nextOrder = (maxOrderResult.data?.sort_order ?? -1) + 1

    const { data: newPerson, error: addError } = await supabase
      .from("people")
      .insert({
        calendar_id: calendar.id,
        name: usernameLower.toUpperCase(),
        sort_order: nextOrder,
        user_id: user.id,
        role: "member",
      })
      .select()
      .single()

    if (addError) throw new Error("Error al anadir persona")

    if (user.email) {
      const inviteLink = `${process.env.BASE_URL || "http://localhost:3000"}/calendario/${slug}`
      const invitedBy = person.name || session.username
      try {
        await sendInvitationEmail(user.email, calendar.name, invitedBy, inviteLink)
      } catch (e) {
        console.error("Invitation email error:", e)
      }
    }

    return NextResponse.json({
      success: true,
      person: {
        id: newPerson.id,
        name: newPerson.name,
        alias: null,
        display_name: newPerson.name,
        role: "member",
        username: usernameLower,
      },
    })
  })
}
