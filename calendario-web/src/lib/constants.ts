export const CODES = ["TM", "TT", "TN", "FV", "FN", "OC", "RE", "OT", "CL"] as const
export type Code = (typeof CODES)[number]

export const CODE_MEANINGS: Record<string, string> = {
  TM: "Trabajar manana (~08-15)",
  TT: "Trabajar tarde (~15-21)",
  TN: "Trabajar noche (~21-08)",
  FV: "Fuera (puedo volver)",
  FN: "Fuera (NO volver)",
  OC: "Ocupado",
  RE: "Recuperaciones",
  OT: "Otros",
  CL: "Clases",
}

export const CODE_SHORT: Record<string, string> = {
  TM: "Manana",
  TT: "Tarde",
  TN: "Noche",
  FV: "Fuera (vuelve)",
  FN: "Fuera (no vuelve)",
  OC: "Ocupado",
  RE: "Recuperacion",
  OT: "Otros",
  CL: "Clases",
}

export const CODE_COLORS: Record<
  string,
  { bg: string; text: string; chipBg: string; chipText: string }
> = {
  TM: { bg: "#22C55E", text: "#fff", chipBg: "var(--green-soft)", chipText: "#166534" },
  TT: { bg: "#10B981", text: "#fff", chipBg: "var(--emerald-soft)", chipText: "#065F46" },
  TN: { bg: "#059669", text: "#fff", chipBg: "#D1FAE5", chipText: "#064E3B" },
  FV: { bg: "#F97316", text: "#fff", chipBg: "var(--orange-soft)", chipText: "#92400E" },
  FN: { bg: "#EF4444", text: "#fff", chipBg: "var(--red-soft)", chipText: "#991B1B" },
  OC: { bg: "#6B7280", text: "#fff", chipBg: "var(--gray-soft)", chipText: "#1F2937" },
  RE: { bg: "#A855F7", text: "#fff", chipBg: "var(--purple-soft)", chipText: "#6B21A8" },
  OT: { bg: "#14B8A6", text: "#fff", chipBg: "var(--teal-soft)", chipText: "#115E59" },
  CL: { bg: "#F59E0B", text: "#fff", chipBg: "var(--amber-soft)", chipText: "#92400E" },
}

export const HIDDEN_IN_GRID = new Set(["FN", "OC", "RE", "OT"])
export const SHOWN_IN_GRID = new Set(["TM", "TT", "TN", "FV", "CL"])

export const MONTH_NAMES: Record<number, string> = {
  1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril",
  5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto",
  9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre",
}

export const MONTH_SHORT: Record<number, string> = {
  1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr",
  5: "May", 6: "Jun", 7: "Jul", 8: "Ago",
  9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic",
}

export const DAY_NAMES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
