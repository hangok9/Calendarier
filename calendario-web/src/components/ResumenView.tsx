"use client"

import { useMemo } from "react"
import { MONTH_NAMES, CODES, CODE_COLORS, CODE_SHORT } from "@/lib/constants"
import type { Calendar, Person, Availability } from "@/types"

function getAvailCode(personId: string, dateStr: string, availability: Availability[]): string | null {
  return availability.find((a) => a.person_id === personId && a.date === dateStr)?.code ?? null
}

const COVERAGE_CODES = ["TM", "TT", "TN"]
const OTHER_CODES = CODES.filter((c) => !COVERAGE_CODES.includes(c))

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

    const personStats: { id: string; name: string; free: number; codes: Record<string, number> }[] = people.map((p) => ({
      id: p.id,
      name: p.display_name || p.name,
      free: 0,
      codes: Object.fromEntries(CODES.map((c) => [c, 0])),
    }))

    const dayRows: { dateStr: string; month: number; day: number; dayName: string; libre: number; coverage: Record<string, number>; otros: number }[] = []
    const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

    for (const m of calendar.months) {
      const daysInMonth = new Date(calendar.year, m, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(calendar.year, m - 1, d)
        const dateStr = date.toISOString().split("T")[0]
        let libre = 0
        const coverage: Record<string, number> = {}
        let otros = 0
        COVERAGE_CODES.forEach((c) => (coverage[c] = 0))

        for (const person of people) {
          const code = getAvailCode(person.id, dateStr, availability)
          const pStats = personStats.find((ps) => ps.id === person.id)
          if (!code) {
            libre++
            if (pStats) pStats.free++
          } else if (COVERAGE_CODES.includes(code)) {
            coverage[code]++
            if (pStats) pStats.codes[code]++
          } else {
            otros++
            if (pStats) pStats.codes[code]++
          }
        }

        if (libre === n) allFree++

        dayRows.push({
          dateStr,
          month: m,
          day: d,
          dayName: dayNames[date.getDay()],
          libre,
          coverage,
          otros,
        })
      }
    }

    const avgAvailability = dayRows.reduce((sum, r) => sum + r.libre / n, 0) / (dayRows.length || 1)

    return { allFree, allFn, avgAvailability, personStats, dayRows }
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
          <div className="stat-value" style={{ color: "var(--text-secondary)" }}>
            {stats.allFree}
          </div>
          <div className="stat-label">Dias todos libres</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--purple)" }}>
            {Math.round(stats.avgAvailability * 100)}%
          </div>
          <div className="stat-label">Disponibilidad media</div>
        </div>
      </div>

      {/* Per-person breakdown */}
      <div
        className="surface-elevated stagger"
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
          Por persona
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {stats.personStats.map((ps) => {
            const totalAssigned = Object.values(ps.codes).reduce((a, b) => a + b, 0)
            const pctFree = totalDays > 0 ? Math.round((ps.free / totalDays) * 100) : 0
            return (
              <div key={ps.id} style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "var(--bg)", border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{ps.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{ps.free}</span> libres ({pctFree}%)
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  {CODES.map((code) => {
                    const count = ps.codes[code]
                    if (count === 0) return null
                    const c = CODE_COLORS[code]
                    return (
                      <span key={code} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: c.chipBg, color: c.chipText, padding: "0.1875rem 0.5rem 0.1875rem 0.375rem", borderRadius: "999px", fontSize: "0.6875rem", fontWeight: 600 }}>
                        <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: c.bg, flexShrink: 0 }} />
                        {count} {CODE_SHORT[code]}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {people.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No hay personas registradas
            </div>
          )}
        </div>
      </div>

      {/* Daily coverage table */}
      <div
        className="surface-elevated stagger"
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
          Cobertura diaria
        </h3>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", margin: "-0.5rem", padding: "0.5rem" }}>
          <table style={{ width: "100%", minWidth: "20rem", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem 0.625rem", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", fontWeight: 600, position: "sticky", left: 0, background: "var(--surface)", zIndex: 1 }}>Fecha</th>
                <th style={{ textAlign: "center", padding: "0.5rem 0.375rem", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", fontWeight: 600 }}>Libre</th>
                {COVERAGE_CODES.map((code) => (
                  <th key={code} style={{ textAlign: "center", padding: "0.5rem 0.375rem", borderBottom: "2px solid var(--border)", color: CODE_COLORS[code]?.bg, fontWeight: 600 }}>{code}</th>
                ))}
                <th style={{ textAlign: "center", padding: "0.5rem 0.375rem", borderBottom: "2px solid var(--border)", color: "var(--text-muted)", fontWeight: 600 }}>No disp.</th>
              </tr>
            </thead>
            <tbody>
              {stats.dayRows.map((row) => {
                const coverageSum = COVERAGE_CODES.reduce((s, c) => s + row.coverage[c], 0)
                const totalMarked = coverageSum + row.otros
                return (
                  <tr key={row.dateStr} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.5rem 0.625rem", fontWeight: 500, whiteSpace: "nowrap", position: "sticky", left: 0, background: "var(--surface)", zIndex: 0 }}>
                      {row.dateStr.slice(5)} <span style={{ color: row.dayName === "Sab" || row.dayName === "Dom" ? "#EF4444" : "var(--text-muted)", fontSize: "0.6875rem" }}>{row.dayName}</span>
                    </td>
                    <td style={{ textAlign: "center", padding: "0.5rem 0.375rem", fontWeight: 700, color: row.libre === people.length ? "var(--emerald)" : "var(--text-muted)" }}>
                      {row.libre}
                    </td>
                    {COVERAGE_CODES.map((code) => (
                      <td key={code} style={{ textAlign: "center", padding: "0.5rem 0.375rem", fontWeight: 600, color: row.coverage[code] > 0 ? CODE_COLORS[code]?.chipText : "var(--text-muted)" }}>
                        {row.coverage[code] || "—"}
                      </td>
                    ))}
                    <td style={{ textAlign: "center", padding: "0.5rem 0.375rem", color: row.otros > 0 ? "var(--orange)" : "var(--text-muted)", fontWeight: 600 }}>
                      {row.otros || "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thresholds */}
      <div
        className="surface-elevated stagger"
        style={{ padding: "1.5rem" }}
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
          Umbrales de disponibilidad
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { label: `Todos libres (${people.length}/${people.length})`, color: "var(--emerald)", threshold: people.length },
            { label: `Max 1 ocupado (${people.length - 1}/${people.length})`, color: "var(--text-secondary)", threshold: people.length - 1 },
            { label: `Max 2 ocupados (${people.length - 2}/${people.length})`, color: "var(--amber)", threshold: people.length - 2 },
            { label: `Max 3 ocupados (${people.length - 3}/${people.length})`, color: "var(--orange)", threshold: people.length - 3 },
          ].map((item) => {
            const count = stats.dayRows.filter((r) => r.libre >= item.threshold).length
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
