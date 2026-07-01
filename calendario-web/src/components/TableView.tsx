"use client"

import { useMemo, Fragment } from "react"
import { MONTH_NAMES, CODES, CODE_COLORS } from "@/lib/constants"
import { useAvailMap, getCode } from "@/hooks/useAvailMap"
import type { Calendar, Person, Availability } from "@/types"

export default function TableView({
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
  const availMap = useAvailMap(availability)

  const rows = useMemo(() => {
    const result: { date: Date; dateStr: string; month: number; dayName: string; dayNum: number }[] = []
    for (const m of calendar.months) {
      const daysInMonth = new Date(calendar.year, m, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(calendar.year, m - 1, d)
        const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
        result.push({
          date,
          dateStr: date.toISOString().split("T")[0],
          month: m,
          dayName: dayNames[date.getDay()],
          dayNum: d,
        })
      }
    }
    return result
  }, [calendar])

  const personList = useMemo(() => people, [people])

  async function handleCellClick(personId: string, date: Date, currentCode: string | null) {
    const dateStr = date.toISOString().split("T")[0]
    const codes = ["", ...CODES]
    const currentIndex = codes.indexOf(currentCode || "")
    const nextCode = codes[(currentIndex + 1) % codes.length]

    // Optimistic update
    const optimisticEntry: Availability = {
      id: `opt-${personId}-${dateStr}`,
      calendar_id: calendar.id,
      person_id: personId,
      date: dateStr,
      code: nextCode || null,
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
      body: JSON.stringify({ person_id: personId, date: dateStr, code: nextCode || null }),
    })
  }

  let lastMonth = 0
  const colWidth = `max(3.5rem, ${100 / Math.max(people.length + 3, 5)}vw)`

  return (
    <div className="surface-elevated stagger" style={{ padding: "1.25rem", position: "relative" }}>
      <div className="table-wrap" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", margin: "-0.5rem", padding: "0.5rem" }}>
        <div style={{ minWidth: people.length > 5 ? `${people.length * 4 + 12}rem` : "100%" }}>
          <table className="cal-table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, zIndex: 3, background: "var(--surface)", minWidth: "5rem", width: colWidth, backgroundClip: "padding-box", boxShadow: "2px 0 4px rgba(0,0,0,0.05), 1px 0 0 var(--border)" }}>Fecha</th>
                <th style={{ position: "sticky", left: "5rem", zIndex: 3, background: "var(--surface)", minWidth: "3.5rem", width: colWidth, backgroundClip: "padding-box", boxShadow: "1px 0 0 var(--border)" }}>Dia</th>
                {personList.map((p) => (
                  <th key={p.id} style={{ minWidth: "4rem", width: colWidth, padding: "0.5rem 0.25rem", fontSize: "clamp(0.625rem, 1.5vw, 0.8125rem)", lineHeight: 1.2, textAlign: "center" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "5rem" }}>
                      {p.display_name || p.name}
                    </div>
                  </th>
                ))}
                <th style={{ position: "sticky", right: 0, zIndex: 3, background: "var(--surface)", minWidth: "3.5rem", width: colWidth, color: "var(--accent)", backgroundClip: "padding-box", boxShadow: "-2px 0 4px rgba(0,0,0,0.05), -1px 0 0 var(--border)" }}>Libres</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const showMonth = row.month !== lastMonth
                lastMonth = row.month

                const freeCount = people.filter(
                  (p) => !getCode(availMap, p.id, row.dateStr)
                ).length

                return (
                  <Fragment key={row.dateStr}>
                    {showMonth && (
                      <tr className="month-divider">
                        <td colSpan={3 + people.length} style={{ position: "sticky", left: 0, background: "var(--accent-soft)" }}>
                          {MONTH_NAMES[row.month]} {calendar.year}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ position: "sticky", left: 0, zIndex: 1, background: "var(--surface)", backgroundClip: "padding-box", fontWeight: 500, fontSize: "0.75rem", whiteSpace: "nowrap", boxShadow: "1px 0 0 var(--border)" }}>
                        {row.dateStr.slice(5)}
                      </td>
                      <td style={{ position: "sticky", left: "5rem", zIndex: 1, background: "var(--surface)", backgroundClip: "padding-box", fontSize: "0.75rem", color: row.dayName === "Sab" || row.dayName === "Dom" ? "#EF4444" : "var(--text-secondary)", boxShadow: "1px 0 0 var(--border)" }}>
                        {row.dayName}
                      </td>
                      {personList.map((person) => {
                        const code = getCode(availMap, person.id, row.dateStr)
                        const isFree = !code
                        const displayName = person.display_name || person.name
                        return (
                          <td
                            key={person.id}
                            onClick={() => handleCellClick(person.id, row.date, code)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                handleCellClick(person.id, row.date, code)
                              }
                            }}
                            style={{ cursor: "pointer", textAlign: "center", padding: "0.25rem", minHeight: "44px", verticalAlign: "middle" }}
                            aria-label={`${displayName} ${row.dateStr}${code ? ` - ${code}` : " - Libre"}`}
                          >
                            {isFree ? (
                              <span
                                className="badge"
                                style={{
                                  background: CODE_COLORS["Libre"]?.bg || "#22C55E",
                                  color: "#fff",
                                  fontSize: "0.5625rem",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "1.5rem",
                                  height: "1.5rem",
                                }}
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                className="badge"
                                style={{
                                  background: CODE_COLORS[code]?.bg || "var(--gray)",
                                  color: "#fff",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  minWidth: "1.5rem",
                                  height: "1.5rem",
                                  padding: "0 0.375rem",
                                }}
                              >
                                {code}
                              </span>
                            )}
                          </td>
                        )
                      })}
                      <td style={{ position: "sticky", right: 0, zIndex: 1, background: "var(--surface)", backgroundClip: "padding-box", textAlign: "center", fontWeight: 700, fontSize: "0.875rem", boxShadow: "-2px 0 4px rgba(0,0,0,0.03), -1px 0 0 var(--border)" }}>
                        <span style={{ color: freeCount === people.length ? (CODE_COLORS["Libre"]?.bg || "#22C55E") : "var(--text)", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "44px" }}>
                          {freeCount}
                        </span>
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {people.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          No hay personas registradas todavia
        </div>
      )}
    </div>
  )
}
