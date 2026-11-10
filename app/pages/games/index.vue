<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
    <header class="mb-6">
      <BackButton class="mb-4" />
      <h1 class="font-display italic font-extrabold uppercase text-4xl sm:text-5xl leading-[0.95] tracking-tight">Games</h1>
      <p class="text-sm text-gear-muted mt-2 max-w-xl">Encontre qualquer jogo e veja notas, tempo para zerar, trailers e, nos acompanhados, preço e jogadores online da Steam.</p>
    </header>

    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <SearchBar v-model="term" placeholder="Buscar jogo..." class="sm:max-w-xs w-full" />
      <div class="flex gap-2 overflow-x-auto" role="group" aria-label="Ordenar">
        <button
          v-for="option in SORTS"
          :key="option.value"
          type="button"
          class="pill shrink-0"
          :class="sort === option.value ? 'pill-active' : 'pill-idle'"
          :aria-pressed="sort === option.value"
          @click="sort = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Busca no catálogo inteiro: aparece quando há termo -->
    <section v-if="catalogTerm" class="mb-10" aria-labelledby="catalog-title" aria-live="polite">
      <h2 id="catalog-title" class="font-display italic font-extrabold uppercase text-2xl mb-4">No catálogo</h2>
      <ul v-if="catalogResults.length" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <li v-for="item in catalogResults" :key="item.slug"><GameCoverCard :game="item" /></li>
      </ul>
      <p v-else-if="catalogPending" class="text-sm text-gear-muted">Buscando...</p>
      <p v-else-if="catalogError" class="text-sm text-gear-muted">{{ catalogError }}</p>
      <p v-else class="text-sm text-gear-muted">Nenhum jogo com esse nome no catálogo.</p>
    </section>

    <h2 v-if="catalogTerm" class="font-display italic font-extrabold uppercase text-2xl mb-4">Acompanhados na Steam</h2>

    <p v-if="waitingFirstCollect" class="glass-card p-4 text-sm text-gear-muted mb-6" role="status">
      A primeira coleta da Steam ainda está rodando. Preços e jogadores aparecem em alguns minutos.
    </p>

    <ul v-if="games?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <li v-for="game in games" :key="game.appid">
        <!-- Card: nome sobre a capa, e embaixo jogadores, avaliações e preço numa linha -->
        <NuxtLink :to="game.slug ? `/games/${game.slug}` : `/games/steam/${game.appid}`" class="glass-card neon-hover group block overflow-hidden h-full">
          <div class="relative aspect-[460/215] bg-gradient-to-br from-gear-card via-gear-sidebar to-gear-bg">
            <img
              v-if="game.headerImage && !brokenImages.has(game.appid)"
              :src="game.headerImage"
              :alt="''"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              @error="brokenImages.add(game.appid)"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
            <span v-if="game.discountPercent > 0" class="absolute top-2 right-2 rounded-md bg-gear-green px-2 py-0.5 text-xs font-bold text-black">-{{ game.discountPercent }}%</span>
            <div class="absolute inset-x-0 bottom-0 p-3">
              <h2 class="font-display italic font-extrabold uppercase text-xl leading-none text-white truncate">{{ game.name }}</h2>
              <p class="text-[11px] text-white/70 truncate mt-1">{{ game.genres.slice(0, 3).join(', ') || 'Steam' }}</p>
            </div>
          </div>
          <dl class="grid grid-cols-3 divide-x divide-gear-border text-center py-3">
            <div class="px-2 min-w-0">
              <dt class="text-[11px] text-gear-muted inline-flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-gear-green" aria-hidden="true" />Online</dt>
              <dd class="text-sm font-semibold tabular-nums truncate">{{ formatPlayers(game.currentPlayers) }}</dd>
            </div>
            <div class="px-2 min-w-0">
              <dt class="text-[11px] text-gear-muted">Avaliações</dt>
              <dd class="text-sm font-semibold tabular-nums">{{ game.reviewPercent != null ? `${game.reviewPercent}%` : '—' }}</dd>
            </div>
            <div class="px-2 min-w-0">
              <dt class="text-[11px] text-gear-muted">Preço</dt>
              <dd class="text-sm font-semibold tabular-nums truncate" :class="{ 'text-gear-green': game.discountPercent > 0 }">{{ priceLabel(game) }}</dd>
            </div>
          </dl>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="glass-card p-10 text-center">
      <p class="text-sm font-semibold">{{ catalogTerm ? 'Nenhum jogo acompanhado com esse nome' : 'Nenhum jogo encontrado' }}</p>
      <p class="text-xs text-gear-muted mt-1">{{ catalogTerm ? 'Os resultados do catálogo estão acima.' : 'Tente outro nome.' }}</p>
    </div>

    <!-- Crédito pedido pelo IGDB, em lugar fixo e visível -->
    <p class="text-[11px] text-gear-muted mt-10">
      Dados dos jogos: <a href="https://www.igdb.com" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-gear-text">IGDB.com</a>. Preços e jogadores: Steam.
    </p>
  </div>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { toApiFailure } from '~/composables/useAuth'
import type { CatalogCard } from '~/utils/catalog'
import { formatPlayers, priceLabel, type MarketGame } from '~/utils/market'

useHead({ title: 'Games · GearHub' })

const SORTS = [
  { label: 'Mais jogados', value: 'players' },
  { label: 'Maiores descontos', value: 'discount' },
  { label: 'Menor preço', value: 'price' },
  { label: 'Nome', value: 'name' },
]

const sort = ref('players')
const term = ref('')
const search = refDebounced(term, 300)

const { data: games } = await useFetch<MarketGame[]>('/api/v1/market/games', {
  key: 'market-games',
  query: { sort, q: search },
})

// Catálogo do IGDB: só busca a partir de 2 letras, e no navegador (resultado muda a cada tecla)
const catalogTerm = computed(() => (search.value.trim().length >= 2 ? search.value.trim() : ''))
const catalogResults = ref<CatalogCard[]>([])
const catalogPending = ref(false)
const catalogError = ref('')
let lastQuery = 0

watch(catalogTerm, async (value) => {
  const current = ++lastQuery
  catalogResults.value = []
  catalogError.value = ''
  if (!value) return
  catalogPending.value = true
  try {
    const found = await $fetch<CatalogCard[]>('/api/v1/catalog/games', { query: { q: value } })
    // Uma resposta antiga não pode sobrescrever a busca mais nova
    if (current === lastQuery) catalogResults.value = found
  }
  catch (error) {
    if (current === lastQuery) catalogError.value = toApiFailure(error).message
  }
  finally {
    if (current === lastQuery) catalogPending.value = false
  }
})

// Capas que não carregaram ficam com o fundo e o nome do jogo
const brokenImages = reactive(new Set<number>())

// Enquanto a API não coletou nada, os jogos ainda não têm jogadores nem preço
const waitingFirstCollect = computed(() => !!games.value?.length && games.value.every(game => game.currentPlayers == null && game.finalCents == null && !game.free))
</script>
