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

  return (
    <div className="surface-elevated stagger" style={{ padding: "1.25rem" }}>
      <div className="table-wrap">
        <table className="cal-table">
          <thead>
            <tr>
              <th style={{ minWidth: "5.5rem" }}>Fecha</th>
              <th style={{ minWidth: "3rem" }}>Dia</th>
              {people.map((p) => (
                <th key={p.id}>{p.name}</th>
              ))}
              <th style={{ minWidth: "3.5rem", color: "var(--accent)" }}>Libres</th>
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
                      <td colSpan={3 + people.length}>
                        {MONTH_NAMES[row.month]} {calendar.year}
                      </td>
                    </tr>
                  )}
                  <tr key={row.dateStr}>
                    <td>{row.dateStr.slice(5)}</td>
                    <td>{row.dayName}</td>
                    {people.map((person) => {
                      const code = getAvailCode(person.id, row.dateStr, availability)
                      const isFree = !code
                      return (
                        <td
                          key={person.id}
                          onClick={() => handleCellClick(person.id, row.date, code)}
                          style={{ cursor: "pointer" }}
                        >
                          {isFree ? (
                            <span
                              className="badge"
                              style={{
                                background: "var(--green)",
                                color: "#fff",
                                fontSize: "0.5625rem",
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
                              }}
                            >
                              {code}
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: freeCount === people.length ? "var(--emerald)" : "var(--text)",
                        }}
                      >
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
  )
}
