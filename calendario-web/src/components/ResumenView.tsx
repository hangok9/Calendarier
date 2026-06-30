"use client"

import { useMemo } from "react"
import { MONTH_NAMES, CODES, CODE_COLORS, CODE_SHORT } from "@/lib/constants"
import type { Calendar, Person, Availability } from "@/types"

function getAvailCode(personId: string, dateStr: string, availability: Availability[]): string | null {
  return availability.find((a) => a.person_id === personId && a.date === dateStr)?.code ?? null
}

export default function ResumenView({
  calendar,
  people,
  availability,
  totalDays,
}: {
  calendar: Calendar
  people: Person[]
  availability: Availability[]
  totalDays: number
}) {
  const stats = useMemo(() => {
    const n = people.length
    let allFree = 0
    let allFn = 0
    const codeCounts: Record<string, number> = {}
    CODES.forEach((c) => (codeCounts[c] = 0))

    const rows: { dateStr: string; month: number; day: number; dayName: string; free: number; codes: Record<string, number> }[] = []
    const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

    for (const m of calendar.months) {
      const daysInMonth = new Date(calendar.year, m, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(calendar.year, m - 1, d)
        const dateStr = date.toISOString().split("T")[0]
        let free = 0
        const rowCodes: Record<string, number> = {}
        CODES.forEach((c) => (rowCodes[c] = 0))

        for (const person of people) {
          const code = getAvailCode(person.id, dateStr, availability)
          if (!code) {
            free++
          } else if (rowCodes[code] !== undefined) {
            rowCodes[code]++
            codeCounts[code] = (codeCounts[code] || 0) + 1
          }
        }

        if (free === n) allFree++
        if (rowCodes["FN"] === n) allFn++

        rows.push({
          dateStr,
          month: m,
          day: d,
          dayName: dayNames[date.getDay()],
          free,
          codes: rowCodes,
        })
      }
    }

    const avgAvailability = rows.reduce((sum, r) => sum + r.free / n, 0) / (rows.length || 1)

    return { allFree, allFn, avgAvailability, codeCounts, rows }
  }, [calendar, people, availability])

  const monthRange = calendar.months.map((m) => MONTH_NAMES[m]).join(" - ")

  return (
    <div>
      <div className="stagger" style={{ marginBottom: "1.5rem" }}>
        <div className="pill" style={{ marginBottom: "0.375rem" }}>
          Dashboard de disponibilidad
        </div>
        <h1
          style={{
            fontSize: "clamp(1.5rem,3vw,2.25rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Resumen
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            marginTop: "0.125rem",
          }}
        >
          {calendar.name} · {monthRange} {calendar.year}
        </p>
      </div>

      {/* Stat cards */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--accent)" }}>
            {totalDays}
          </div>
          <div className="stat-label">Total dias en el periodo</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--green)" }}>
            {stats.allFree}
          </div>
          <div className="stat-label">Dias todos libres</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--orange)" }}>
            {stats.allFn}
          </div>
          <div className="stat-label">Dias todos FN</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--purple)" }}>
            {Math.round(stats.avgAvailability * 100)}%
          </div>
          <div className="stat-label">Disponibilidad media</div>
        </div>
      </div>

      {/* Code distribution */}
      <div
        className="surface-elevated"
        style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
      >
        <h3
          style={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              width: "1.25rem",
              height: "1.25rem",
              borderRadius: "0.375rem",
              background: "var(--emerald-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--emerald)",
              fontSize: "0.6875rem",
            }}
          >
            ◈
          </span>
          Distribucion por codigo
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {CODES.map((code) => {
            const count = stats.codeCounts[code] || 0
            const maxCount = Math.max(...CODES.map((c) => stats.codeCounts[c] || 0), 1)
            const pct = Math.round((count / maxCount) * 100)
            const c = CODE_COLORS[code]
            return (
              <div
                key={code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                }}
              >
                <span
                  className="badge"
                  style={{
                    background: c.bg,
                    color: "#fff",
                    width: "1.5rem",
                    height: "1.5rem",
                    fontSize: "0.5625rem",
                  }}
                >
                  {code}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {CODE_SHORT[code]}
                    </span>
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                  <div className="progress-track" style={{ marginTop: "0.125rem" }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: c.bg }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Thresholds */}
      <div
        className="surface-elevated"
        style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
      >
        <h3
          style={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              width: "1.25rem",
              height: "1.25rem",
              borderRadius: "0.375rem",
              background: "var(--accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
              fontSize: "0.6875rem",
            }}
          >
            ◈
          </span>
          Umbrales de disponibilidad
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { label: `Todos libres (${people.length}/${people.length})`, color: "var(--emerald)", threshold: people.length },
            { label: `Max 1 ocupado (${people.length - 1}/${people.length})`, color: "var(--green)", threshold: people.length - 1 },
            { label: `Max 2 ocupados (${people.length - 2}/${people.length})`, color: "var(--amber)", threshold: people.length - 2 },
            { label: `Max 3 ocupados (${people.length - 3}/${people.length})`, color: "var(--orange)", threshold: people.length - 3 },
          ].map((item) => {
            const count = stats.rows.filter((r) => r.free >= item.threshold).length
            const pct = totalDays > 0 ? Math.round((count / totalDays) * 100) : 0
            return (
              <div key={item.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8125rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {item.label}
                  </span>
                  <span style={{ fontWeight: 700, color: item.color }}>
                    {count} de {totalDays}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: item.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
