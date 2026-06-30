"use client"

import { useState, useMemo, useEffect } from "react"
import GridView from "./GridView"
import TableView from "./TableView"
import BatchModal from "./BatchModal"
import { MONTH_NAMES } from "@/lib/constants"
import type { Calendar, Person, Availability } from "@/types"

export default function CalendarView({
  calendar,
  people,
  availability,
  session,
  onAvailabilityChange,
}: {
  calendar: Calendar
  people: Person[]
  availability: Availability[]
  session: any
  onAvailabilityChange: (a: Availability[]) => void
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [tab, setTab] = useState<"grid" | "table">("grid")
  const [showBatch, setShowBatch] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    if (mq.matches) setTab("table")
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches) setTab("table")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const totalDays = useMemo(
    () =>
      calendar.months.reduce((sum, m) => {
        return sum + new Date(calendar.year, m, 0).getDate()
      }, 0),
    [calendar]
  )

  const monthRange = calendar.months
    .map((m) => MONTH_NAMES[m])
    .join(" - ")

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        {/* Top bar */}
        <div
          className="stagger"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <div>
              <div className="pill" style={{ marginBottom: "0.375rem" }}>
                {monthRange} {calendar.year} · {totalDays} dias
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.5rem,3vw,2.25rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                {calendar.name}
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  marginTop: "0.125rem",
                }}
              >
                {people.length} personas registradas
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-primary"
                style={{ fontSize: "0.8125rem" }}
                onClick={() => setShowBatch(true)}
              >
                Marcar rango
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar stagger" style={{ marginBottom: "1.25rem" }}>
          {!isMobile && (
            <button
              className={`tab-btn-style ${tab === "grid" ? "active" : ""}`}
              onClick={() => setTab("grid")}
            >
              Cuadricula
            </button>
          )}
          <button
            className={`tab-btn-style ${tab === "table" ? "active" : ""}`}
            onClick={() => setTab("table")}
          >
            {isMobile ? "Vista diaria" : "Tabla diaria"}
          </button>
        </div>

        {tab === "grid" && (
          <GridView
            calendar={calendar}
            people={people}
            availability={availability}
            session={session}
            onAvailabilityChange={onAvailabilityChange}
          />
        )}

        {tab === "table" && (
          <TableView
            calendar={calendar}
            people={people}
            availability={availability}
            session={session}
            onAvailabilityChange={onAvailabilityChange}
          />
        )}
      </div>

      {showBatch && (
        <BatchModal
          calendar={calendar}
          people={people}
          session={session}
          onClose={() => setShowBatch(false)}
          onComplete={() => {
            setShowBatch(false)
            fetch(`/api/calendars/${calendar.slug}`)
              .then((r) => r.json())
              .then((data) => {
                if (data.availability) onAvailabilityChange(data.availability)
              })
          }}
        />
      )}
    </>
  )
}
