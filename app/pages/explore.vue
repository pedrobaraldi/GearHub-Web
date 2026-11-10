<template>
  <div>
    <PageHeader root title="Explorar" accent="Produtos." subtitle="Encontre produtos por nome, marca ou categoria." />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-4">
      <SearchBar v-model="search" placeholder="Buscar por nome, marca, categoria ou especificação..." />

      <CategoryFilter v-model="category" />

      <p class="editorial-eyebrow" aria-live="polite">{{ products.length }} {{ products.length === 1 ? 'produto' : 'produtos' }}</p>

      <div v-if="products.length" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product">
          <!-- Comparar discreto: o produto é o destaque do card -->
          <NuxtLink
            :to="{ path: '/compare', query: { p: product.id } }"
            class="w-8 h-8 grid place-items-center rounded-full border border-gear-border text-gear-muted hover:text-gear-accent hover:border-gear-accent transition-colors"
            :aria-label="`Comparar ${product.name}`"
            title="Comparar"
          >
            <AppIcon name="git-compare" class="w-3.5 h-3.5" />
          </NuxtLink>
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
import { matchesSearch, productSearchFields } from '~/utils/search'

useHead({ title: 'Explorar · GearHub' })

const { products: allProducts } = await useCatalog()
const search = useState('explore-search', () => '')
const category = useState<Category>('explore-category', () => 'Todos')

const products = computed(() => allProducts.value.filter(p =>
  (category.value === 'Todos' || p.category === category.value)
  && matchesSearch(search.value, ...productSearchFields(p)),
))

function clearFilters() {
  search.value = ''
  category.value = 'Todos'
}
</script>
