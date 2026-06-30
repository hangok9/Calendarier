"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al restablecer la contrasena")
        return
      }
      setSuccess(true)
      setTimeout(() => router.push("/"), 3000)
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
        <p>Enlace invalido. Solicita un nuevo restablecimiento.</p>
        <a href="/" style={{ color: "var(--accent)" }}>Volver al inicio</a>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Contrasena actualizada</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Redirigiendo al inicio...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.375rem" }}>Nueva contrasena</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
          Elige una contrasena nueva para tu cuenta
        </p>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
          Contrasena nueva
        </label>
        <input className="input-field" type="password" placeholder="Min. 6 caracteres" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
          Confirmar contrasena
        </label>
        <input className="input-field" type="password" placeholder="Repite la contrasena" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
      </div>

      {error && (
        <div style={{ padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}
        style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", opacity: loading ? 0.6 : 1 }}>
        {loading ? "Guardando..." : "Cambiar contrasena"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <>
      <div className="bg-pattern" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <Suspense fallback={<div style={{ textAlign: "center", color: "var(--text-muted)" }}>Cargando...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </main>
    </>
  )
}
