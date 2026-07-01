import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch, forbidden, notFound, badRequest } from "@/lib/errors"
import { validate, updatePersonSchema } from "@/lib/validate"
import { requireCalendarAccess } from "@/services/calendar.service"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; personId: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug, personId } = await params

    const { calendar, person: currentPerson } = await requireCalendarAccess(slug, session)

    const { data: targetPerson } = await supabase
      .from("people")
      .select("id, user_id, role")
      .eq("id", personId)
      .eq("calendar_id", calendar.id)
      .maybeSingle()

    if (!targetPerson) throw notFound("Persona no encontrada")

    const isManager = currentPerson.role === "manager"
    const isSelf = targetPerson.id === currentPerson.id

    if (!isManager && !isSelf) {
      throw forbidden("No tienes permiso para eliminar esta persona")
    }

    if (targetPerson.role === "manager" && !isSelf) {
      throw forbidden("No puedes expulsar al gestor del calendario")
    }

    if (isSelf && targetPerson.role === "manager") {
      const { data: otherManagers } = await supabase
        .from("people")
        .select("id")
        .eq("calendar_id", calendar.id)
        .eq("role", "manager")
        .neq("id", personId)

      if (!otherManagers || otherManagers.length === 0) {
        throw badRequest("Eres el unico gestor. Nombra a otro antes de irte.")
      }
    }

    const { error } = await supabase.from("people").delete().eq("id", personId)

    if (error) throw error
    return NextResponse.json({ success: true })
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; personId: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug, personId } = await params

    const { calendar, person: currentPerson } = await requireCalendarAccess(slug, session)

    const body = await request.json()
    const { alias, role } = validate(updatePersonSchema, body)

    const { data: targetPerson } = await supabase
      .from("people")
      .select("id, user_id, role")
      .eq("id", personId)
      .eq("calendar_id", calendar.id)
      .maybeSingle()

    if (!targetPerson) throw notFound("Persona no encontrada")

    const isManager = currentPerson.role === "manager"
    const isSelf = targetPerson.user_id === session.user_id

    const updates: Record<string, string | null> = {}

    if (alias !== undefined) {
      if (!isSelf) throw forbidden("Solo puedes cambiar tu propio apodo")
      updates.alias = alias ? alias.trim() : null
    }

    if (role !== undefined) {
      if (!isManager) throw forbidden("Solo el gestor puede cambiar roles")
      if (!["manager", "member"].includes(role)) throw badRequest("Rol invalido")
      updates.role = role
    }

    if (Object.keys(updates).length === 0) {
      throw badRequest("Nada que actualizar")
    }

    const { error } = await supabase.from("people").update(updates).eq("id", personId)

    if (error) throw error
    return NextResponse.json({ success: true })
  })
}
