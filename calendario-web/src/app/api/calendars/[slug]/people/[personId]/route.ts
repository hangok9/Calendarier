import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; personId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug, personId } = await params

    const { data: calendar } = await supabase
      .from("calendars")
      .select("id")
      .eq("slug", slug)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    // Get target person
    const { data: targetPerson } = await supabase
      .from("people")
      .select("id, user_id, role")
      .eq("id", personId)
      .eq("calendar_id", calendar.id)
      .maybeSingle()

    if (!targetPerson) {
      return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 })
    }

    // Get current user's person entry
    const { data: currentPerson } = await supabase
      .from("people")
      .select("id, role")
      .eq("calendar_id", calendar.id)
      .eq("user_id", session.user_id)
      .maybeSingle()

    if (!currentPerson) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const isManager = currentPerson.role === "manager"
    const isSelf = targetPerson.id === currentPerson.id

    if (!isManager && !isSelf) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta persona" },
        { status: 403 }
      )
    }

    // Cannot remove the last manager
    if (targetPerson.role === "manager" && !isSelf) {
      return NextResponse.json(
        { error: "No puedes expulsar al gestor del calendario" },
        { status: 403 }
      )
    }

    // If removing self as manager, check if there's another manager
    if (isSelf && targetPerson.role === "manager") {
      const { data: otherManagers } = await supabase
        .from("people")
        .select("id")
        .eq("calendar_id", calendar.id)
        .eq("role", "manager")
        .neq("id", personId)

      if (!otherManagers || otherManagers.length === 0) {
        return NextResponse.json(
          { error: "Eres el unico gestor. Nombra a otro antes de irte." },
          { status: 400 }
        )
      }
    }

    const { error } = await supabase
      .from("people")
      .delete()
      .eq("id", personId)

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
  { params }: { params: Promise<{ slug: string; personId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { slug, personId } = await params
    const body = await request.json()

    const { data: calendar } = await supabase
      .from("calendars")
      .select("id")
      .eq("slug", slug)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: "Calendario no encontrado" }, { status: 404 })
    }

    const { data: targetPerson } = await supabase
      .from("people")
      .select("id, user_id, role")
      .eq("id", personId)
      .eq("calendar_id", calendar.id)
      .maybeSingle()

    if (!targetPerson) {
      return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 })
    }

    const { data: currentPerson } = await supabase
      .from("people")
      .select("id, role")
      .eq("calendar_id", calendar.id)
      .eq("user_id", session.user_id)
      .maybeSingle()

    if (!currentPerson) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const isManager = currentPerson.role === "manager"
    const isSelf = targetPerson.user_id === session.user_id

    const updates: Record<string, any> = {}

    // Alias: anyone can change their own alias
    if (body.alias !== undefined) {
      if (!isSelf) {
        return NextResponse.json(
          { error: "Solo puedes cambiar tu propio apodo" },
          { status: 403 }
        )
      }
      updates.alias = body.alias ? body.alias.trim() : null
    }

    // Role: only managers can change roles
    if (body.role !== undefined) {
      if (!isManager) {
        return NextResponse.json(
          { error: "Solo el gestor puede cambiar roles" },
          { status: 403 }
        )
      }
      if (!["manager", "member"].includes(body.role)) {
        return NextResponse.json({ error: "Rol invalido" }, { status: 400 })
      }
      updates.role = body.role
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nada que actualizar" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("people")
      .update(updates)
      .eq("id", personId)

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
