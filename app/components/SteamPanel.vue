<template>
  <!-- Preço, jogadores e histórico que a GearHub coleta da Steam de hora em hora -->
  <section v-if="detail" aria-labelledby="steam-title">
    <div class="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <h2 id="steam-title" class="font-display italic font-extrabold uppercase text-2xl">Na Steam</h2>
        <p class="text-[11px] text-gear-muted mt-1">Acompanhado desde {{ shortDate(detail.trackedSince) }}<template v-if="detail.updatedAt">, atualizado {{ shortDateTime(detail.updatedAt) }}</template>.</p>
      </div>
      <a :href="`https://store.steampowered.com/app/${appid}`" target="_blank" rel="noopener noreferrer" class="btn-outline">
        Abrir na Steam
        <span class="sr-only">(abre em nova aba)</span>
      </a>
    </div>

    <!-- Preço numa linha inteira; os números embaixo, em colunas iguais -->
    <div class="glass-card p-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <p class="text-xs text-gear-muted">Preço</p>
        <div class="flex items-baseline gap-3 mt-1">
          <span class="font-display italic font-extrabold text-4xl leading-none tabular-nums" :class="game.discountPercent > 0 ? 'text-gear-green' : ''">{{ priceLabel(game) }}</span>
          <span v-if="game.discountPercent > 0" class="rounded-md bg-gear-green px-2 py-0.5 text-xs font-bold text-black">-{{ game.discountPercent }}%</span>
        </div>
        <p v-if="game.discountPercent > 0 && game.initialCents" class="text-xs text-gear-muted mt-1">De <span class="line-through">{{ formatPrice(game.initialCents, currency) }}</span></p>
      </div>
      <p v-if="game.lowestCents != null && !game.free" class="text-xs text-gear-muted">
        Menor preço registrado: <span class="font-semibold text-gear-text tabular-nums">{{ formatPrice(game.lowestCents, currency) }}</span><template v-if="detail.lowestAt"> em {{ shortDate(detail.lowestAt) }}</template>
      </p>
    </div>

    <dl class="grid gap-3 mt-3" :class="stats.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'">
      <div v-for="stat in stats" :key="stat.label" class="glass-card p-4 min-w-0 flex flex-col">
        <dt class="text-xs text-gear-muted leading-snug min-h-[2rem]">{{ stat.label }}</dt>
        <dd class="font-display italic font-extrabold text-xl lg:text-2xl leading-none mt-1.5 tabular-nums truncate" :title="stat.value">{{ stat.value }}</dd>
        <dd v-if="stat.hint" class="text-[11px] text-gear-muted mt-1.5 leading-snug">{{ stat.hint }}</dd>
      </div>
    </dl>

    <div class="flex flex-wrap items-center justify-between gap-3 mt-6 mb-4">
      <h3 class="text-sm font-semibold">Histórico</h3>
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
        <h4 class="text-sm font-semibold mb-3">Jogadores online</h4>
        <LineChart
          :points="playerPoints"
          color="var(--gear-green)"
          :format="formatPlayers"
          aria-label="Gráfico de jogadores online"
          empty="O gráfico de jogadores começa a se formar a partir das próximas coletas (uma por hora)."
        />
      </div>
      <div class="glass-card p-5">
        <h4 class="text-sm font-semibold mb-3">Preço</h4>
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
</template>

<script setup lang="ts">
import type { ChartPoint } from '~/components/LineChart.vue'
import { formatPlayers, formatPrice, priceLabel, type MarketGameDetail, type MarketHistory } from '~/utils/market'

const props = defineProps<{ appid: number }>()

const RANGES = [
  { label: '24h', value: '24h' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Tudo', value: 'all' },
]

const { data: detail } = await useFetch<MarketGameDetail>(`/api/v1/market/games/${props.appid}`, { key: `market-${props.appid}` })

const range = ref('7d')
const { data: history } = await useFetch<MarketHistory>(`/api/v1/market/games/${props.appid}/history`, {
  key: `market-history-${props.appid}`,
  query: { range },
})

const game = computed(() => detail.value!.summary)
const currency = computed(() => game.value.currency ?? 'BRL')

const playerPoints = computed<ChartPoint[]>(() =>
  (history.value?.players ?? []).map(point => ({ x: new Date(point.takenAt).getTime(), y: point.players })))

// Um preço só não vira gráfico: repete o valor até a última coleta. Data fixa (e não Date.now()), para o
// servidor e o navegador desenharem igual
const pricePoints = computed<ChartPoint[]>(() => {
  const points = (history.value?.prices ?? []).map(point => ({ x: new Date(point.takenAt).getTime(), y: point.finalCents }))
  if (points.length !== 1) return points
  const until = detail.value?.updatedAt ? new Date(detail.value.updatedAt).getTime() : points[0]!.x + 86_400_000
  return [points[0]!, { x: Math.max(until, points[0]!.x + 1), y: points[0]!.y }]
})

const reviewTotal = computed(() => (detail.value?.reviewPositive ?? 0) + (detail.value?.reviewNegative ?? 0))

const stats = computed(() => [
  { label: 'Jogando agora', value: formatPlayers(game.value.currentPlayers), hint: null },
  { label: 'Pico nas últimas 24h', value: formatPlayers(game.value.peakPlayers24h), hint: null },
  { label: 'Pico registrado', value: formatPlayers(detail.value?.peakPlayersAll), hint: 'Desde o início da coleta' },
  // A Steam nem sempre entrega as avaliações: sem dado, o card não aparece
  ...(game.value.reviewPercent != null
    ? [{
        label: 'Avaliações positivas',
        value: `${game.value.reviewPercent}%`,
        hint: reviewTotal.value ? `${detail.value?.reviewSummary ?? ''} · ${reviewTotal.value.toLocaleString('pt-BR')} avaliações` : null,
      }]
    : []),
])

const shortDate = (value: string) => new Date(value).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
const shortDateTime = (value: string) => new Date(value).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>
