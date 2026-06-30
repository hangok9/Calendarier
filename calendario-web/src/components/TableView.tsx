"use client"

import { useMemo } from "react"
import { MONTH_NAMES, CODES, CODE_COLORS } from "@/lib/constants"
import type { Calendar, Person, Availability } from "@/types"

function getAvailCode(personId: string, dateStr: string, availability: Availability[]): string | null {
  return availability.find((a) => a.person_id === personId && a.date === dateStr)?.code ?? null
}

export default function TableView({
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

    await fetch(`/api/calendars/${calendar.slug}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: personId, date: dateStr, code: nextCode || null }),
    })

    const r = await fetch(`/api/calendars/${calendar.slug}`)
    const data = await r.json()
    if (data.availability) onAvailabilityChange(data.availability)
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
                <th style={{ position: "sticky", left: 0, zIndex: 3, background: "var(--surface)", minWidth: "5rem", width: colWidth, borderRight: "1px solid var(--border)", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>Fecha</th>
                <th style={{ position: "sticky", left: "5rem", zIndex: 3, background: "var(--surface)", minWidth: "3.5rem", width: colWidth, borderRight: "1px solid var(--border)" }}>Dia</th>
                {personList.map((p) => (
                  <th key={p.id} style={{ minWidth: "4rem", width: colWidth, padding: "0.5rem 0.25rem", fontSize: "clamp(0.625rem, 1.5vw, 0.8125rem)", lineHeight: 1.2, textAlign: "center" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "5rem" }}>
                      {p.display_name || p.name}
                    </div>
                  </th>
                ))}
                <th style={{ position: "sticky", right: 0, zIndex: 3, background: "var(--surface)", minWidth: "3.5rem", width: colWidth, color: "var(--accent)", boxShadow: "-2px 0 4px rgba(0,0,0,0.05)" }}>Libres</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const showMonth = row.month !== lastMonth
                lastMonth = row.month

                const freeCount = people.filter(
                  (p) => !getAvailCode(p.id, row.dateStr, availability)
                ).length

                return (
                  <>
                    {showMonth && (
                      <tr className="month-divider" key={`m-${row.month}`}>
                        <td colSpan={3 + people.length} style={{ position: "sticky", left: 0, background: "var(--accent-soft)" }}>
                          {MONTH_NAMES[row.month]} {calendar.year}
                        </td>
                      </tr>
                    )}
                    <tr key={row.dateStr} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ position: "sticky", left: 0, zIndex: 1, background: "var(--surface)", borderRight: "1px solid var(--border)", fontWeight: 500, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                        {row.dateStr.slice(5)}
                      </td>
                      <td style={{ position: "sticky", left: "5rem", zIndex: 1, background: "var(--surface)", borderRight: "1px solid var(--border)", fontSize: "0.75rem", color: row.dayName === "Sab" || row.dayName === "Dom" ? "#EF4444" : "var(--text-secondary)" }}>
                        {row.dayName}
                      </td>
                      {personList.map((person) => {
                        const code = getAvailCode(person.id, row.dateStr, availability)
                        const isFree = !code
                        const displayName = person.display_name || person.name
                        return (
                          <td
                            key={person.id}
                            onClick={() => handleCellClick(person.id, row.date, code)}
                            style={{ cursor: "pointer", textAlign: "center", padding: "0.25rem", minHeight: "44px", verticalAlign: "middle" }}
                          >
                            {isFree ? (
                              <span
                                className="badge"
                                style={{
                                  background: "var(--text-muted)",
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
                      <td style={{ position: "sticky", right: 0, zIndex: 1, background: "var(--surface)", textAlign: "center", fontWeight: 700, fontSize: "0.875rem", boxShadow: "-2px 0 4px rgba(0,0,0,0.03)" }}>
                        <span style={{ color: freeCount === people.length ? "var(--emerald)" : "var(--text)", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "44px" }}>
                          {freeCount}
                        </span>
                      </td>
                    </tr>
                  </>
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
