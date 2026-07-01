import { useMemo } from "react"
import type { Availability } from "@/types"

export function useAvailMap(availability: Availability[]): Map<string, string | null> {
  return useMemo(() => {
    const map = new Map<string, string | null>()
    for (const a of availability) {
      map.set(`${a.person_id}:${a.date}`, a.code)
    }
    return map
  }, [availability])
}

export function getCode(availMap: Map<string, string | null>, personId: string, dateStr: string): string | null {
  return availMap.get(`${personId}:${dateStr}`) ?? null
}
