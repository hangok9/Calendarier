"use client"

import { useEffect, useState } from "react"

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem("theme")
  if (stored === "dark") return true
  if (stored === "light") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light")
  }, [dark])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light")
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  )
}
