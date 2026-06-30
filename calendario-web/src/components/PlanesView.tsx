"use client"

import { useEffect, useState } from "react"
import type { Calendar, GroupPlan } from "@/types"

export default function PlanesView({
  calendar,
  session,
}: {
  calendar: Calendar
  session: any
}) {
  const [plans, setPlans] = useState<GroupPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  async function loadPlans() {
    setLoading(true)
    try {
      const res = await fetch(`/api/calendars/${calendar.slug}/plans`)
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [calendar.slug])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/calendars/${calendar.slug}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, start_date: startDate, end_date: endDate }),
    })
    if (res.ok) {
      setShowCreate(false)
      setTitle("")
      setDescription("")
      setStartDate("")
      setEndDate("")
      loadPlans()
    }
  }

  async function handleRespond(planId: string, response: "accept" | "decline" | "maybe") {
    await fetch(`/api/calendars/${calendar.slug}/plans/${planId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    })
    loadPlans()
  }

  function getMyResponse(plan: GroupPlan): string | null {
    return plan.responses?.find((r) => r.person_id === session.person_id)?.response ?? null
  }

  return (
    <div>
      <div
        className="stagger"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <div className="pill" style={{ marginBottom: "0.375rem" }}>
            Planes de grupo
          </div>
          <h1
            style={{
              fontSize: "clamp(1.5rem,3vw,2.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Planes
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            Crea planes y coordinaros
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: "0.875rem" }}
          onClick={() => setShowCreate(true)}
        >
          + Nuevo plan
        </button>
      </div>

      {showCreate && (
        <div
          className="surface-elevated"
          style={{ padding: "1.75rem", marginBottom: "1.5rem" }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
            Crear nuevo plan
          </h3>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <input
              className="input-field"
              placeholder="Titulo del plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              className="input-field"
              placeholder="Descripcion (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input
                className="input-field"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <input
                className="input-field"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Crear plan
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          Cargando planes...
        </div>
      ) : plans.length === 0 ? (
        <div
          className="surface-elevated"
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            No hay planes todavia
          </p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Crea el primer plan para tu grupo
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {plans.map((plan) => {
            const myResponse = getMyResponse(plan)
            const accepts = plan.responses?.filter((r) => r.response === "accept").length || 0
            const declines = plan.responses?.filter((r) => r.response === "decline").length || 0
            const maybes = plan.responses?.filter((r) => r.response === "maybe").length || 0

            return (
              <div key={plan.id} className="surface-elevated" style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                      {plan.title}
                    </h3>
                    {plan.description && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          marginTop: "0.25rem",
                        }}
                      >
                        {plan.description}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="pill"
                      style={{
                        background: "var(--green-soft)",
                        color: "var(--green)",
                      }}
                    >
                      OK {accepts}
                    </span>
                    <span
                      className="pill"
                      style={{
                        background: "var(--red-soft)",
                        color: "var(--red)",
                      }}
                    >
                      NO {declines}
                    </span>
                    <span
                      className="pill"
                      style={{
                        background: "var(--amber-soft)",
                        color: "var(--amber)",
                      }}
                    >
                      ? {maybes}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    marginBottom: "1rem",
                  }}
                >
                  {plan.start_date} → {plan.end_date}
                  {plan.creator_name && (
                    <span style={{ marginLeft: "1rem" }}>
                      Creado por {plan.creator_name}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  {(["accept", "decline", "maybe"] as const).map((opt) => {
                    const labels = { accept: "Aceptar", decline: "Rechazar", maybe: "Quizas" }
                    const colors = {
                      accept: { bg: "var(--green-soft)", text: "var(--green)", border: "var(--green)" },
                      decline: { bg: "var(--red-soft)", text: "var(--red)", border: "var(--red)" },
                      maybe: { bg: "var(--amber-soft)", text: "var(--amber)", border: "var(--amber)" },
                    }
                    const c = colors[opt]
                    const isActive = myResponse === opt

                    return (
                      <button
                        key={opt}
                        className="btn"
                        style={{
                          background: isActive ? c.bg : "var(--bg)",
                          color: isActive ? c.text : "var(--text-secondary)",
                          border: isActive ? `1.5px solid ${c.border}` : "1.5px solid var(--border)",
                          fontSize: "0.8125rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                        }}
                        onClick={() => handleRespond(plan.id, opt)}
                      >
                        {labels[opt]}
                      </button>
                    )
                  })}
                </div>

                {/* Responses list */}
                {plan.responses && plan.responses.length > 0 && (
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--border)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                      {plan.responses.map((r) => {
                        const labels = { accept: "OK", decline: "NO", maybe: "?" }
                        return (
                          <span
                            key={r.id}
                            style={{
                              color: "var(--text-secondary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: "0.6875rem", color: r.response === "accept" ? "var(--green)" : r.response === "decline" ? "var(--red)" : "var(--amber)" }}>{labels[r.response]}</span> {r.person_name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
