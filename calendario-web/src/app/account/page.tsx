"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateProfileSchema, changePasswordSchema } from "@/lib/schemas"
import type { z } from "zod"
import { SkeletonPage } from "@/components/Skeleton"

type EmailForm = z.infer<typeof updateProfileSchema>
type PasswordForm = z.infer<typeof changePasswordSchema>

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string; email: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailMsg, setEmailMsg] = useState("")
  const [pwMsg, setPwMsg] = useState("")

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { email: "" },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  })

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.replace("/")
          return
        }
        setUser(data.user)
        emailForm.reset({ email: data.user?.email || "" })
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false))
  }, [router, emailForm])

  async function handleUpdateEmail(data: EmailForm) {
    setEmailMsg("")
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email?.trim() || null }),
      })
      const response = await res.json()
      if (!res.ok) {
        emailForm.setError("root", { message: response.error || "Error al actualizar email" })
        return
      }
      setUser((u) => (u ? { ...u, email: response.email } : u))
      setEmailMsg("Email actualizado correctamente")
    } catch {
      emailForm.setError("root", { message: "Error de conexion" })
    }
  }

  async function handleChangePassword(data: PasswordForm) {
    setPwMsg("")
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const response = await res.json()
      if (!res.ok) {
        passwordForm.setError("root", { message: response.error || "Error al cambiar contrasena" })
        return
      }
      setPwMsg("Contrasena actualizada correctamente")
      passwordForm.reset()
    } catch {
      passwordForm.setError("root", { message: "Error de conexion" })
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  if (loading) {
    return <SkeletonPage />
  }

  return (
    <>
      <div className="bg-pattern" /><div className="bg-glow" /><div className="bg-glow-2" />

      <main style={{ maxWidth: "36rem", margin: "0 auto", padding: "6rem 1.5rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
            ← Volver al dashboard
          </a>
        </div>

        {/* Profile */}
        <div className="surface-elevated" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="nav-logo" style={{ fontSize: "1.25rem" }}>
              Configuracion de cuenta
            </div>
          </div>

          {/* Username */}
          <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "var(--bg)", border: "1px solid var(--border-light)", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Usuario</div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>{user?.username}</div>
          </div>

          {/* Email */}
          <form onSubmit={emailForm.handleSubmit(handleUpdateEmail)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} noValidate>
            <div>
              <label htmlFor="account-email" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
                Email
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    id="account-email"
                    className="input-field"
                    type="email"
                    placeholder="tu@email.com"
                    aria-invalid={emailForm.formState.errors.email ? "true" : "false"}
                    aria-describedby="account-email-hint"
                    style={{ flex: 1 }}
                    {...emailForm.register("email")}
                  />
                <button type="submit" className="btn btn-primary" disabled={emailForm.formState.isSubmitting}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  {emailForm.formState.isSubmitting ? "..." : "Guardar"}
                </button>
              </div>
              <span id="account-email-hint" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                {user?.email ? "Dejalo vacio para eliminar el email." : "Opcional. Necesario para recuperar contrasena."}
              </span>
              {emailForm.formState.errors.email && (
                <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div aria-live="polite">
              {emailMsg && <div role="status" style={{ padding: "0.625rem", borderRadius: "var(--radius)", background: "var(--green-soft, #dcfce7)", color: "var(--green, #16a34a)", fontSize: "0.8125rem", textAlign: "center" }}>{emailMsg}</div>}
              {emailForm.formState.errors.root && <div role="alert" style={{ padding: "0.625rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>{emailForm.formState.errors.root.message}</div>}
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="surface-elevated" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Cambiar contrasena</h2>
          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} noValidate>
            <div>
              <label htmlFor="pw-old" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Contrasena actual</label>
              <input id="pw-old" className="input-field" type="password" placeholder="Tu contrasena actual"
                aria-invalid={passwordForm.formState.errors.oldPassword ? "true" : "false"}
                {...passwordForm.register("oldPassword")} />
              {passwordForm.formState.errors.oldPassword && (
                <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                  {passwordForm.formState.errors.oldPassword.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="pw-new" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Contrasena nueva</label>
              <input id="pw-new" className="input-field" type="password" placeholder="Min. 6 caracteres"
                aria-invalid={passwordForm.formState.errors.newPassword ? "true" : "false"}
                {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && (
                <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="pw-confirm" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.375rem" }}>Confirmar contrasena nueva</label>
              <input id="pw-confirm" className="input-field" type="password" placeholder="Repite la contrasena nueva"
                aria-invalid={passwordForm.formState.errors.confirmPassword ? "true" : "false"}
                {...passwordForm.register("confirmPassword")} />
              {passwordForm.formState.errors.confirmPassword && (
                <p role="alert" style={{ fontSize: "0.75rem", color: "var(--red)", marginTop: "0.25rem" }}>
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            {passwordForm.formState.errors.root && <div role="alert" style={{ padding: "0.625rem", borderRadius: "var(--radius)", background: "var(--red-soft)", color: "var(--red)", fontSize: "0.8125rem", textAlign: "center" }}>{passwordForm.formState.errors.root.message}</div>}
            {pwMsg && <div role="status" style={{ padding: "0.625rem", borderRadius: "var(--radius)", background: "var(--green-soft, #dcfce7)", color: "var(--green, #16a34a)", fontSize: "0.8125rem", textAlign: "center" }}>{pwMsg}</div>}
            <button type="submit" className="btn btn-primary" disabled={passwordForm.formState.isSubmitting}
              style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", opacity: passwordForm.formState.isSubmitting ? 0.6 : 1 }}>
              {passwordForm.formState.isSubmitting ? "Guardando..." : "Cambiar contrasena"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={handleLogout} className="btn-ghost"
            style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text-muted)" }}>
            Cerrar sesion
          </button>
        </div>
      </main>
    </>
  )
}
