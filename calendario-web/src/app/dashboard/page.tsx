"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [calendars, setCalendars] = useState<{ slug: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.replace("/")
          return
        }
        setUser(data.user)
        setCalendars(data.calendars || [])
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  if (loading) {
    return (
      <>
        <div className="bg-pattern" />
        <div className="bg-glow" />
        <div className="bg-glow-2" />
        <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            Cargando...
          </div>
        </main>
      </>
    )
  }

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
            style={{ display: "inline-flex", marginBottom: "1rem" }}
          >
            Panel de control
          </div>
          <h1
            style={{
              fontSize: "clamp(1.5rem,3vw,2.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              background: "var(--accent-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Bienvenido, {user?.username}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-secondary)",
              marginTop: "0.75rem",
            }}
          >
            Selecciona un calendario para ver o editar tu disponibilidad
          </p>
        </div>

        {calendars.length === 0 ? (
          <div className="surface-elevated" style={{ padding: "3rem", textAlign: "center", maxWidth: "32rem", margin: "0 auto" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              No perteneces a ningun calendario aun.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>
              Pide a tu grupo que te añada o crea un nuevo calendario.
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: "32rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
                  textAlign: "left",
                }}
                onClick={() => router.push(`/calendario/${cal.slug}`)}
              >
                <span style={{ fontWeight: 600 }}>{cal.name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Acceder →
                </span>
              </button>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={() => router.push("/account")}
            className="btn-ghost"
            style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text-secondary)" }}
          >
            Configuracion de cuenta
          </button>
          <span style={{ color: "var(--border)", margin: "0 0.5rem" }}>·</span>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text-muted)" }}
          >
            Cerrar sesion
          </button>
        </div>
      </main>
    </>
  )
}
