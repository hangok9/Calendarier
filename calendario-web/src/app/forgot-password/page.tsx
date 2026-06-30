"use client"

import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error")
        return
      }
      setSent(true)
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

      <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="nav-logo" style={{ fontSize: "1.25rem" }}>
              Restablecer contrasena
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Introduce tu email y te enviaremos un enlace
            </p>
          </div>

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Si el email esta registrado, recibiras un enlace para restablecer tu contrasena.
              </p>
              <a href="/" style={{ color: "var(--accent)", fontSize: "0.8125rem", textDecoration: "none", display: "inline-block", marginTop: "1rem" }}>
                Volver al inicio
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                  Email
                </label>
                <input className="input-field" type="email" placeholder="tu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>

              {error && (
                <div style={{ padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading}
                style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>

              <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8125rem" }}>
                <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                  Volver al inicio
                </a>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  )
}
