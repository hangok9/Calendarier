"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema } from "@/lib/schemas"
import type { z } from "zod"

type ForgotForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: ForgotForm) {
    setServerError("")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const response = await res.json()
      if (!res.ok) {
        setServerError(response.error || "Error")
        return
      }
      setSent(true)
    } catch {
      setServerError("Error de conexion")
    }
  }

  return (
    <>
      <div className="bg-pattern" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="nav-logo" style={{ fontSize: "1.25rem" }}>
              Restablecer contrasena
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Introduce tu email y te enviaremos un enlace
            </p>
          </div>

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "1rem" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13L2 4" />
                </svg>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Si el email esta registrado, recibiras un enlace para restablecer tu contrasena.
              </p>
              <a href="/" style={{ color: "var(--accent)", fontSize: "0.8125rem", textDecoration: "none", display: "inline-block", marginTop: "1rem" }}>
                Volver al inicio
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} noValidate>
              <div>
                <label htmlFor="forgot-email" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                  Email
                </label>
                <input id="forgot-email" className="input-field" type="email" placeholder="tu@email.com"
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register("email")} />
                {errors.email && (
                  <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div role="alert" style={{ padding: "0.75rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>
                  {serverError}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}
                style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", opacity: isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </button>

              <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8125rem" }}>
                <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                  Volver al inicio
                </a>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  )
}
