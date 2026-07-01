"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { batchAvailabilitySchema } from "@/lib/schemas"
import type { z } from "zod"
import { CODES, CODE_SHORT } from "@/lib/constants"
import type { Calendar, Person } from "@/types"

type BatchForm = z.infer<typeof batchAvailabilitySchema>

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
  const LIBRE = "__libre__"
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<BatchForm>({
    resolver: zodResolver(batchAvailabilitySchema),
    defaultValues: { personId: session.person_id, code: CODES[0], startDate: "", endDate: "" },
  })

  const selectedCode = watch("code")
  const isClear = selectedCode === LIBRE
  const [result, setResult] = useState<string | null>(null)

  async function handleFormSubmit(data: BatchForm) {
    setResult(null)
    try {
      const res = await fetch(`/api/calendars/${calendar.slug}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: data.personId,
          code: data.code === LIBRE ? null : data.code,
          start_date: data.startDate,
          end_date: data.endDate,
        }),
      })

      const response = await res.json()

      if (res.ok) {
        setResult(isClear ? `Limpiados ${response.updated} dias` : `Actualizados ${response.updated} dias como ${data.code}`)
        setTimeout(onComplete, 1500)
      } else {
        setResult(response.error || "Error")
      }
    } catch {
      setResult("Error de conexion")
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
          }}
        >
          Marcar rango
        </h3>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          noValidate
        >
          <div>
            <label
              htmlFor="batch-person"
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
              id="batch-person"
              className="input-field"
              style={{ appearance: "auto" }}
              aria-invalid={errors.personId ? "true" : "false"}
              {...register("personId")}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name || p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="batch-code"
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
              id="batch-code"
              className="input-field"
              style={{ appearance: "auto" }}
              {...register("code")}
            >
              <option value={LIBRE}>Limpiar (borrar codigo)</option>
              {CODES.map((c) => (
                <option key={c} value={c}>
                  {c} - {CODE_SHORT[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="batch-start"
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
              id="batch-start"
              className="input-field"
              type="date"
              aria-invalid={errors.startDate ? "true" : "false"}
              {...register("startDate")}
            />
          </div>

          <div>
            <label
              htmlFor="batch-end"
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
              id="batch-end"
              className="input-field"
              type="date"
              aria-invalid={errors.endDate ? "true" : "false"}
              {...register("endDate")}
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
              disabled={isSubmitting}
              style={{ flex: 1, opacity: isSubmitting ? 0.6 : 1, background: isClear ? "var(--red)" : undefined }}
            >
              {isSubmitting ? (isClear ? "Limpiando..." : "Aplicando...") : isClear ? "Limpiar" : "Aplicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
