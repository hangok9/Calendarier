"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string; email: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.replace("/")
          return
        }
        setUser(data.user)
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setError("")
    setSaving(true)

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al cambiar contrasena")
        return
      }

      setMessage("Contrasena actualizada correctamente")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setError("Error de conexion")
    } finally {
      setSaving(false)
    }
  }

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
        <main style={{ maxWidth: "36rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
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
          maxWidth: "36rem",
          margin: "0 auto",
          padding: "6rem 1.5rem 2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
            ← Volver al dashboard
          </a>
        </div>

        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="nav-logo" style={{ fontSize: "1.25rem" }}>
              Configuracion de cuenta
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              {user?.username}{user?.email ? ` · ${user.email}` : ""}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Contrasena actual
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="Tu contrasena actual"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Contrasena nueva
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="Nueva contrasena (min. 6 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Confirmar contrasena nueva
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="Repite la contrasena nueva"
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

            {message && (
              <div style={{ padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--green-soft, #dcfce7)", color: "var(--green, #16a34a)", fontSize: "0.8125rem", textAlign: "center" }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "Guardando..." : "Cambiar contrasena"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text-muted)" }}
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
