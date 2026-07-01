import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/Toast"

export const metadata: Metadata = {
  title: "Calenadarier — Disponibilidad de Grupo",
  description: "Gestiona la disponibilidad de tu grupo de trabajo",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="skip-link" style={{ position: "absolute", left: "-9999px", top: 0, zIndex: 999, padding: "0.75rem 1.5rem", background: "var(--accent)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
          Saltar al contenido principal
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
