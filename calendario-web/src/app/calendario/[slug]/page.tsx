"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Nav from "@/components/Nav"
import SetupView from "@/components/SetupView"
import CalendarView from "@/components/CalendarView"
import ResumenView from "@/components/ResumenView"
import PlanesView from "@/components/PlanesView"
import EventosView from "@/components/EventosView"
import { SkeletonPage } from "@/components/Skeleton"
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
  const [personId, setPersonId] = useState<string | null>(null)
  const [myRole, setMyRole] = useState<string>("member")
  const [currentView, setCurrentView] = useState<ViewType>("calendario")
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/calendars/${slug}`).then((r) => r.json()),
    ])
      .then(([authData, calData]) => {
        if (authData.error || calData?.error) {
          router.push(`/`)
          return
        }
        setSession(authData.session)
        if (calData?.calendar) {
          setCalendar(calData.calendar)
          setPeople(calData.people || [])
          setAvailability(calData.availability || [])
          setPersonId(calData.person_id || null)
          setMyRole(calData.my_role || "member")
        }
      })
      .catch(() => router.push(`/`))
      .finally(() => setLoading(false))
  }, [slug, router])

  useEffect(() => { loadData() }, [loadData])

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }, [router])

  if (loading) {
    return <SkeletonPage />
  }

  if (!session || !calendar) return null

  const currentPerson = people.find((p) => p.id === personId)
  const personName = currentPerson?.display_name || currentPerson?.name || currentPerson?.alias || session.username

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
        personName={personName}
        onLogout={handleLogout}
      />

      <main id="main-content" style={{ maxWidth: "80rem", margin: "0 auto", padding: "5rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div className={`view ${currentView === "setup" ? "active" : ""}`}>
          <SetupView
            calendar={calendar}
            people={people}
            availability={availability}
            myRole={myRole}
            myPersonId={personId}
            session={session}
            onDataChange={loadData}
          />
        </div>

        <div className={`view ${currentView === "calendario" ? "active" : ""}`}>
          <CalendarView
            calendar={calendar}
            people={people}
            availability={availability}
            session={personId ? { ...session, person_id: personId } : session}
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
          <PlanesView calendar={calendar} session={personId ? { ...session, person_id: personId } : session} />
        </div>

        <div className={`view ${currentView === "eventos" ? "active" : ""}`}>
          <EventosView calendar={calendar} people={people} session={personId ? { ...session, person_id: personId } : session} />
        </div>
      </main>
    </>
  )
}
