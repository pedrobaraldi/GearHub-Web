<template>
  <div>
    <PageHeader root title="Top" accent="Rankings." subtitle="Os melhores produtos avaliados pela comunidade." />

    <div class="reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8" v-reveal>

    <SearchBar v-model="search" class="mb-4" placeholder="Buscar produto ou marca..." />

    <!-- Category filter -->
    <div class="mb-6">
      <CategoryFilter v-model="activeCategory" />
    </div>

    <!-- Pódio: os três primeiros em cards, o primeiro em destaque -->
    <ol v-if="podium.length" class="grid sm:grid-cols-3 gap-4 mb-4" aria-label="Três primeiros">
      <li v-for="product in podium" :key="product.id">
        <NuxtLink
          :to="productPath(product)"
          class="glass-card neon-hover group relative flex flex-col h-full p-5 overflow-hidden"
          :class="{ '!border-gear-primary/60': product.rank === 1 }"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="font-display italic font-extrabold text-5xl leading-none tabular-nums" :class="product.rank === 1 ? 'text-gear-primary' : 'text-gear-muted'">{{ String(product.rank).padStart(2, '0') }}</span>
            <span class="font-display italic font-extrabold text-3xl leading-none tabular-nums text-gear-primary">{{ product.score?.toFixed(1) }}</span>
          </div>
          <div class="aspect-[4/3] my-4 rounded-xl bg-white grid place-items-center overflow-hidden">
            <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy" class="max-w-[80%] max-h-[80%] object-contain transition-transform duration-300 group-hover:scale-105" />
          </div>
          <p class="font-semibold truncate group-hover:text-gear-primary transition-colors">{{ product.name }}</p>
          <p class="text-xs text-gear-muted mt-0.5">{{ product.brand }}, {{ product.category }}</p>
          <p class="text-xs text-gear-muted mt-auto pt-3">{{ product.reviewCount }} review{{ product.reviewCount !== 1 ? 's' : '' }}</p>
        </NuxtLink>
      </li>
    </ol>

    <!-- Do quarto em diante: lista com a nota em barra -->
    <div v-if="rest.length" class="glass-card overflow-hidden">
      <TransitionGroup tag="ol" name="rank-list" :start="4">
        <li
          v-for="product in rest"
          :key="product.id"
          class="relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem_12rem] gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b border-gear-border/50 last:border-b-0 hover:bg-gear-surface transition-colors duration-150 group items-center"
        >
          <span class="font-display italic font-extrabold text-lg leading-none text-center text-gear-muted tabular-nums">{{ String(product.rank).padStart(2, '0') }}</span>
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 grid place-items-center">
              <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy" class="max-w-[85%] max-h-[85%] object-contain" />
            </div>
            <div class="min-w-0">
              <NuxtLink :to="productPath(product)" class="block font-semibold text-sm truncate group-hover:text-gear-primary transition-colors after:absolute after:inset-0">{{ product.name }}</NuxtLink>
              <p class="text-xs text-gear-muted truncate">{{ product.brand }}<span class="sm:hidden">, {{ product.category }}</span></p>
            </div>
          </div>
          <span class="hidden sm:block text-xs text-gear-muted">{{ product.category }}</span>
          <div class="flex items-center gap-3">
            <div class="hidden sm:block flex-1 h-1.5 rounded-full bg-gear-surface overflow-hidden" aria-hidden="true">
              <div class="h-full rounded-full neon-bar" :style="{ width: `${((product.score ?? 0) / 10) * 100}%` }" />
            </div>
            <span class="font-mono text-sm font-semibold tabular-nums w-8 text-right">{{ product.score?.toFixed(1) }}</span>
          </div>
        </li>
      </TransitionGroup>
    </div>

      <div v-if="filteredProducts.length === 0" class="glass-card py-12 text-center">
        <p class="text-gear-muted text-sm">{{ search.trim() ? 'Nenhum produto encontrado.' : 'Nenhum produto avaliado nessa categoria ainda.' }}</p>
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

// Pódio só aparece com a lista completa; numa busca, todos ficam na lista com a posição real
const podium = computed(() => (search.value.trim() ? [] : filteredProducts.value.slice(0, 3)))
const rest = computed(() => (search.value.trim() ? filteredProducts.value : filteredProducts.value.slice(3)))
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
