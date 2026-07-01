"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { DAY_NAMES, MONTH_NAMES, CODES, CODE_COLORS } from "@/lib/constants"
import { computeInitialsMap } from "@/lib/initials"
import { useAvailMap, getCode } from "@/hooks/useAvailMap"
import type { Calendar, Person, Availability } from "@/types"

function nextCode(current: string | null): string | null {
  const codes = ["", ...CODES]
  const idx = codes.indexOf(current || "")
  return codes[(idx + 1) % codes.length] || null
}

interface WeekDay {
  day: number
  date: Date
  isPadding: boolean
}

function getWeeksForMonth(year: number, month: number): WeekDay[][] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  const weeks: WeekDay[][] = []
  let week: WeekDay[] = []

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month - 1, 1 - startOffset + i)
    week.push({ day: 0, date: d, isPadding: true })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d)
    week.push({ day: d, date, isPadding: false })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ day: 0, date: new Date(0), isPadding: true })
    }
    weeks.push(week)
  }

  return weeks
}

function fmtDate(d: Date): string {
  if (d.getTime() === 0) return ""
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth() + 1].slice(0, 3)}`
}

export default function WeekView({
  calendar,
  people,
  availability,
  session: _session,
  onAvailabilityChange,
}: {
  calendar: Calendar
  people: Person[]
  availability: Availability[]
  session: any
  onAvailabilityChange: (a: Availability[]) => void
}) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [weekIndex, setWeekIndex] = useState(0)
  const currentMonthIndex = monthOffset
  const currentMonth = calendar.months[currentMonthIndex]
  const dragRef = useRef<{ personId: string; code: string | null; cells: Set<string> } | null>(null)
  const didDrag = useRef(false)
  const availMap = useAvailMap(availability)

  const weeks = useMemo(() => {
    if (!currentMonth) return []
    return getWeeksForMonth(calendar.year, currentMonth)
  }, [currentMonth, calendar.year])

  useEffect(() => {
    setWeekIndex(0)
  }, [currentMonth])

  const initialsMap = useMemo(() => computeInitialsMap(people), [people])
  const currentWeek = weeks[weekIndex] || weeks[0]
  const hasPrevWeek = weekIndex > 0 || currentMonthIndex > 0
  const hasNextWeek = weekIndex < weeks.length - 1 || currentMonthIndex < calendar.months.length - 1

  const realDays = currentWeek?.filter((c) => !c.isPadding) || []
  const weekLabel =
    realDays.length > 0
      ? `${fmtDate(realDays[0].date)} - ${fmtDate(realDays[realDays.length - 1].date)}`
      : ""

  async function handleCellClick(personId: string, date: Date, currentCode: string | null) {
    const dateStr = date.toISOString().split("T")[0]
    const code = nextCode(currentCode)

    // Optimistic update
    const optimisticEntry: Availability = {
      id: `opt-${personId}-${dateStr}`,
      calendar_id: calendar.id,
      person_id: personId,
      date: dateStr,
      code,
      updated_at: new Date().toISOString(),
    }
    const idx = availability.findIndex((a) => a.person_id === personId && a.date === dateStr)
    const updated = idx >= 0
      ? [...availability.slice(0, idx), optimisticEntry, ...availability.slice(idx + 1)]
      : [...availability, optimisticEntry]
    onAvailabilityChange(updated)

    await fetch(`/api/calendars/${calendar.slug}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: personId, date: dateStr, code }),
    })
  }

  async function applyBatch(personId: string, code: string | null, dateStrs: string[]) {
    if (dateStrs.length === 0) return
    if (dateStrs.length === 1) {
      await fetch(`/api/calendars/${calendar.slug}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_id: personId, date: dateStrs[0], code }),
      })
    } else {
      await fetch(`/api/calendars/${calendar.slug}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: personId,
          code,
          start_date: dateStrs[0],
          end_date: dateStrs[dateStrs.length - 1],
        }),
      })
    }
    // Full reload for batch operations
    const r = await fetch(`/api/calendars/${calendar.slug}`)
    const data = await r.json()
    if (data.availability) onAvailabilityChange(data.availability)
  }

  function handlePointerDown(personId: string, date: Date, currentCode: string | null) {
    const code = nextCode(currentCode)
    const dateStr = date.toISOString().split("T")[0]
    dragRef.current = { personId, code, cells: new Set([dateStr]) }
  }

  function handlePointerEnter(personId: string, date: Date) {
    if (!dragRef.current || dragRef.current.personId !== personId) return
    const dateStr = date.toISOString().split("T")[0]
    dragRef.current.cells.add(dateStr)
  }

  async function handlePointerUp() {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (drag.cells.size > 1) {
      didDrag.current = true
      const sortedDates = Array.from(drag.cells).sort()
      await applyBatch(drag.personId, drag.code, sortedDates)
    }
  }

  function goPrevWeek() {
    if (weekIndex > 0) {
      setWeekIndex((i) => i - 1)
    } else if (currentMonthIndex > 0) {
      const newMonthIdx = currentMonthIndex - 1
      const prevMonth = calendar.months[newMonthIdx]
      const prevWeeks = getWeeksForMonth(calendar.year, prevMonth)
      setMonthOffset(newMonthIdx)
      setWeekIndex(prevWeeks.length - 1)
    }
  }

  function goNextWeek() {
    if (weekIndex < weeks.length - 1) {
      setWeekIndex((i) => i + 1)
    } else if (currentMonthIndex < calendar.months.length - 1) {
      const newMonthIdx = currentMonthIndex + 1
      setMonthOffset(newMonthIdx)
      setWeekIndex(0)
    }
  }

  if (!currentMonth || !currentWeek) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        No hay datos
      </div>
    )
  }

  return (
    <div
      className="surface-elevated stagger"
      style={{ padding: "1rem" }}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Month nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <button
          className="btn-ghost"
          style={{
            padding: "0.375rem 0.625rem",
            fontSize: "0.8125rem",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)",
            visibility: currentMonthIndex > 0 ? "visible" : "hidden",
            minHeight: "44px",
          }}
          onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
          aria-label="Mes anterior"
        >
          ← Mes
        </button>
        <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
          {MONTH_NAMES[currentMonth]} {calendar.year}
        </span>
        <button
          className="btn-ghost"
          style={{
            padding: "0.375rem 0.625rem",
            fontSize: "0.8125rem",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)",
            visibility: currentMonthIndex < calendar.months.length - 1 ? "visible" : "hidden",
            minHeight: "44px",
          }}
          onClick={() => setMonthOffset((o) => Math.min(calendar.months.length - 1, o + 1))}
          aria-label="Mes siguiente"
        >
          Mes →
        </button>
      </div>

      {/* Week nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <button
          className="btn-ghost"
          style={{
            padding: "0.375rem 0.625rem",
            fontSize: "0.75rem",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)",
            minHeight: "44px",
            visibility: hasPrevWeek ? "visible" : "hidden",
          }}
          onClick={goPrevWeek}
          aria-label="Semana anterior"
        >
          ← Semana
        </button>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
          {weekLabel}
        </span>
        <button
          className="btn-ghost"
          style={{
            padding: "0.375rem 0.625rem",
            fontSize: "0.75rem",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)",
            minHeight: "44px",
            visibility: hasNextWeek ? "visible" : "hidden",
          }}
          onClick={goNextWeek}
          aria-label="Semana siguiente"
        >
          Semana →
        </button>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "1px",
          marginBottom: "1px",
        }}
      >
        {DAY_NAMES.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: "0.5625rem",
              fontWeight: 600,
              padding: "0.25rem 0",
              color: i >= 5 ? "#EF4444" : "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "1px" }}>
        {currentWeek.map((cell, ci) => {
          if (cell.isPadding) {
            return (
              <div
                key={ci}
                style={{
                  minHeight: "4.5rem",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius)",
                  opacity: 0.1,
                }}
              />
            )
          }

          const isWeekend = ci >= 5
          const dateStr = cell.date.toISOString().split("T")[0]

          return (
            <div
              key={ci}
              style={{
                minHeight: "4.5rem",
                padding: "0.25rem",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius)",
                background: isWeekend ? "var(--bg)" : "var(--bg-surface)",
              }}
            >
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: isWeekend ? "#EF4444" : "var(--text-muted)",
                  marginBottom: "0.1875rem",
                }}
              >
                {cell.day}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1875rem" }}>
                {people.map((person) => {
                  const code = getCode(availMap, person.id, dateStr)
                  const isFree = !code
                  const initial = initialsMap.get(person.id) || (person.display_name || person.name).charAt(0).toUpperCase()
                  const bgColor = isFree
                    ? CODE_COLORS["Libre"]?.bg || "#22C55E"
                    : CODE_COLORS[code!]?.bg || "#6B7280"

                  return (
                    <span
                      key={person.id}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: bgColor,
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        touchAction: "none",
                      }}
                      title={`${person.display_name || person.name}${code ? ` (${code})` : ""}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleCellClick(person.id, cell.date, code)
                        }
                      }}
                      onPointerDown={() => handlePointerDown(person.id, cell.date, code)}
                      onPointerEnter={() => handlePointerEnter(person.id, cell.date)}
                      onClick={() => {
                        if (didDrag.current) {
                          didDrag.current = false
                          return
                        }
                        handleCellClick(person.id, cell.date, code)
                      }}
                    >
                      {initial}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
