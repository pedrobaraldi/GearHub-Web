<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
    <header class="mb-6">
      <BackButton class="mb-4" />
      <h1 class="font-display italic font-extrabold uppercase text-4xl sm:text-5xl leading-[0.95] tracking-tight">Games</h1>
      <p class="text-sm text-gear-muted mt-2 max-w-xl">Preço, descontos e jogadores online dos jogos da Steam, com o histórico que a GearHub coleta de hora em hora.</p>
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

    <p v-if="waitingFirstCollect" class="glass-card p-4 text-sm text-gear-muted mb-6" role="status">
      A primeira coleta da Steam ainda está rodando. Preços e jogadores aparecem em alguns minutos.
    </p>

    <ul v-if="games?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <li v-for="game in games" :key="game.appid">
        <!-- Card: nome sobre a capa, e embaixo jogadores, avaliações e preço numa linha -->
        <NuxtLink :to="`/mercado/${game.appid}`" class="glass-card neon-hover group block overflow-hidden h-full">
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
      <p class="text-sm font-semibold">Nenhum jogo encontrado</p>
      <p class="text-xs text-gear-muted mt-1">Tente outro nome.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
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

// Capas que não carregaram ficam com o fundo e o nome do jogo
const brokenImages = reactive(new Set<number>())

// Enquanto a API não coletou nada, os jogos ainda não têm jogadores nem preço
const waitingFirstCollect = computed(() => !!games.value?.length && games.value.every(game => game.currentPlayers == null && game.finalCents == null && !game.free))
</script>
