<template>
  <div>
    <PageHeader title="Explorar" accent="Produtos." subtitle="Encontre produtos por nome, marca ou categoria." />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-4">
      <div class="relative">
        <AppIcon name="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gear-muted" />
        <input
          v-model="search"
          type="search"
          placeholder="Buscar produto ou marca..."
          aria-label="Buscar produto ou marca"
          class="w-full bg-gear-surface border border-gear-border rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm text-gear-text placeholder-gear-muted"
        />
      </div>

      <CategoryFilter v-model="category" />

      <p class="editorial-eyebrow" aria-live="polite">{{ products.length }} {{ products.length === 1 ? 'produto' : 'produtos' }}</p>

      <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product">
          <NuxtLink :to="{ path: '/compare', query: { p: product.id } }" class="btn-outline w-full">Comparar</NuxtLink>
        </ProductCard>
      </div>

      <div v-else class="glass-card p-10 text-center">
        <p class="text-sm font-semibold mb-1">Nenhum produto encontrado</p>
        <p class="text-xs text-gear-muted mb-5">Tente outro termo ou limpe os filtros.</p>
        <button class="btn-primary" @click="clearFilters">Limpar filtros</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useGearData'
import { useMockProducts } from '~/composables/useGearData'

useHead({ title: 'Explorar · GearHub' })

const allProducts = useMockProducts()
const search = useState('explore-search', () => '')
const category = useState<Category>('explore-category', () => 'Todos')

const products = computed(() => {
  const term = search.value.trim().toLowerCase()
  return allProducts.filter(p =>
    (category.value === 'Todos' || p.category === category.value)
    && (!term || `${p.name} ${p.brand}`.toLowerCase().includes(term)),
  )
})

function clearFilters() {
  search.value = ''
  category.value = 'Todos'
}
</script>
