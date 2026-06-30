"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MONTH_SHORT, CODES, CODE_SHORT, CODE_COLORS } from "@/lib/constants"
import type { Calendar, Person } from "@/types"

export default function SetupView({
  calendar,
  people,
  myRole,
  myPersonId,
  session,
  onDataChange,
}: {
  calendar: Calendar
  people: Person[]
  myRole: string
  myPersonId: string | null
  session: any
  onDataChange: () => void
}) {
  const router = useRouter()
  const [addUsername, setAddUsername] = useState("")
  const [addError, setAddError] = useState("")
  const [adding, setAdding] = useState(false)
  const [editingAlias, setEditingAlias] = useState<string | null>(null)
  const [aliasValue, setAliasValue] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isManager = myRole === "manager"

  async function handleAddPerson(e: React.FormEvent) {
    e.preventDefault()
    setAddError("")
    setAdding(true)
    try {
      const res = await fetch(`/api/calendars/${calendar.slug}/people`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: addUsername }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error || "Error al anadir persona")
        return
      }
      setAddUsername("")
      onDataChange()
    } catch {
      setAddError("Error de conexion")
    } finally {
      setAdding(false)
    }
  }

  async function handleRemovePerson(personId: string) {
    if (!confirm("Seguro que quieres eliminar a esta persona del calendario?")) return
    try {
      await fetch(`/api/calendars/${calendar.slug}/people/${personId}`, {
        method: "DELETE",
      })
      onDataChange()
    } catch {}
  }

  async function handleLeave() {
    if (!myPersonId) return
    if (!confirm("Seguro que quieres salirte de este calendario?")) return
    try {
      await fetch(`/api/calendars/${calendar.slug}/people/${myPersonId}`, {
        method: "DELETE",
      })
      router.push("/dashboard")
    } catch {}
  }

  async function handleSaveAlias(personId: string) {
    try {
      await fetch(`/api/calendars/${calendar.slug}/people/${personId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: aliasValue || null }),
      })
      setEditingAlias(null)
      onDataChange()
    } catch {}
  }

  async function handleDeleteCalendar() {
    setDeleting(true)
    try {
      await fetch(`/api/calendars/${calendar.slug}`, { method: "DELETE" })
      router.push("/dashboard")
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="stagger" style={{ marginBottom: "1.5rem" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div className="pill" style={{ display: "inline-flex", marginBottom: "1rem", animation: "pulse-glow 2s infinite" }}>
          Calendario de grupo
        </div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {calendar.name}
        </h1>
        <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", marginTop: "0.75rem", lineHeight: 1.6 }}>
          {calendar.year} · {calendar.months.map((m) => MONTH_SHORT[m]).join(" - ")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", maxWidth: "80rem", margin: "0 auto" }}>
        {/* People */}
        <div className="surface-elevated stagger" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Personas ({people.length})</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {people.map((p: any) => {
              const isSelf = p.id === myPersonId
              const editing = editingAlias === p.id
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", background: isSelf ? "var(--accent-soft)" : "var(--bg)", border: "1px solid var(--border-light)", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                    <span className="tag" style={{ flexShrink: 0 }}>{p.display_name || p.name}</span>
                    {p.role === "manager" && <span style={{ fontSize: "0.6875rem", color: "var(--accent)", fontWeight: 600 }}>Gestor</span>}
                    {p.alias && p.alias !== p.name && <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>({p.name})</span>}
                    {isSelf && <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>— eres tu</span>}
                  </div>
                  <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                    {isSelf && !editing && (
                      <button onClick={() => { setEditingAlias(p.id); setAliasValue(p.alias || "") }}
                        style={{ background: "none", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                        {p.alias ? "Cambiar apodo" : "Poner apodo"}
                      </button>
                    )}
                    {isSelf && editing && (
                      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                        <input type="text" value={aliasValue} onChange={(e) => setAliasValue(e.target.value)}
                          className="input-field" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", width: "8rem" }}
                          placeholder="Tu apodo" autoFocus />
                        <button onClick={() => handleSaveAlias(p.id)}
                          style={{ background: "var(--accent)", border: "none", borderRadius: "0.375rem", padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer", color: "#fff" }}>OK</button>
                        <button onClick={() => setEditingAlias(null)}
                          style={{ background: "none", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}>X</button>
                      </div>
                    )}
                    {(isManager && !isSelf) && (
                      <button onClick={() => handleRemovePerson(p.id)}
                        style={{ background: "none", border: "1px solid var(--red-soft)", borderRadius: "0.375rem", padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer", color: "var(--red)" }}>
                        Expulsar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add person (manager only) */}
          {isManager && (
            <form onSubmit={handleAddPerson} style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Anadir persona por username
                </label>
                <input className="input-field" type="text" placeholder="Ej: juan" value={addUsername} onChange={(e) => setAddUsername(e.target.value.toLowerCase())} required style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem", width: "100%" }} />
              </div>
              <button type="submit" disabled={adding} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                {adding ? "..." : "Anadir"}
              </button>
            </form>
          )}
          {addError && <p style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.5rem" }}>{addError}</p>}

          {/* Leave or Delete calendar */}
          <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={handleLeave} className="btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text-secondary)" }}>
              Salirme del calendario
            </button>
            {isManager && !confirmDelete && (
              <button onClick={() => setConfirmDelete(true)} style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "1px solid var(--red-soft)", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--red)" }}>
                Eliminar calendario
              </button>
            )}
            {isManager && confirmDelete && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--red)" }}>Seguro?</span>
                <button onClick={handleDeleteCalendar} disabled={deleting} style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "var(--red)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "var(--font-sans)", color: "#fff" }}>
                  {deleting ? "..." : "Si, eliminar"}
                </button>
                <button onClick={() => setConfirmDelete(false)} style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Codes Legend */}
        <div className="surface-elevated stagger" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Codigos</h2>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Cada persona marca su disponibilidad asi:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {CODES.map((code) => {
              const c = CODE_COLORS[code]
              return (
                <div key={code} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem", borderRadius: "0.5rem", background: c.chipBg, border: "1px solid var(--border-light)" }}>
                  <span className="badge" style={{ background: c.bg, color: "#fff" }}>{code}</span>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{CODE_SHORT[code]}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                      {code === "TM" ? "08-15h" : code === "TT" ? "15-21h" : code === "TN" ? "21-08h" : ""}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <strong style={{ fontWeight: 600 }}>Nota:</strong> Si no se marca nada, la persona esta libre.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
