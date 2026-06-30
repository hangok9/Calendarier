"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta")
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
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
        <div style={{ marginBottom: "2rem" }}>
          <a href="/" style={{ color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
            ← Volver al inicio
          </a>
        </div>

        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="nav-logo" style={{ fontSize: "1.5rem" }}>
              Crear cuenta
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              Registrate para acceder a tus calendarios
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Email <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(opcional)</span>
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Nombre de usuario
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Elige un nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                minLength={2}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Contrasena
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="Min. 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Confirmar contrasena
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="Repite la contrasena"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Ya tienes cuenta?{" "}
            <a href="/" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              Iniciar sesion
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
