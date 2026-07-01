"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "@/lib/schemas"
import type { z } from "zod"

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(data: RegisterForm) {
    setServerError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const response = await res.json()

      if (!res.ok) {
        setServerError(response.error || "Error al crear la cuenta")
        return
      }

      router.push("/dashboard")
    } catch {
      setServerError("Error de conexion")
    }
  }

  return (
    <>
      <div className="bg-pattern" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <main
        style={{
          maxWidth: "28rem",
          margin: "0 auto",
          padding: "6rem 1.5rem 2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <a href="/" style={{ color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
            ← Volver al inicio
          </a>
        </div>

        <div className="surface-elevated" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="nav-logo" style={{ fontSize: "1.5rem" }}>
              Crear cuenta
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              Registrate para acceder a tus calendarios
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            noValidate
          >
            <div>
              <label htmlFor="register-email" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Email <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(opcional)</span>
              </label>
              <input
                id="register-email"
                className="input-field"
                type="email"
                placeholder="tu@email.com"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email")}
              />
              {errors.email && (
                <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-username" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Nombre de usuario
              </label>
              <input
                id="register-username"
                className="input-field"
                type="text"
                placeholder="Elige un nombre de usuario"
                autoFocus
                aria-invalid={errors.username ? "true" : "false"}
                {...register("username", {
                  onChange: (e) => { e.target.value = e.target.value.toLowerCase() },
                })}
              />
              {errors.username && (
                <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-password" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Contrasena
              </label>
              <input
                id="register-password"
                className="input-field"
                type="password"
                placeholder="Min. 6 caracteres"
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password")}
              />
              {errors.password && (
                <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-confirm" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Confirmar contrasena
              </label>
              <input
                id="register-confirm"
                className="input-field"
                type="password"
                placeholder="Repite la contrasena"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                {...register("confirmPassword")}
              />
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", opacity: isSubmitting ? 0.6 : 1 }}
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Ya tienes cuenta?{" "}
            <a href="/" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              Iniciar sesion
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
