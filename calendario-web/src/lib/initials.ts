const GREEK_LETTERS = ['γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω']

function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function computeInitialsMap(
  people: { id: string; name: string; primer_apellido?: string | null; segundo_apellido?: string | null }[]
): Map<string, string> {
  const map = new Map<string, string>()
  const freq = new Map<string, number>()

  for (const p of people) {
    let init = p.name.charAt(0).toUpperCase()
    if (p.primer_apellido) {
      init += p.primer_apellido.charAt(0).toUpperCase()
    }
    map.set(p.id, init)
    freq.set(init, (freq.get(init) || 0) + 1)
  }

  for (const p of people) {
    const cur = map.get(p.id)!
    if ((freq.get(cur) || 0) > 1 && p.segundo_apellido) {
      map.set(p.id, p.name.charAt(0).toUpperCase() + p.segundo_apellido.charAt(0).toUpperCase())
    }
  }

  const freq2 = new Map<string, number>()
  for (const init of map.values()) {
    freq2.set(init, (freq2.get(init) || 0) + 1)
  }

  const usedGreek = new Set<string>()
  for (const p of people) {
    const cur = map.get(p.id)!
    if ((freq2.get(cur) || 0) > 1) {
      let idx = hashId(p.id) % GREEK_LETTERS.length
      let greek = GREEK_LETTERS[idx]
      while (usedGreek.has(greek)) {
        idx = (idx + 1) % GREEK_LETTERS.length
        greek = GREEK_LETTERS[idx]
      }
      map.set(p.id, greek)
      usedGreek.add(greek)
    }
  }

  return map
}
