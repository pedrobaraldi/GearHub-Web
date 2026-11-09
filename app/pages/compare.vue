<template>
  <div>
    <PageHeader root title="Comparar" accent="Produtos." subtitle="Coloque dois produtos lado a lado, ou até quatro, e compare a nota geral e cada critério." />

    <div class="reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8" v-reveal>

    <div class="relative mb-6">
      <SearchBar v-model="search" placeholder="Buscar produto para comparar..." />
      <!-- Resultados por cima da página, sem empurrar os produtos escolhidos -->
      <div v-if="search.trim() && !pickerOpen" class="absolute z-30 inset-x-0 top-full mt-1 glass-card !bg-gear-sidebar p-1 max-h-72 overflow-y-auto shadow-lg shadow-black/30">
        <button
          v-for="p in availableProducts"
          :key="p.id"
          type="button"
          class="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-gear-surface transition-colors disabled:opacity-50"
          :disabled="freeSlot < 0 && slots.length >= MAX_SLOTS"
          @click="addProduct(p)"
        >
          <span class="w-9 h-9 rounded-lg overflow-hidden bg-gear-surface shrink-0">
            <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" class="w-full h-full object-cover" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block font-medium text-sm truncate">{{ p.name }}</span>
            <span class="block text-xs text-gear-muted">{{ p.brand }} · {{ p.category }}</span>
          </span>
        </button>
        <p v-if="!availableProducts.length" class="text-sm text-gear-muted text-center py-6">Nenhum produto encontrado.</p>
      </div>
    </div>

    <!-- Dois espaços fixos; mais dois sob demanda -->
    <div class="grid grid-cols-2 gap-3 sm:gap-4" :class="{ 'lg:grid-cols-3': slots.length === 3, 'lg:grid-cols-4': slots.length === 4 }">
      <template v-for="(slot, i) in slots" :key="i">
        <ProductCard v-if="slot" :product="slot">
          <button type="button" class="text-xs font-semibold text-gear-muted hover:text-gear-red transition-colors" @click="removeSlot(i)">Remover</button>
        </ProductCard>
        <button
          v-else
          class="group min-h-[120px] sm:min-h-[220px] rounded-2xl border border-dashed border-gear-text/20 flex flex-col items-center justify-center gap-2 sm:gap-3 text-gear-muted hover:border-gear-accent hover:text-gear-text transition-colors duration-200"
          @click="openPicker(i)"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span class="text-sm">Adicionar produto</span>
        </button>
      </template>
    </div>
    <div class="flex justify-center mt-3 mb-6 sm:mb-8">
      <!-- Só aparece com os espaços atuais preenchidos -->
      <button v-if="slots.length < MAX_SLOTS && selectedProducts.length === slots.length" type="button" class="btn-outline" @click="addSlot">
        <AppIcon name="plus" class="w-4 h-4" />
        Adicionar outro produto
      </button>
    </div>

    <!-- Comparison table -->
    <div v-if="selectedProducts.length >= 2" class="space-y-4">
      <!-- Score overview -->
      <div class="card">
        <h3 class="editorial-eyebrow mb-4">Score geral</h3>
        <div class="grid gap-2 sm:gap-4" :style="{ gridTemplateColumns: `repeat(${selectedProducts.length}, minmax(0, 1fr))` }">
          <div v-for="p in selectedProducts" :key="p.id" class="text-center">
            <p class="text-xs text-gear-muted mb-2 truncate">{{ p.name }}</p>
            <div
              class="font-display italic font-extrabold text-3xl sm:text-5xl leading-none tabular-nums text-gear-primary"
            >
              {{ p.score?.toFixed(1) ?? '—' }}
            </div>
            <div class="mt-3 h-1 bg-gear-surface rounded-full overflow-hidden mx-1 sm:mx-4">
              <div
                class="h-full rounded-full neon-bar transition-all duration-700"
                :style="{ width: `${((p.score ?? 0) / 10) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sub-scores comparison -->
      <div v-if="!subScoreLabels.length" class="card text-sm text-gear-muted">
        Sem critérios em comum. Compare produtos da mesma categoria, com reviews, para ver as notas lado a lado.
      </div>
      <div v-else class="card">
        <h3 class="editorial-eyebrow mb-4">Sub-scores</h3>
        <div class="space-y-3">
          <div v-for="label in subScoreLabels" :key="label">
            <p class="editorial-eyebrow mb-1.5">{{ label }}</p>
            <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${selectedProducts.length}, minmax(0, 1fr))` }">
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

    <AppModal :open="pickerOpen" title="Escolher produto" width-class="max-w-lg" @close="pickerOpen = false">
      <SearchBar v-model="search" class="mb-3" placeholder="Buscar produto ou marca..." />
      <div class="space-y-1">
        <button
          v-for="p in availableProducts"
          :key="p.id"
          type="button"
          class="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gear-surface transition-colors duration-200 group"
          @click="selectProduct(p)"
        >
          <span class="w-10 h-10 rounded-lg overflow-hidden bg-gear-surface shrink-0">
            <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" class="w-full h-full object-cover" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block font-medium text-sm text-gear-text group-hover:text-gear-primary transition-colors duration-200 truncate">{{ p.name }}</span>
            <span class="block text-xs text-gear-muted">{{ p.brand }} · {{ p.category }}</span>
          </span>
          <ScoreBadge v-if="p.score !== undefined" :score="p.score" />
        </button>
      </div>
    </AppModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useGearData'
import { toApiFailure } from '~/composables/useAuth'

interface ProductScores {
  scores: { label: string, value: number }[]
}

useHead({ title: 'Comparar · GearHub' })

const toast = useToast()
const { products } = await useCatalog()

const requested = useRoute().query.p
const preselected = products.value.find(p => p.id === requested) ?? null
// Dois espaços fixos; dá para abrir mais dois
const FIXED_SLOTS = 2
const MAX_SLOTS = 4
const slots = ref<(Product | null)[]>([preselected, null])
const scoresByProduct = ref<Record<string, ProductScores['scores']>>({})
const pickerOpen = ref(false)
const pickerSlot = ref(0)
const search = ref('')
const freeSlot = computed(() => slots.value.findIndex(slot => !slot))

const selectedProducts = computed(() => slots.value.filter(Boolean) as Product[])

const availableProducts = computed(() =>
  products.value.filter(p =>
    !slots.value.some(s => s?.id === p.id)
    && `${p.brand} ${p.name}`.toLowerCase().includes(search.value.trim().toLowerCase()),
  ),
)

// Só critérios que todos os escolhidos têm: nota inventada não entra
const subScoreLabels = computed(() => {
  const [first, ...others] = selectedProducts.value.map(p => scoresByProduct.value[p.id] ?? [])
  return (first ?? [])
    .map(score => score.label)
    .filter(label => others.every(list => list.some(score => score.label === label)))
})

function getSubScore(product: Product, label: string): number {
  return scoresByProduct.value[product.id]?.find(score => score.label === label)?.value ?? 0
}

async function loadScores(product: Product) {
  try {
    const detail = await $fetch<ProductScores>(`/api/v1/products/${product.id}`)
    scoresByProduct.value[product.id] = detail.scores
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
}

onMounted(() => {
  if (preselected) loadScores(preselected)
})

function openPicker(i: number) {
  pickerSlot.value = i
  pickerOpen.value = true
}

function selectProduct(p: Product) {
  slots.value[pickerSlot.value] = p
  pickerOpen.value = false
  search.value = ''
  loadScores(p)
}

function addProduct(p: Product) {
  if (freeSlot.value < 0) {
    if (slots.value.length >= MAX_SLOTS) return
    slots.value.push(null)
  }
  pickerSlot.value = freeSlot.value
  selectProduct(p)
}

// Abre um espaço novo e já escolhe o produto
function addSlot() {
  slots.value.push(null)
  openPicker(slots.value.length - 1)
}

// Nos fixos, o espaço fica vazio para escolher outro; os extras somem
function removeSlot(i: number) {
  if (i >= FIXED_SLOTS) slots.value.splice(i, 1)
  else slots.value[i] = null
}

// Fechar a escolha sem escolher não deixa um espaço extra vazio para trás
watch(pickerOpen, (open) => {
  if (!open && slots.value.length > FIXED_SLOTS && !slots.value[slots.value.length - 1]) slots.value.pop()
})
</script>
