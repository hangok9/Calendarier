"use client"

import { MONTH_SHORT, CODES, CODE_SHORT, CODE_COLORS } from "@/lib/constants"
import type { Calendar, Person } from "@/types"

export default function SetupView({
  calendar,
  people,
}: {
  calendar: Calendar
  people: Person[]
}) {
  return (
    <div className="stagger" style={{ marginBottom: "1.5rem" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div
          className="pill"
          style={{
            display: "inline-flex",
            marginBottom: "1rem",
            animation: "pulse-glow 2s infinite",
          }}
        >
          Calendario de grupo
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem,5vw,3.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            background: "var(--accent-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {calendar.name}
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            marginTop: "0.75rem",
            lineHeight: 1.6,
          }}
        >
          {calendar.year} · {calendar.months.map((m) => MONTH_SHORT[m]).join(" - ")}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1.5rem",
          maxWidth: "80rem",
          margin: "0 auto",
        }}
      >
        {/* Left: People */}
        <div className="surface-elevated stagger" style={{ padding: "1.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "0.5rem",
                background: "var(--accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                fontSize: "0.875rem",
              }}
            >
              👥
            </div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>
              Personas ({people.length})
            </h2>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {people.map((p) => (
              <span key={p.id} className="tag">
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Codes Legend */}
        <div className="surface-elevated stagger" style={{ padding: "1.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "0.5rem",
                background: "var(--accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                fontSize: "0.875rem",
              }}
            >
              ◈
            </div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Codigos</h2>
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              marginBottom: "1rem",
            }}
          >
            Cada persona marca su disponibilidad asi:
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
            }}
          >
            {CODES.map((code) => {
              const c = CODE_COLORS[code]
              return (
                <div
                  key={code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    background: c.chipBg,
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <span
                    className="badge"
                    style={{ background: c.bg, color: "#fff" }}
                  >
                    {code}
                  </span>
                  <div>
                    <div
                      style={{ fontSize: "0.8125rem", fontWeight: 600 }}
                    >
                      {CODE_SHORT[code]}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {code === "TM"
                        ? "08-15h"
                        : code === "TT"
                          ? "15-21h"
                          : code === "TN"
                            ? "21-08h"
                            : ""}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              <strong style={{ fontWeight: 600 }}>Nota:</strong> Si no se marca
              nada, la persona esta libre.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
