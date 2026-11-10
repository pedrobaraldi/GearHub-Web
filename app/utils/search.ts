import type { Product } from '~/composables/useGearData'

// Busca na tela, enquanto a pessoa digita: sem acento, sem maiúscula, e cada palavra pode estar em qualquer campo
export function normalizeSearch(text: string) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

export function matchesSearch(term: string, ...fields: (string | number | null | undefined)[]) {
  const words = normalizeSearch(term).split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const haystack = normalizeSearch(fields.filter(field => field !== null && field !== undefined).join(' '))
  return words.every(word => haystack.includes(word))
}

// Tudo o que dá para buscar num produto: nome, marca, categoria e ficha técnica
export function productSearchFields(product: Product) {
  return [product.name, product.brand, product.category, product.id, ...(product.specs ?? []).flatMap(spec => [spec.label, spec.value])]
}
