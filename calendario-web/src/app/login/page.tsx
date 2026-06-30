import { Suspense } from "react"
import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "6rem 1.5rem 2rem" }}>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          Cargando...
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
