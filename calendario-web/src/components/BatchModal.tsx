"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { batchAvailabilitySchema } from "@/lib/schemas"
import type { z } from "zod"
import { CODES, CODE_SHORT } from "@/lib/constants"
import type { Calendar, Person } from "@/types"
import { useToast } from "./Toast"

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
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BatchForm>({
    resolver: zodResolver(batchAvailabilitySchema),
    defaultValues: { personId: session.person_id, code: CODES[0], startDate: "", endDate: "" },
  })

  const selectedCode = watch("code")
  const isClear = selectedCode === LIBRE
  const [serverError, setServerError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) focusable[0].focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const el = dialogRef.current
    if (!el) return
    const focusable = Array.from(
      el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [])

  async function handleFormSubmit(data: BatchForm) {
    setServerError(null)
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
        const msg = isClear
          ? `Limpiados ${response.updated} dias`
          : `Actualizados ${response.updated} dias como ${data.code}`
        toast(msg, "success")
        onComplete()
      } else {
        setServerError(response.error || "Error al procesar")
      }
    } catch {
      setServerError("Error de conexion")
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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-title"
        className="surface-elevated"
        style={{
          width: "100%",
          maxWidth: "24rem",
          padding: "1.75rem",
          animation: "slideDown 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h3
          id="batch-title"
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
              aria-describedby={errors.personId ? "batch-person-err" : undefined}
              {...register("personId")}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name || p.name}
                </option>
              ))}
            </select>
            {errors.personId && (
              <p id="batch-person-err" role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                {errors.personId.message}
              </p>
            )}
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
              aria-describedby={errors.startDate ? "batch-start-err" : undefined}
              {...register("startDate")}
            />
            {errors.startDate && (
              <p id="batch-start-err" role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                {errors.startDate.message}
              </p>
            )}
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
              aria-describedby={errors.endDate ? "batch-end-err" : undefined}
              {...register("endDate")}
            />
            {errors.endDate && (
              <p id="batch-end-err" role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                {errors.endDate.message}
              </p>
            )}
          </div>

          {serverError && (
            <div role="alert" style={{ padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center", fontWeight: 600 }}>
              {serverError}
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
