<template>
  <div v-if="detail" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
    <BackButton class="mb-5" />

    <!-- Topo: capa da loja, nome, estúdio e preço -->
    <section class="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
      <div class="glass-card overflow-hidden">
        <img v-if="game.headerImage" :src="game.headerImage" :alt="game.name" class="w-full aspect-[460/215] object-cover" />
        <div class="p-5 sm:p-6">
          <h1 class="font-display italic font-extrabold uppercase text-3xl sm:text-4xl leading-[0.95] tracking-tight">{{ game.name }}</h1>
          <p class="text-sm text-gear-muted mt-2">
            <template v-if="detail.developers">{{ detail.developers }}</template>
            <template v-if="detail.developers && detail.releaseDate">, </template>
            <template v-if="detail.releaseDate">lançado em {{ detail.releaseDate }}</template>
          </p>
          <ul v-if="game.genres.length" class="flex flex-wrap gap-2 mt-3" aria-label="Gêneros">
            <li v-for="genre in game.genres" :key="genre" class="text-xs rounded-full border border-gear-border px-2.5 py-1 text-gear-text-secondary">{{ genre }}</li>
          </ul>
          <p v-if="detail.shortDescription" class="text-sm text-gear-text-secondary leading-relaxed mt-4 max-w-2xl">{{ detail.shortDescription }}</p>
        </div>
      </div>

      <aside class="glass-card p-5 sm:p-6 space-y-5">
        <div>
          <p class="text-xs text-gear-muted">Preço na Steam</p>
          <div class="flex items-baseline gap-3 mt-1">
            <span class="font-display italic font-extrabold text-4xl leading-none tabular-nums" :class="game.discountPercent > 0 ? 'text-gear-green' : ''">{{ priceLabel(game) }}</span>
            <span v-if="game.discountPercent > 0" class="rounded-md bg-gear-green px-2 py-0.5 text-xs font-bold text-black">-{{ game.discountPercent }}%</span>
          </div>
          <p v-if="game.discountPercent > 0 && game.initialCents" class="text-xs text-gear-muted mt-1">De <span class="line-through">{{ formatPrice(game.initialCents, currency) }}</span></p>
        </div>
        <div v-if="game.lowestCents != null && !game.free">
          <p class="text-xs text-gear-muted">Menor preço registrado</p>
          <p class="font-semibold tabular-nums">{{ formatPrice(game.lowestCents, currency) }}<span v-if="detail.lowestAt" class="text-xs font-normal text-gear-muted"> em {{ shortDate(detail.lowestAt) }}</span></p>
        </div>
        <a :href="`https://store.steampowered.com/app/${game.appid}`" target="_blank" rel="noopener noreferrer" class="btn-primary w-full !py-2.5 inline-flex items-center justify-center gap-2">
          Abrir na Steam
          <span class="sr-only">(abre em nova aba)</span>
        </a>
        <p class="text-[11px] text-gear-muted">Acompanhado desde {{ shortDate(detail.trackedSince) }}<template v-if="detail.updatedAt">, atualizado {{ shortDateTime(detail.updatedAt) }}</template>.</p>
      </aside>
    </section>

    <!-- Números principais -->
    <dl class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      <div v-for="stat in stats" :key="stat.label" class="glass-card p-4">
        <dt class="text-xs text-gear-muted">{{ stat.label }}</dt>
        <dd class="font-display italic font-extrabold text-2xl leading-none mt-1.5 tabular-nums">{{ stat.value }}</dd>
        <dd v-if="stat.hint" class="text-[11px] text-gear-muted mt-1">{{ stat.hint }}</dd>
      </div>
    </dl>

    <!-- Gráficos -->
    <section class="mt-6" aria-labelledby="history-title">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="history-title" class="font-display italic font-extrabold uppercase text-2xl">Histórico</h2>
        <div class="flex gap-2" role="group" aria-label="Período">
          <button
            v-for="option in RANGES"
            :key="option.value"
            type="button"
            class="pill"
            :class="range === option.value ? 'pill-active' : 'pill-idle'"
            :aria-pressed="range === option.value"
            @click="range = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <div class="grid lg:grid-cols-2 gap-4">
        <div class="glass-card p-5">
          <h3 class="text-sm font-semibold mb-3">Jogadores online</h3>
          <LineChart
            :points="playerPoints"
            color="var(--gear-green)"
            :format="formatPlayers"
            aria-label="Gráfico de jogadores online"
            empty="O gráfico de jogadores começa a se formar a partir das próximas coletas (uma por hora)."
          />
        </div>
        <div class="glass-card p-5">
          <h3 class="text-sm font-semibold mb-3">Preço</h3>
          <LineChart
            v-if="!game.free"
            :points="pricePoints"
            color="var(--gear-accent)"
            :format="value => formatPrice(value, currency)"
            step
            aria-label="Gráfico de preço"
            empty="O preço ainda não mudou desde que começamos a acompanhar este jogo."
          />
          <p v-else class="h-48 grid place-items-center text-sm text-gear-muted">Jogo gratuito: sem histórico de preço.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ChartPoint } from '~/components/LineChart.vue'
import { formatPlayers, formatPrice, priceLabel, type MarketGameDetail, type MarketHistory } from '~/utils/market'

const RANGES = [
  { label: '24h', value: '24h' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Tudo', value: 'all' },
]

const appid = useRoute().params.appid as string

const { data: detail, error } = await useFetch<MarketGameDetail>(`/api/v1/market/games/${appid}`, { key: `market-${appid}` })
if (error.value || !detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Jogo não encontrado', fatal: true })
}

const range = ref('7d')
const { data: history } = await useFetch<MarketHistory>(`/api/v1/market/games/${appid}/history`, {
  key: `market-history-${appid}`,
  query: { range },
})

const game = computed(() => detail.value!.summary)
const currency = computed(() => game.value.currency ?? 'BRL')

useHead({ title: () => `${game.value.name} · Games · GearHub` })

const playerPoints = computed<ChartPoint[]>(() =>
  (history.value?.players ?? []).map(point => ({ x: new Date(point.takenAt).getTime(), y: point.players })))

// Um preço só não vira gráfico: repete o valor atual para desenhar a linha até agora
const pricePoints = computed<ChartPoint[]>(() => {
  const points = (history.value?.prices ?? []).map(point => ({ x: new Date(point.takenAt).getTime(), y: point.finalCents }))
  return points.length === 1 ? [points[0]!, { x: Date.now(), y: points[0]!.y }] : points
})

const reviewTotal = computed(() => (detail.value?.reviewPositive ?? 0) + (detail.value?.reviewNegative ?? 0))

const stats = computed(() => [
  { label: 'Jogando agora', value: formatPlayers(game.value.currentPlayers), hint: null },
  { label: 'Pico nas últimas 24h', value: formatPlayers(game.value.peakPlayers24h), hint: null },
  { label: 'Pico registrado', value: formatPlayers(detail.value?.peakPlayersAll), hint: 'Desde o início da coleta' },
  {
    label: 'Avaliações positivas',
    value: game.value.reviewPercent != null ? `${game.value.reviewPercent}%` : '—',
    hint: reviewTotal.value ? `${detail.value?.reviewSummary ?? ''} · ${reviewTotal.value.toLocaleString('pt-BR')} avaliações` : null,
  },
])

const shortDate = (value: string) => new Date(value).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
const shortDateTime = (value: string) => new Date(value).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>
