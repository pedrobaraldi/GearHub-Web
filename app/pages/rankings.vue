<template>
  <div>
    <PageHeader root title="Top" accent="Rankings." subtitle="Os melhores produtos avaliados pela comunidade." />

    <div class="reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8" v-reveal>

    <SearchBar v-model="search" class="mb-4" placeholder="Buscar produto ou marca..." />

    <!-- Category filter -->
    <div class="mb-6">
      <CategoryFilter v-model="activeCategory" />
    </div>

    <!-- Rankings list -->
    <div class="glass-card overflow-hidden">
      <!-- Table header -->
      <div class="grid grid-cols-[2rem_1fr_auto_auto] sm:grid-cols-[2.5rem_1fr_7rem_6rem_5rem] gap-4 px-5 py-3 border-b border-gear-border">
        <span class="editorial-eyebrow">#</span>
        <span class="editorial-eyebrow">Produto</span>
        <span class="editorial-eyebrow hidden sm:block">Categoria</span>
        <span class="editorial-eyebrow hidden sm:block">Reviews</span>
        <span class="editorial-eyebrow text-right">Score</span>
      </div>

      <!-- Rows -->
      <TransitionGroup tag="div" name="rank-list">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="relative grid grid-cols-[2rem_1fr_auto_auto] sm:grid-cols-[2.5rem_1fr_7rem_6rem_5rem] gap-4 px-5 py-3.5 border-b border-gear-border/50 hover:bg-gear-surface transition-colors duration-150 group items-center"
        >
          <!-- Rank -->
          <span
            class="font-display italic font-extrabold text-lg leading-none text-center"
            :class="rankColor(product.rank!)"
          >
            {{ String(product.rank).padStart(2, '0') }}
          </span>

          <!-- Product info -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg overflow-hidden bg-gear-surface shrink-0 border border-gear-border">
              <img loading="lazy"
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-5 h-5 text-gear-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"/></svg>
              </div>
            </div>
            <div class="min-w-0">
              <NuxtLink :to="productPath(product)" class="block font-semibold text-sm text-gear-text group-hover:text-gear-primary transition-colors duration-200 truncate after:absolute after:inset-0">{{ product.name }}</NuxtLink>
              <p class="text-xs text-gear-muted">{{ product.brand }}</p>
            </div>
          </div>

          <!-- Category chip -->
          <span class="hidden sm:block text-xs text-gear-muted text-center">{{ product.category }}</span>

          <!-- Review count -->
          <span class="hidden sm:block text-xs text-gear-muted text-center">
            {{ product.reviewCount }} review{{ product.reviewCount !== 1 ? 's' : '' }}
          </span>

          <!-- Score -->
          <div class="flex justify-end">
            <ScoreBadge :score="product.score!" />
          </div>
        </div>
      </TransitionGroup>

      <div v-if="filteredProducts.length === 0" class="py-12 text-center">
        <p class="text-gear-muted text-sm">{{ search.trim() ? 'Nenhum produto encontrado.' : 'Nenhum produto avaliado nessa categoria ainda.' }}</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useGearData'
import { productPath } from '~/composables/useGearData'

useHead({ title: 'Rankings · GearHub' })

const activeCategory = ref<Category>('Todos')
const search = ref('')
const { products } = await useCatalog()

const filteredProducts = computed(() =>
  ranked(products.value)
    .filter(p => activeCategory.value === 'Todos' || p.category === activeCategory.value)
    .map((p, index) => ({ ...p, rank: index + 1 }))
    // A busca não muda a posição do produto no ranking
    .filter(p => `${p.brand} ${p.name}`.toLowerCase().includes(search.value.trim().toLowerCase())),
)

function rankColor(rank: number) {
  return rank === 1 ? 'text-gear-primary' : 'text-gear-muted'
}
</script>

<style scoped>
.rank-list-enter-active,
.rank-list-leave-active {
  transition: all 0.3s ease;
}
.rank-list-enter-from,
.rank-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
