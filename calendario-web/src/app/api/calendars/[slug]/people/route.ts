import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"
import { sendInvitationEmail } from "@/lib/email"

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

    const { data: calendar } = await supabase
      .from("calendars")
      .select("id")
      .eq("slug", slug)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    const { data: person } = await supabase
      .from("people")
      .select("id, role")
      .eq("calendar_id", calendar.id)
      .eq("user_id", session.user_id)
      .maybeSingle()

    if (!person || person.role !== "manager") {
      return NextResponse.json(
        { error: "Solo el gestor del calendario puede ver los miembros" },
        { status: 403 }
      )
    }

    const { data: people } = await supabase
      .from("people")
      .select("id, name, alias, role, sort_order, user_id, users!inner(username)")
      .eq("calendar_id", calendar.id)
      .order("sort_order")

    const formatted = people?.map((p: any) => ({
      id: p.id,
      name: p.name,
      alias: p.alias,
      display_name: p.alias || p.name,
      role: p.role,
      sort_order: p.sort_order,
      username: p.users?.username,
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug } = await params
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: "Nombre de usuario requerido" },
        { status: 400 }
      )
    }

    const { data: calendar } = await supabase
      .from("calendars")
      .select("id, name")
      .eq("slug", slug)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    const { data: currentPerson } = await supabase
      .from("people")
      .select("id, role, name")
      .eq("calendar_id", calendar.id)
      .eq("user_id", session.user_id)
      .maybeSingle()

    if (!currentPerson || currentPerson.role !== "manager") {
      return NextResponse.json(
        { error: "Solo el gestor puede anadir personas" },
        { status: 403 }
      )
    }

    // Look up user by username
    const usernameLower = username.toLowerCase().trim()
    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("username", usernameLower)
      .maybeSingle()

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado. El usuario debe registrarse primero." },
        { status: 404 }
      )
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("people")
      .select("id")
      .eq("calendar_id", calendar.id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json(
        { error: "La persona ya pertenece a este calendario" },
        { status: 409 }
      )
    }

    // Get current max sort_order
    const { data: maxOrder } = await supabase
      .from("people")
      .select("sort_order")
      .eq("calendar_id", calendar.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.sort_order ?? -1) + 1

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

    if (addError) {
      return NextResponse.json({ error: "Error al anadir persona" }, { status: 500 })
    }

    // Send invitation email
    if (user.email) {
      const inviteLink = `${process.env.BASE_URL || "http://localhost:3000"}/calendario/${slug}`
      const invitedBy = currentPerson.name || session.username
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
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
