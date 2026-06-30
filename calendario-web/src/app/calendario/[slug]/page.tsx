"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Nav from "@/components/Nav"
import SetupView from "@/components/SetupView"
import CalendarView from "@/components/CalendarView"
import ResumenView from "@/components/ResumenView"
import PlanesView from "@/components/PlanesView"
import EventosView from "@/components/EventosView"
import type { Calendar, Person, Availability } from "@/types"

type ViewType = "setup" | "calendario" | "resumen" | "planes" | "eventos"

export default function CalendarPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params.slug

  const [session, setSession] = useState<any>(null)
  const [calendar, setCalendar] = useState<Calendar | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [currentView, setCurrentView] = useState<ViewType>("calendario")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push(`/login?slug=${slug}`)
          return
        }
        setSession(data.session)
        return fetch(`/api/calendars/${slug}`)
      })
      .then((r) => r?.json())
      .then((data) => {
        if (data?.calendar) {
          setCalendar(data.calendar)
          setPeople(data.people || [])
          setAvailability(data.availability || [])
        }
      })
      .catch(() => router.push(`/login?slug=${slug}`))
      .finally(() => setLoading(false))
  }, [slug, router])

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }, [router])

  if (loading) {
    return (
      <main style={{ maxWidth: "80rem", margin: "0 auto", padding: "6rem 1.5rem 2rem" }}>
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          Cargando...
        </div>
      </main>
    )
  }

  if (!session || !calendar) return null

  const totalDays = calendar.months.reduce((sum, m) => {
    return sum + new Date(calendar.year, m, 0).getDate()
  }, 0)

  return (
    <>
      <div className="bg-pattern" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <Nav
        currentView={currentView}
        onNavigate={setCurrentView}
        calendarName={calendar.name}
        personName={session.name}
        onLogout={handleLogout}
      />

      <main style={{ maxWidth: "80rem", margin: "0 auto", padding: "5rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div className={`view ${currentView === "setup" ? "active" : ""}`}>
          <SetupView calendar={calendar} people={people} />
        </div>

        <div className={`view ${currentView === "calendario" ? "active" : ""}`}>
          <CalendarView
            calendar={calendar}
            people={people}
            availability={availability}
            session={session}
            onAvailabilityChange={(newAvail) => setAvailability(newAvail)}
          />
        </div>

        <div className={`view ${currentView === "resumen" ? "active" : ""}`}>
          <ResumenView
            calendar={calendar}
            people={people}
            availability={availability}
            totalDays={totalDays}
          />
        </div>

        <div className={`view ${currentView === "planes" ? "active" : ""}`}>
          <PlanesView calendar={calendar} session={session} />
        </div>

        <div className={`view ${currentView === "eventos" ? "active" : ""}`}>
          <EventosView calendar={calendar} people={people} session={session} />
        </div>
      </main>
    </>
  )
}
