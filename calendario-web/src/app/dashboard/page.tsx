"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MONTH_SHORT } from "@/lib/constants"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [calendars, setCalendars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newMyName, setNewMyName] = useState("")
  const [newYear, setNewYear] = useState(2026)
  const [newMonths, setNewMonths] = useState<number[]>([7, 8])
  const [createError, setCreateError] = useState("")
  const [creating, setCreating] = useState(false)

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
  }, [router])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch("/api/calendars")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter calendars where user has membership
          const mine = data.filter((c: any) => c.membership)
          setCalendars(mine)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")
    setCreating(true)

    try {
      const res = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          year: newYear,
          months: newMonths,
          myName: newMyName || user?.username,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || "Error al crear calendario")
        return
      }

      setShowCreate(false)
      setNewName("")
      setNewMyName("")
      router.push(`/calendario/${data.calendar.slug}`)
    } catch {
      setCreateError("Error de conexion")
    } finally {
      setCreating(false)
    }
  }

  function toggleMonth(m: number) {
    setNewMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort()
    )
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  if (loading) {
    return (
      <>
        <div className="bg-pattern" /><div className="bg-glow" /><div className="bg-glow-2" />
        <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Cargando...</div>
        </main>
      </>
    )
  }

  return (
    <>
      <div className="bg-pattern" /><div className="bg-glow" /><div className="bg-glow-2" />

      <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="pill" style={{ display: "inline-flex", marginBottom: "0.75rem" }}>Panel de control</div>
            <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Bienvenido, {user?.username}
            </h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ padding: "0.625rem 1.25rem", cursor: "pointer" }}>
            + Nuevo calendario
          </button>
        </div>

        {showCreate && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", padding: "1rem" }} onClick={() => setShowCreate(false)}>
            <div className="surface-elevated" style={{ width: "100%", maxWidth: "28rem", padding: "2rem", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>Crear calendario</h2>
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Nombre del grupo</label>
                  <input className="input-field" type="text" placeholder="Ej: Viaje 2026" value={newName} onChange={(e) => setNewName(e.target.value)} required autoFocus />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Tu nombre en este grupo</label>
                  <input className="input-field" type="text" placeholder={user?.username?.toUpperCase() || ""} value={newMyName} onChange={(e) => setNewMyName(e.target.value.toUpperCase())} />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>Obligatorio. Tus amigos te conocen asi.</span>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Año</label>
                    <input className="input-field" type="number" value={newYear} onChange={(e) => setNewYear(parseInt(e.target.value) || 2026)} min={2000} max={2100} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Meses</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.375rem" }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <button key={m} type="button" onClick={() => toggleMonth(m)}
                          style={{ padding: "0.375rem", fontSize: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: newMonths.includes(m) ? "var(--accent)" : "var(--bg)", color: newMonths.includes(m) ? "#fff" : "var(--text)", cursor: "pointer" }}>
                          {MONTH_SHORT[m]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {createError && <div style={{ padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>{createError}</div>}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "0.75rem", cursor: "pointer" }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={creating} style={{ flex: 1, padding: "0.75rem", opacity: creating ? 0.6 : 1, cursor: "pointer" }}>
                    {creating ? "Creando..." : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {calendars.length === 0 ? (
          <div className="surface-elevated" style={{ padding: "3rem", textAlign: "center", maxWidth: "32rem", margin: "0 auto" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>No perteneces a ningun calendario aun.</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>Crea uno nuevo o pide a alguien que te anada.</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ marginTop: "1.25rem", padding: "0.75rem 1.5rem", cursor: "pointer" }}>
              Crear mi primer calendario
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: "32rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {calendars.map((cal: any) => (
              <button
                key={cal.slug}
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "space-between", padding: "1rem 1.25rem", fontSize: "1rem", cursor: "pointer", textAlign: "left" }}
                onClick={() => router.push(`/calendario/${cal.slug}`)}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{cal.name}</span>
                  {cal.membership && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                      {cal.membership.role === "manager" ? "Gestor" : "Miembro"}
                      {cal.membership.alias && ` · ${cal.membership.alias}`}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Acceder →</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button onClick={() => router.push("/account")} className="btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text-secondary)" }}>
            Configuracion de cuenta
          </button>
          <span style={{ color: "var(--border)", margin: "0 0.5rem" }}>·</span>
          <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text-muted)" }}>
            Cerrar sesion
          </button>
        </div>
      </main>
    </>
  )
}
