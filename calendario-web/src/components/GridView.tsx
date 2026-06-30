"use client"

import { useMemo, useRef, useCallback, useState } from "react"
import { DAY_NAMES, MONTH_NAMES, CODES, CODE_COLORS } from "@/lib/constants"
import type { Calendar, Person, Availability } from "@/types"

function getAvailCode(
  personId: string,
  dateStr: string,
  availability: Availability[]
): string | null {
  return availability.find((a) => a.person_id === personId && a.date === dateStr)?.code ?? null
}

function nextCode(current: string | null): string | null {
  const codes = ["", ...CODES]
  const idx = codes.indexOf(current || "")
  return codes[(idx + 1) % codes.length] || null
}

export default function GridView({
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
  const [monthOffset, setMonthOffset] = useState(0)
  const currentMonthIndex = monthOffset
  const currentMonth = calendar.months[currentMonthIndex]
  const dragRef = useRef<{ personId: string; code: string | null; cells: Set<string> } | null>(null)
  const didDrag = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const monthData = useMemo(() => {
    if (!currentMonth) return null
    const year = calendar.year
    const daysInMonth = new Date(year, currentMonth, 0).getDate()
    const firstDay = new Date(year, currentMonth - 1, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1

    const weeks: { day: number; date: Date }[][] = []
    let week: { day: number; date: Date }[] = []

    for (let i = 0; i < startOffset; i++) {
      week.push({ day: 0, date: new Date(0) })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, currentMonth - 1, d)
      week.push({ day: d, date })
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ day: 0, date: new Date(0) })
      }
      weeks.push(week)
    }

    return { name: MONTH_NAMES[currentMonth], year, weeks }
  }, [currentMonth, calendar.year])

  const updateAvailability = useCallback(async () => {
    const r = await fetch(`/api/calendars/${calendar.slug}`)
    const data = await r.json()
    if (data.availability) onAvailabilityChange(data.availability)
  }, [calendar.slug, onAvailabilityChange])

  async function handleCellClick(personId: string, date: Date, currentCode: string | null) {
    const dateStr = date.toISOString().split("T")[0]
    const code = nextCode(currentCode)

    await fetch(`/api/calendars/${calendar.slug}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: personId, date: dateStr, code }),
    })

    await updateAvailability()
  }

  async function applyBatch(personId: string, code: string | null, dateStrs: string[]) {
    if (dateStrs.length === 0) return
    // Use batch endpoint if multiple dates, else single
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
    await updateAvailability()
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

  function formatDateStr(d: Date): string {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
  }

  if (!monthData) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No hay datos de mes</div>
  }

  return (
    <div className="surface-elevated stagger" style={{ padding: "1.25rem" }}>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <button className="btn-ghost" style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", minHeight: "44px", visibility: currentMonthIndex > 0 ? "visible" : "hidden" }}
          onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}>
          ← Anterior
        </button>
        <span style={{ fontWeight: 700, fontSize: "1rem" }}>{monthData.name} {monthData.year}</span>
        <button className="btn-ghost" style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", minHeight: "44px", visibility: currentMonthIndex < calendar.months.length - 1 ? "visible" : "hidden" }}
          onClick={() => setMonthOffset((o) => Math.min(calendar.months.length - 1, o + 1))}>
          Siguiente →
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "0.25rem", marginBottom: "0.25rem" }}>
        {DAY_NAMES.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: "0.625rem", fontWeight: 600, padding: "0.25rem", color: i >= 5 ? "#EF4444" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "0.25rem" }}
        onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        {monthData.weeks.map((week, wi) =>
          week.map((cell, ci) => {
            if (cell.day === 0) {
              return <div key={`${wi}-${ci}`} style={{ minHeight: "3rem", padding: "0.25rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius)", opacity: 0.15 }} />
            }

            const isWeekend = ci >= 5
            const dateStr = cell.date.toISOString().split("T")[0]

            return (
              <div key={`${wi}-${ci}`} className={`grid-cell ${isWeekend ? "grid-cell-weekend" : ""}`}>
                <div className={`day-num ${isWeekend ? "weekend" : ""}`} style={{ fontSize: "0.6875rem", marginBottom: "0.125rem" }}>
                  {cell.day}
                </div>
                {people.map((person) => {
                  const code = getAvailCode(person.id, dateStr, availability)
                  const isFree = !code
                  const displayName = person.display_name || person.name
                  const initial = displayName.charAt(0)

                  const style = isFree
                    ? { background: "var(--green-soft)", color: "#166534", dotColor: "var(--green)" }
                    : { background: CODE_COLORS[code!]?.chipBg || "var(--gray-soft)", color: CODE_COLORS[code!]?.chipText || "var(--text)", dotColor: CODE_COLORS[code!]?.bg || "var(--gray)" }

                  return (
                    <div
                      key={person.id}
                      className="person-chip"
                      style={{ background: style.background, color: style.color, cursor: "pointer", minHeight: "28px", padding: "0.1875rem 0.375rem", fontSize: "0.625rem", borderRadius: "0.375rem", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.125rem", userSelect: "none", WebkitUserSelect: "none", touchAction: "none" }}
                      title={`${displayName}${code ? ` (${code})` : ""}`}
                      onPointerDown={() => handlePointerDown(person.id, cell.date, code)}
                      onPointerEnter={() => handlePointerEnter(person.id, cell.date)}
                      onClick={() => {
                        if (didDrag.current) { didDrag.current = false; return }
                        handleCellClick(person.id, cell.date, code)
                      }}
                    >
                      <span className="dot" style={{ background: style.dotColor, width: "0.375rem", height: "0.375rem", flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{displayName}</span>
                      {code && <span style={{ fontWeight: 600, flexShrink: 0 }}>{code}</span>}
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Leyenda
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
          <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "var(--green)" }} />
          Libre
        </span>
        {CODES.map((code) => (
          <span key={code} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
            <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: CODE_COLORS[code]?.bg }} />
            {code}
          </span>
        ))}
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginLeft: "auto" }}>
          Arrastra para marcar varias fechas seguidas
        </span>
      </div>
    </div>
  )
}
