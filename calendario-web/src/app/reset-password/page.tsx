"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema } from "@/lib/schemas"
import type { z } from "zod"

type ResetForm = z.infer<typeof resetPasswordSchema>

function ResetFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(data: ResetForm) {
    setServerError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      })
      const response = await res.json()
      if (!res.ok) {
        setServerError(response.error || "Error al restablecer la contrasena")
        return
      }
      setSuccess(true)
      setTimeout(() => router.push("/"), 3000)
    } catch {
      setServerError("Error de conexion")
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
        <p>Enlace invalido. Solicita un nuevo restablecimiento.</p>
        <a href="/" style={{ color: "var(--accent)" }}>Volver al inicio</a>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }} aria-hidden="true">✓</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Contrasena actualizada</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Redirigiendo al inicio...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} noValidate>
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.375rem" }}>Nueva contrasena</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
          Elige una contrasena nueva para tu cuenta
        </p>
      </div>

      <div>
        <label htmlFor="reset-password" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
          Contrasena nueva
        </label>
        <input id="reset-password" className="input-field" type="password" placeholder="Min. 6 caracteres"
          aria-invalid={errors.password ? "true" : "false"}
          {...register("password")} />
        {errors.password && (
          <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="reset-confirm" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
          Confirmar contrasena
        </label>
        <input id="reset-confirm" className="input-field" type="password" placeholder="Repite la contrasena"
          aria-invalid={errors.confirmPassword ? "true" : "false"}
          {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
            {errors.confirmPassword.message}
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
        {isSubmitting ? "Guardando..." : "Cambiar contrasena"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <>
      <div className="bg-pattern" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <Suspense fallback={<div style={{ textAlign: "center", color: "var(--text-muted)" }}>Cargando...</div>}>
            <ResetFormInner />
          </Suspense>
        </div>
      </main>
    </>
  )
}
