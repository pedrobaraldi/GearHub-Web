<template>
  <div>
    <PageHeader title="Comparar" accent="Produtos." subtitle="Compare até 4 produtos com scores, sub-categorias e prós/contras." />

    <div class="reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8" v-reveal>

    <!-- Product slots -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <template v-for="(slot, i) in slots" :key="i">
        <ProductCard v-if="slot" :product="slot">
          <button class="btn-outline w-full" @click="removeSlot(i)">Remover</button>
        </ProductCard>
        <button
          v-else
          class="group min-h-[220px] rounded-2xl border border-dashed border-gear-text/20 flex flex-col items-center justify-center gap-3 text-gear-muted hover:border-gear-accent hover:text-gear-text transition-colors duration-200"
          @click="openPicker(i)"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span class="text-sm">Adicionar produto</span>
        </button>
      </template>
    </div>

    <!-- Comparison table -->
    <div v-if="selectedProducts.length >= 2" class="space-y-4">
      <!-- Score overview -->
      <div class="card">
        <h3 class="editorial-eyebrow mb-4">Score geral</h3>
        <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${selectedProducts.length}, 1fr)` }">
          <div v-for="p in selectedProducts" :key="p.id" class="text-center">
            <p class="text-xs text-gear-muted mb-2 truncate">{{ p.name }}</p>
            <div
              class="font-display italic font-extrabold text-5xl leading-none tabular-nums text-gear-primary"
            >
              {{ p.score!.toFixed(1) }}
            </div>
            <div class="mt-3 h-1 bg-gear-surface rounded-full overflow-hidden mx-4">
              <div
                class="h-full rounded-full neon-bar transition-all duration-700"
                :style="{ width: `${(p.score! / 10) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sub-scores comparison -->
      <div class="card">
        <h3 class="editorial-eyebrow mb-4">Sub-scores</h3>
        <div class="space-y-3">
          <div v-for="label in subScoreLabels" :key="label">
            <p class="editorial-eyebrow mb-1.5">{{ label }}</p>
            <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${selectedProducts.length}, 1fr)` }">
              <div v-for="p in selectedProducts" :key="p.id">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1 bg-gear-surface rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full neon-bar transition-all duration-700"
                      :style="{ width: `${(getSubScore(p, label) / 10) * 100}%` }"
                    />
                  </div>
                  <span class="text-xs font-mono font-semibold w-7 text-right">
                    {{ getSubScore(p, label).toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="glass-card p-10 text-center">
      <AppIcon name="git-compare" class="w-8 h-8 mx-auto mb-4 text-gear-accent" />
      <p class="text-sm font-semibold mb-1">Nada para comparar ainda</p>
      <p class="text-xs text-gear-muted">Adicione pelo menos 2 produtos.</p>
    </div>

    <!-- Product picker modal -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="pickerOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="pickerOpen = false" />
        <div class="relative bg-gear-card border border-gear-border rounded-2xl w-full max-w-lg shadow-2xl">
          <div class="flex items-center justify-between p-5 border-b border-gear-border">
            <h3 class="font-semibold text-gear-text">Escolher produto</h3>
            <button class="p-1.5 rounded-lg hover:bg-gear-surface transition-colors" @click="pickerOpen = false">
              <svg class="w-4 h-4 text-gear-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-5 space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="p in availableProducts"
              :key="p.id"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-gear-surface cursor-pointer transition-all duration-200 group"
              @click="selectProduct(p)"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-gear-surface shrink-0">
                <img v-if="p.image" :src="p.image" :alt="p.name" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-gear-text group-hover:text-gear-primary transition-colors duration-200 truncate">{{ p.name }}</p>
                <p class="text-xs text-gear-muted">{{ p.brand }} · {{ p.category }}</p>
              </div>
              <ScoreBadge :score="p.score!" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useGearData'
import { useMockProducts, useMockReviews } from '~/composables/useGearData'

useHead({ title: 'Comparar · GearHub' })

const allProducts = useMockProducts()
const allReviews = useMockReviews()

const preselected = allProducts.find(p => p.id === useRoute().query.p) ?? null
const slots = ref<(Product | null)[]>([preselected, null, null, null])
const pickerOpen = ref(false)
const pickerSlot = ref(0)

const selectedProducts = computed(() => slots.value.filter(Boolean) as Product[])

const availableProducts = computed(() =>
  allProducts.filter(p => !slots.value.some(s => s?.id === p.id))
)

const subScoreLabels = ['Construção', 'Ergonomia', 'Sensor', 'Botões']

function getSubScore(product: Product, label: string): number {
  const review = allReviews.find(r => r.product.id === product.id)
  return review?.subScores.find(s => s.label === label)?.value ?? 7.0
}

function openPicker(i: number) {
  pickerSlot.value = i
  pickerOpen.value = true
}

function selectProduct(p: Product) {
  slots.value[pickerSlot.value] = p
  pickerOpen.value = false
}

function removeSlot(i: number) {
  slots.value[i] = null
}
</script>
