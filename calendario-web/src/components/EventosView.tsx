"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createEventSchema } from "@/lib/schemas"
import type { z } from "zod"
import { CODES, CODE_SHORT, CODE_COLORS } from "@/lib/constants"
import type { Calendar, Person } from "@/types"

type CreateEventForm = z.infer<typeof createEventSchema>

interface CustomEventItem {
  id: string
  person_id: string
  date: string
  start_time: string | null
  end_time: string | null
  label: string | null
  code: string | null
  people?: { name: string }
}

export default function EventosView({
  calendar,
  people,
  session,
}: {
  calendar: Calendar
  people: Person[]
  session: any
}) {
  const [events, setEvents] = useState<CustomEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  // Create form
  const eventForm = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { personId: session.person_id, date: "", startTime: "", endTime: "", label: "", code: "" },
  })

  async function loadEvents(date?: string) {
    setLoading(true)
    try {
      let url = `/api/calendars/${calendar.slug}/events`
      if (date) url += `?date=${date}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents(selectedDate || undefined)
  }, [calendar.slug, selectedDate])

  async function handleCreate(data: CreateEventForm) {
    const res = await fetch(`/api/calendars/${calendar.slug}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person_id: data.personId,
        date: data.date,
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        label: data.label || null,
        code: data.code || null,
      }),
    })
    if (res.ok) {
      setShowCreate(false)
      eventForm.reset()
      loadEvents(selectedDate || undefined)
    }
  }

  async function handleDelete(eventId: string) {
    const res = await fetch(`/api/calendars/${calendar.slug}/events/${eventId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      loadEvents(selectedDate || undefined)
    }
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
            Eventos personalizados
          </div>
          <h1
            style={{
              fontSize: "clamp(1.5rem,3vw,2.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Eventos
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            Anade horarios flexibles o eventos propios
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            className="input-field"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: "auto" }}
          />
          <button
            className="btn btn-primary"
            style={{ fontSize: "0.875rem" }}
            onClick={() => {
              setShowCreate(true)
              eventForm.setValue("date", selectedDate || new Date().toISOString().split("T")[0])
            }}
          >
            + Nuevo evento
          </button>
        </div>
      </div>

      {showCreate && (
        <div
          className="surface-elevated"
          style={{ padding: "1.75rem", marginBottom: "1.5rem" }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
            Crear evento personalizado
          </h3>
          <form
            onSubmit={eventForm.handleSubmit(handleCreate)}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            noValidate
          >
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                  htmlFor="ev-person"
                >
                  Persona
                </label>
                <select
                  id="ev-person"
                  className="input-field"
                  style={{ appearance: "auto" }}
                  {...eventForm.register("personId")}
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name || p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                  htmlFor="ev-date"
                >
                  Fecha
                </label>
                <input
                  id="ev-date"
                  className="input-field"
                  type="date"
                  aria-invalid={eventForm.formState.errors.date ? "true" : "false"}
                  {...eventForm.register("date")}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                  htmlFor="ev-start"
                >
                  Hora inicio (opcional)
                </label>
                <input
                  id="ev-start"
                  className="input-field"
                  type="time"
                  {...eventForm.register("startTime")}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                  htmlFor="ev-end"
                >
                  Hora fin (opcional)
                </label>
                <input
                  id="ev-end"
                  className="input-field"
                  type="time"
                  {...eventForm.register("endTime")}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                  htmlFor="ev-label"
                >
                  Etiqueta (ej: Curso, Medico)
                </label>
                <input
                  id="ev-label"
                  className="input-field"
                  placeholder="Ej: Curso de formacion"
                  {...eventForm.register("label")}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                  htmlFor="ev-code"
                >
                  Codigo (opcional)
                </label>
                <select
                  id="ev-code"
                  className="input-field"
                  style={{ appearance: "auto" }}
                  {...eventForm.register("code")}
                >
                  <option value="">Sin codigo</option>
                  {CODES.map((c) => (
                    <option key={c} value={c}>
                      {c} - {CODE_SHORT[c]}
                    </option>
                  ))}
                </select>
              </div>
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
                Crear evento
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
          Cargando eventos...
        </div>
      ) : events.length === 0 ? (
        <div
          className="surface-elevated"
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            No hay eventos
          </p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Crea eventos con horarios personalizados
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {events.map((ev) => (
            <div key={ev.id} className="surface" style={{ padding: "1rem 1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                      {ev.people?.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        background: "var(--bg)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      {ev.date}
                    </span>
                    {ev.start_time && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--accent)",
                          fontWeight: 600,
                        }}
                      >
                        {ev.start_time} {ev.end_time ? `- ${ev.end_time}` : ""}
                      </span>
                    )}
                    {ev.code && (
                      <span
                        className="badge"
                        style={{
                          background: CODE_COLORS[ev.code]?.bg || "var(--gray)",
                          color: "#fff",
                          width: "auto",
                          height: "auto",
                          padding: "0.125rem 0.375rem",
                          fontSize: "0.625rem",
                          borderRadius: "0.25rem",
                        }}
                      >
                        {ev.code}
                      </span>
                    )}
                  </div>
                  {ev.label && (
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {ev.label}
                    </p>
                  )}
                </div>
                <button
                  className="btn-ghost"
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.75rem",
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    color: "var(--red)",
                    fontFamily: "var(--font-sans)",
                    flexShrink: 0,
                  }}
                  onClick={() => handleDelete(ev.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
