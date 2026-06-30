"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          router.replace("/dashboard")
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesion")
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="bg-pattern" />
        <div className="bg-glow" />
        <div className="bg-glow-2" />
        <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
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
          maxWidth: "28rem",
          margin: "0 auto",
          padding: "6rem 1.5rem 2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="nav-logo" style={{ fontSize: "1.5rem" }}>
              Calenadarier
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              Inicia sesion para acceder a tus calendarios
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Usuario
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Contrasena
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.375rem",
                    borderRadius: "0.375rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Entrando..." : "Iniciar sesion"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            No tienes cuenta?{" "}
            <a href="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              Crear cuenta
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
