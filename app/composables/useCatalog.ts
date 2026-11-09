import type { Product } from '~/composables/useGearData'

interface ApiProduct {
  slug: string
  name: string
  brand: string
  category: string
  imageUrl: string | null
  avgScore: number | null
  reviewCount: number
}

export function toProduct(product: ApiProduct): Product {
  return {
    id: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    image: product.imageUrl ?? undefined,
    score: product.avgScore ?? undefined,
    reviewCount: product.reviewCount,
  }
}

/** Melhor nota primeiro; só entram produtos já avaliados. */
export function ranked(products: Product[]): Product[] {
  return products
    .filter(product => product.score !== undefined)
    .sort((a, b) => b.score! - a.score! || b.reviewCount! - a.reviewCount!)
}

/** Produtos da API e as categorias que têm algum produto. */
export async function useCatalog() {
  const [{ data }, { data: allCategories }] = await Promise.all([
    useFetch<ApiProduct[]>('/api/v1/products', { key: 'catalog' }),
    useFetch<{ slug: string, name: string }[]>('/api/v1/categories', { key: 'catalog-categories' }),
  ])

  const products = computed(() => (data.value ?? []).map(toProduct))
  const categories = computed(() =>
    (allCategories.value ?? []).filter(category => products.value.some(product => product.category === category.name)),
  )

  return { products, categories }
}
