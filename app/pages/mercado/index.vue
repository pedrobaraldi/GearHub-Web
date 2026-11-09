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
        <NuxtLink :to="`/mercado/${game.appid}`" class="glass-card neon-hover group block overflow-hidden h-full">
          <div class="relative aspect-[460/215] bg-gear-surface">
            <img v-if="game.headerImage" :src="game.headerImage" :alt="game.name" loading="lazy" class="w-full h-full object-cover" />
            <span v-if="game.discountPercent > 0" class="absolute top-2 left-2 rounded-md bg-gear-green px-2 py-0.5 text-xs font-bold text-black">-{{ game.discountPercent }}%</span>
          </div>
          <div class="p-4">
            <h2 class="font-semibold truncate group-hover:text-gear-accent transition-colors">{{ game.name }}</h2>
            <p class="text-xs text-gear-muted truncate mt-0.5">{{ game.genres.slice(0, 3).join(', ') || 'Steam' }}</p>
            <div class="flex items-end justify-between gap-3 mt-4">
              <div>
                <p class="text-[11px] text-gear-muted flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-gear-green" aria-hidden="true" />Jogando agora</p>
                <p class="font-semibold tabular-nums">{{ formatPlayers(game.currentPlayers) }}</p>
              </div>
              <div class="text-right">
                <p v-if="game.discountPercent > 0 && game.initialCents" class="text-[11px] text-gear-muted line-through tabular-nums">{{ formatPrice(game.initialCents, game.currency ?? 'BRL') }}</p>
                <p class="font-display italic font-extrabold text-xl leading-none tabular-nums" :class="game.discountPercent > 0 ? 'text-gear-green' : ''">{{ priceLabel(game) }}</p>
              </div>
            </div>
          </div>
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
import { formatPlayers, formatPrice, priceLabel, type MarketGame } from '~/utils/market'

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

// Enquanto a API não coletou nada, os jogos ainda não têm jogadores nem preço
const waitingFirstCollect = computed(() => !!games.value?.length && games.value.every(game => game.currentPlayers == null && game.finalCents == null && !game.free))
</script>
