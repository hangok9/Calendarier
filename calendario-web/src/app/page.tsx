"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [calendars, setCalendars] = useState<{ slug: string; name: string }[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch("/api/calendars")
      .then((r) => r.json())
      .then(setCalendars)
      .catch(console.error)
  }, [])

  return (
    <>
      <div className="bg-pattern" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <main
        style={{
          maxWidth: "48rem",
          margin: "0 auto",
          padding: "6rem 1.5rem 2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            className="pill"
            style={{
              display: "inline-flex",
              marginBottom: "1rem",
              animation: "pulse-glow 2s infinite",
            }}
          >
            Gestion de disponibilidad
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
            Calenadarier
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--text-secondary)",
              marginTop: "0.75rem",
              maxWidth: "32rem",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            Configura tu grupo y descubre al instante los dias libres de todo el equipo.
          </p>
        </div>

        <div
          className="surface-elevated"
          style={{ padding: "2rem", maxWidth: "32rem", margin: "0 auto" }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
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
              ▦
            </span>
            Selecciona un calendario
          </h2>

          {calendars.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              Cargando calendarios...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {calendars.map((cal) => (
                <button
                  key={cal.slug}
                  className="btn btn-secondary"
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/login?slug=${cal.slug}`)}
                >
                  <span style={{ fontWeight: 600 }}>{cal.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Acceder →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
