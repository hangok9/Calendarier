import { supabase } from "@/lib/supabase"
import { unauthorized, forbidden, notFound } from "@/lib/errors"
import type { SessionPayload } from "@/types"

export interface CalendarAccess {
  session: SessionPayload
  calendar: {
    id: string
    slug: string
    name: string
    year: number
    months: number[]
    created_by: string
  }
  person: {
    id: string
    role: string
    name?: string
    user_id?: string
  }
}

export async function requireCalendarAccess(
  slug: string,
  session: SessionPayload | null,
  requireRole?: "manager" | "member"
): Promise<CalendarAccess> {
  if (!session) throw unauthorized()

  const [{ data: calendar }, { data: person }] = await Promise.all([
    supabase.from("calendars").select("id, slug, name, year, months, created_by").eq("slug", slug).maybeSingle(),
    supabase.from("people").select("id, role, name, user_id, calendars!inner()").eq("user_id", session.user_id).eq("calendars.slug", slug).maybeSingle(),
  ])

  if (!calendar) throw notFound("Calendario no encontrado")
  if (!person) throw forbidden("No eres miembro de este calendario")

  if (requireRole === "manager" && person.role !== "manager") {
    throw forbidden("Solo el gestor puede realizar esta accion")
  }

  return { session, calendar, person }
}

export async function getManagerAccess(slug: string, session: SessionPayload | null) {
  return requireCalendarAccess(slug, session, "manager")
}

export async function generateUniqueSlug(name: string): Promise<string> {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  if (!slug) slug = "calendario"

  const { data: existing } = await supabase
    .from("calendars")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle()

  if (existing) {
    slug = slug + "-" + Math.random().toString(36).substring(2, 6)
  }

  return slug
}

export function enrichPeople(people: any[]) {
  return people.map((p) => ({
    ...p,
    display_name: p.alias || p.name,
  }))
}

export function deduplicateCalendars(calendars: any[]) {
  return calendars.filter(
    (cal, i, arr) => arr.findIndex((c) => c.id === cal.id) === i
  )
}
