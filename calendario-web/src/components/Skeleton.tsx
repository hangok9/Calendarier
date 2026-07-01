export function SkeletonLine({ width = "100%", height = "1rem" }: { width?: string; height?: string }) {
  return <div className="skeleton" style={{ width, height }} />
}

const SKELETON_WIDTHS = ["80%", "65%", "90%", "70%", "85%"]

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="surface" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="surface" style={{ padding: "1rem" }}>
      <SkeletonLine height="2rem" width="100%" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <SkeletonLine width="6rem" />
          <SkeletonLine width="3rem" />
          <div style={{ flex: 1, display: "flex", gap: "0.5rem" }}>
            {Array.from({ length: 5 }).map((_, j) => (
              <SkeletonLine key={j} width="3rem" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "6rem 1.5rem 2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <SkeletonLine width="12rem" height="1.25rem" />
        <SkeletonLine width="20rem" height="2rem" />
        <SkeletonLine width="16rem" />
        <div style={{ marginTop: "1rem" }}>
          <SkeletonCard lines={5} />
        </div>
      </div>
    </div>
  )
}
