"use client"

import type { ViewType } from "@/types"

const navItems: { id: ViewType; label: string; icon: string }[] = [
  { id: "setup", label: "Configurar", icon: "⚙" },
  { id: "calendario", label: "Calendario", icon: "▦" },
  { id: "resumen", label: "Resumen", icon: "◈" },
  { id: "planes", label: "Planes", icon: "📋" },
  { id: "eventos", label: "Eventos", icon: "📅" },
]

export default function Nav({
  currentView,
  onNavigate,
  calendarName,
  personName,
  onLogout,
}: {
  currentView: ViewType
  onNavigate: (v: ViewType) => void
  calendarName: string
  personName: string
  onLogout: () => void
}) {
  return (
    <>
      {/* Desktop nav */}
      <nav
        className="nav-glass desktop-only"
        style={{ padding: "0 1.5rem" }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "3.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <a
              href="/"
              className="nav-logo"
              onClick={(e) => {
                e.preventDefault()
                onNavigate("setup")
              }}
            >
              Calenadarier
            </a>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                background: "var(--bg)",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid var(--border)",
              }}
            >
              {calendarName} · {personName}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-link ${currentView === item.id ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <div
              style={{
                width: "1px",
                height: "1.5rem",
                background: "var(--border)",
                margin: "0 0.5rem",
              }}
            />
            <button onClick={onLogout} className="btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.5rem 0.75rem", background: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {navItems.map((item) => (
            <a
              key={item.id}
              href="#"
              className={currentView === item.id ? "active" : ""}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(item.id)
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onLogout()
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.125rem",
              padding: "0.375rem 0.75rem",
              fontSize: "0.625rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              textDecoration: "none",
              borderRadius: "var(--radius)",
            }}
          >
            <span className="nav-icon">🚪</span>
            <span>Salir</span>
          </a>
        </div>
      </nav>
    </>
  )
}
