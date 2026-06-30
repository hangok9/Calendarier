"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string; email: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  // Email
  const [email, setEmail] = useState("")
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg] = useState("")
  const [emailError, setEmailError] = useState("")

  // Password
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState("")
  const [pwError, setPwError] = useState("")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.replace("/")
          return
        }
        setUser(data.user)
        setEmail(data.user?.email || "")
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false))
  }, [router])

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailMsg("")
    setEmailError("")
    setEmailSaving(true)
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailError(data.error || "Error al actualizar email")
        return
      }
      setUser((u) => (u ? { ...u, email: data.email } : u))
      setEmailMsg("Email actualizado correctamente")
    } catch {
      setEmailError("Error de conexion")
    } finally {
      setEmailSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg("")
    setPwError("")
    setPwSaving(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPwError(data.error || "Error al cambiar contrasena")
        return
      }
      setPwMsg("Contrasena actualizada correctamente")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setPwError("Error de conexion")
    } finally {
      setPwSaving(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  if (loading) {
    return (
      <>
        <div className="bg-pattern" /><div className="bg-glow" /><div className="bg-glow-2" />
        <main style={{ maxWidth: "36rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Cargando...</div>
        </main>
      </>
    )
  }

  return (
    <>
      <div className="bg-pattern" /><div className="bg-glow" /><div className="bg-glow-2" />

      <main style={{ maxWidth: "36rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
            ← Volver al dashboard
          </a>
        </div>

        {/* Profile */}
        <div className="surface-elevated" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="nav-logo" style={{ fontSize: "1.25rem" }}>
              Configuracion de cuenta
            </div>
          </div>

          {/* Username */}
          <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "var(--bg)", border: "1px solid var(--border-light)", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Usuario</div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>{user?.username}</div>
          </div>

          {/* Email */}
          <form onSubmit={handleUpdateEmail} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Email
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="input-field"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={emailSaving}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  {emailSaving ? "..." : "Guardar"}
                </button>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                {user?.email ? "Dejalo vacio para eliminar el email." : "Opcional. Necesario para recuperar contrasena."}
              </span>
            </div>
            {emailMsg && <div style={{ padding: "0.625rem", borderRadius: "var(--radius)", background: "var(--green-soft, #dcfce7)", color: "var(--green, #16a34a)", fontSize: "0.8125rem", textAlign: "center" }}>{emailMsg}</div>}
            {emailError && <div style={{ padding: "0.625rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>{emailError}</div>}
          </form>
        </div>

        {/* Change Password */}
        <div className="surface-elevated" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Cambiar contrasena</h2>
          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Contrasena actual</label>
              <input className="input-field" type="password" placeholder="Tu contrasena actual" value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Contrasena nueva</label>
              <input className="input-field" type="password" placeholder="Min. 6 caracteres" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Confirmar contrasena nueva</label>
              <input className="input-field" type="password" placeholder="Repite la contrasena nueva" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            {pwError && <div style={{ padding: "0.625rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>{pwError}</div>}
            {pwMsg && <div style={{ padding: "0.625rem", borderRadius: "var(--radius)", background: "var(--green-soft, #dcfce7)", color: "var(--green, #16a34a)", fontSize: "0.8125rem", textAlign: "center" }}>{pwMsg}</div>}
            <button type="submit" className="btn btn-primary" disabled={pwSaving}
              style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", opacity: pwSaving ? 0.6 : 1 }}>
              {pwSaving ? "Guardando..." : "Cambiar contrasena"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={handleLogout} className="btn-ghost"
            style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text-muted)" }}>
            Cerrar sesion
          </button>
        </div>
      </main>
    </>
  )
}
