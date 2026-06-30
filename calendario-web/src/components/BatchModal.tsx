"use client"

import { useState } from "react"
import { CODES, CODE_SHORT } from "@/lib/constants"
import type { Calendar, Person } from "@/types"

export default function BatchModal({
  calendar,
  people,
  session,
  onClose,
  onComplete,
}: {
  calendar: Calendar
  people: Person[]
  session: any
  onClose: () => void
  onComplete: () => void
}) {
  const [personId, setPersonId] = useState(session.person_id)
  const [code, setCode] = useState<string>(CODES[0])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate || !endDate) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`/api/calendars/${calendar.slug}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_id: personId, code, start_date: startDate, end_date: endDate }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult(`Actualizados ${data.updated} dias como ${code}`)
        setTimeout(onComplete, 1500)
      } else {
        setResult(data.error || "Error")
      }
    } catch {
      setResult("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="surface-elevated"
        style={{
          width: "100%",
          maxWidth: "24rem",
          padding: "1.75rem",
          animation: "slideDown 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              width: "1.75rem",
              height: "1.75rem",
              borderRadius: "0.5rem",
              background: "var(--accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
              fontSize: "0.875rem",
            }}
          >
            📋
          </span>
          Marcar rango
        </h3>

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
              Persona
            </label>
            <select
              className="input-field"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              style={{ appearance: "auto" }}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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
              Codigo
            </label>
            <select
              className="input-field"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ appearance: "auto" }}
            >
              {CODES.map((c) => (
                <option key={c} value={c}>
                  {c} - {CODE_SHORT[c]}
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
              Fecha inicio
            </label>
            <input
              className="input-field"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              Fecha fin
            </label>
            <input
              className="input-field"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {result && (
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius)",
                background: "var(--green-soft)",
                color: "var(--green)",
                fontSize: "0.8125rem",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              {result}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Aplicando..." : "Aplicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
