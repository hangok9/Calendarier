export default function NotFound() {
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
          textAlign: "center",
        }}
      >
        <div className="surface-elevated" style={{ padding: "3rem 2rem" }}>
          <div
            style={{
              fontSize: "4rem",
              fontWeight: 900,
              lineHeight: 1,
              background: "var(--accent-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "1rem",
            }}
          >
            404
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Pagina no encontrada
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            La pagina que buscas no existe o ha sido movida.
          </p>
          <a
            href="/dashboard"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, var(--accent), #2563eb)",
              borderRadius: "var(--radius)",
              textDecoration: "none",
            }}
          >
            Volver al dashboard
          </a>
        </div>
      </main>
    </>
  )
}
