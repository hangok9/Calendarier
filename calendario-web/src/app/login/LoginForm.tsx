"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultSlug = searchParams.get("slug") || ""

  const [slug, setSlug] = useState(defaultSlug)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [calendars, setCalendars] = useState<{ slug: string; name: string }[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/calendars")
      .then((r) => r.json())
      .then(setCalendars)
      .catch(console.error)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesion")
        return
      }

      router.push(`/calendario/${slug}`)
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  const calName = calendars.find((c) => c.slug === slug)?.name

  return (
    <>
      <div className="bg-pattern" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <main
        style={{
          maxWidth: "28rem",
          margin: "0 auto",
          padding: "6rem 1.5rem 2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <a href="/" className="nav-logo" style={{ fontSize: "1.5rem" }}>
              Calenadarier
            </a>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              Accede a tu calendario de grupo
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.375rem",
                }}
              >
                Calendario
              </label>
              <select
                className="input-field"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                style={{ appearance: "auto", padding: "0.625rem 1rem" }}
              >
                <option value="">Selecciona un calendario</option>
                {calendars.map((cal) => (
                  <option key={cal.slug} value={cal.slug}>
                    {cal.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.375rem",
                }}
              >
                Tu nombre
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Ej: PEPE"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.375rem",
                }}
              >
                Contrasena
              </label>
              <input
                className="input-field"
                type="password"
                placeholder={calName ? `Contrasena de ${calName}` : "Contrasena del calendario"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius)",
                  background: "var(--red-soft)",
                  color: "var(--red)",
                  fontSize: "0.8125rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                fontSize: "1rem",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Entrando..." : "Acceder al calendario"}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
