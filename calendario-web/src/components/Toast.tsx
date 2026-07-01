"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import type { ReactNode } from "react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export function useToast() {
  return useContext(Ctx)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-label="Notificaciones"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: "22rem",
          width: "100%",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  )
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      role="alert"
      style={{
        pointerEvents: "auto",
        padding: "0.75rem 1rem",
        borderRadius: "var(--radius)",
        background: toast.type === "success"
          ? "var(--green)"
          : toast.type === "error"
          ? "var(--red)"
          : "var(--text-secondary)",
        color: "#fff",
        fontSize: "0.875rem",
        fontWeight: 600,
        boxShadow: "var(--shadow-lg)",
        animation: "slideIn 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
      }}
    >
      <span>{toast.message}</span>
      <button
        onClick={onDone}
        aria-label="Cerrar notificacion"
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          opacity: 0.8,
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0.25rem",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}
