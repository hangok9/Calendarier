export interface Calendar {
  id: string
  slug: string
  name: string
  year: number
  months: number[]
  created_at: string
}

export interface Person {
  id: string
  calendar_id: string
  name: string
  primer_apellido?: string | null
  segundo_apellido?: string | null
  sort_order: number
  display_name?: string
  role?: string
  alias?: string
}

export interface User {
  id: string
  username: string
  email: string | null
  created_at: string
}

export interface Availability {
  id: string
  calendar_id: string
  person_id: string
  date: string
  code: string | null
  updated_at: string
}

export interface CustomEvent {
  id: string
  calendar_id: string
  person_id: string
  date: string
  start_time: string | null
  end_time: string | null
  label: string | null
  code: string | null
  created_at: string
}

export interface GroupPlan {
  id: string
  calendar_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  created_by: string
  created_at: string
  creator_name?: string
  responses?: PlanResponse[]
}

export interface PlanResponse {
  id: string
  plan_id: string
  person_id: string
  response: "accept" | "decline" | "maybe"
  created_at: string
  person_name?: string
}

export interface CalendarData {
  calendar: Calendar
  people: Person[]
  availability: Availability[]
}

export interface SessionPayload {
  user_id: string
  username: string
}

export type ViewType = "setup" | "calendario" | "resumen" | "planes" | "eventos"
