<template>
  <!-- Escolha do jogo de um post: busca no catálogo inteiro e toca na capa -->
  <AppModal :open="open" title="De qual jogo você quer falar?" subtitle="Busque pelo nome e toque na capa." width-class="max-w-2xl" @close="$emit('close')">
    <SearchBar ref="search" v-model="term" placeholder="Buscar jogo..." class="w-full" />

    <div class="mt-5 min-h-[12rem]" aria-live="polite">
      <ul v-if="results.length" class="grid grid-cols-3 sm:grid-cols-4 gap-3">
        <li v-for="game in results" :key="game.slug">
          <button
            type="button"
            class="group w-full text-left"
            :aria-pressed="game.slug === selected"
            @click="$emit('select', game)"
          >
            <span
              class="relative block aspect-[3/4] rounded-xl overflow-hidden border-2 bg-gear-card transition-colors"
              :class="game.slug === selected ? 'border-gear-accent' : 'border-transparent group-hover:border-gear-text/30'"
            >
              <img v-if="game.coverUrl" :src="game.coverUrl" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
              <span v-else class="absolute inset-0 grid place-items-center p-2 text-center text-[11px] font-semibold text-gear-muted">{{ game.name }}</span>
              <span v-if="game.slug === selected" class="absolute top-1.5 right-1.5 w-6 h-6 grid place-items-center rounded-full bg-gear-accent text-black">
                <AppIcon name="check" class="w-3.5 h-3.5" />
              </span>
            </span>
            <span class="block text-xs font-semibold mt-1.5 leading-snug line-clamp-2">{{ game.name }}</span>
            <span v-if="game.year" class="block text-[11px] text-gear-muted">{{ game.year }}</span>
          </button>
        </li>
      </ul>
      <p v-else-if="pending" class="text-sm text-gear-muted text-center pt-12">Buscando...</p>
      <p v-else-if="error" class="text-sm text-gear-muted text-center pt-12">{{ error }}</p>
      <p v-else-if="query" class="text-sm text-gear-muted text-center pt-12">Nenhum jogo com esse nome.</p>
      <p v-else class="text-sm text-gear-muted text-center pt-12">Digite ao menos 2 letras para buscar.</p>
    </div>

    <p class="text-[11px] text-gear-muted mt-4">Dados dos jogos: IGDB.com</p>
  </AppModal>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { toApiFailure } from '~/composables/useAuth'
import type { CatalogCard } from '~/utils/catalog'

const props = defineProps<{ open: boolean, selected?: string | null }>()
defineEmits<{ close: [], select: [game: CatalogCard] }>()

const term = ref('')
const debounced = refDebounced(term, 300)
const query = computed(() => (debounced.value.trim().length >= 2 ? debounced.value.trim() : ''))
const results = ref<CatalogCard[]>([])
const pending = ref(false)
const error = ref('')
let lastQuery = 0

watch(query, async (value) => {
  const current = ++lastQuery
  results.value = []
  error.value = ''
  if (!value) return
  pending.value = true
  try {
    const found = await $fetch<CatalogCard[]>('/api/v1/catalog/games', { query: { q: value } })
    // Uma resposta antiga não pode sobrescrever a busca mais nova
    if (current === lastQuery) results.value = found
  }
  catch (failure) {
    if (current === lastQuery) error.value = toApiFailure(failure).message
  }
  finally {
    if (current === lastQuery) pending.value = false
  }
})

// Ao abrir, o cursor já vai para a busca
const search = ref<{ $el?: HTMLElement } | null>(null)
watch(() => props.open, async (open) => {
  if (!open) return
  await nextTick()
  search.value?.$el?.querySelector?.('input')?.focus()
})
</script>
