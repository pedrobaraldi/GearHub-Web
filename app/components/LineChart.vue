<template>
  <figure class="relative">
    <div v-if="points.length < 2" class="h-48 grid place-items-center rounded-2xl border border-dashed border-gear-border text-sm text-gear-muted text-center px-6">
      {{ empty }}
    </div>
    <template v-else>
      <!-- Valor do ponto sob o cursor (ou o último, sem cursor) -->
      <figcaption class="flex items-baseline justify-between gap-3 mb-2">
        <span class="font-display italic font-extrabold text-2xl leading-none tabular-nums" :style="{ color }">{{ format(active.y) }}</span>
        <span class="text-xs text-gear-muted">{{ dateLabel(active.x) }}</span>
      </figcaption>
      <svg
        ref="svg"
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="none"
        class="w-full h-48 touch-none"
        role="img"
        :aria-label="ariaLabel"
        @pointermove="onMove"
        @pointerleave="hover = null"
      >
        <line v-for="tick in ticks" :key="tick" :x1="0" :x2="W" :y1="yOf(tick)" :y2="yOf(tick)" stroke="currentColor" class="text-gear-border" stroke-dasharray="3 5" vector-effect="non-scaling-stroke" />
        <path :d="area" :fill="color" opacity="0.12" />
        <path :d="line" fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
        <line v-if="hover" :x1="xOf(active.x)" :x2="xOf(active.x)" y1="0" :y2="H" stroke="currentColor" class="text-gear-muted" vector-effect="non-scaling-stroke" />
        <circle :cx="xOf(active.x)" :cy="yOf(active.y)" r="4" :fill="color" stroke="var(--gear-bg)" stroke-width="2" vector-effect="non-scaling-stroke" />
      </svg>
      <div class="flex justify-between text-[11px] text-gear-muted mt-1.5 tabular-nums">
        <span>{{ dateLabel(points[0]!.x) }}</span>
        <span>mín. {{ format(minY) }} · máx. {{ format(maxY) }}</span>
        <span>{{ dateLabel(points[points.length - 1]!.x) }}</span>
      </div>
    </template>
  </figure>
</template>

<script setup lang="ts">
export interface ChartPoint { x: number, y: number }

const props = withDefaults(defineProps<{
  points: ChartPoint[]
  color: string
  format: (value: number) => string
  // Preço muda em degraus: o valor vale até a próxima mudança
  step?: boolean
  empty?: string
  ariaLabel: string
}>(), { step: false, empty: 'Ainda sem dados suficientes para o gráfico.' })

const W = 600
const H = 200
const PAD = 12

const svg = ref<SVGSVGElement | null>(null)
const hover = ref<ChartPoint | null>(null)

// No degrau, o último valor se estende até agora
const series = computed(() => {
  if (!props.step || !props.points.length) return props.points
  const last = props.points[props.points.length - 1]!
  return [...props.points, { x: Math.max(Date.now(), last.x), y: last.y }]
})

const minX = computed(() => series.value[0]?.x ?? 0)
const maxX = computed(() => series.value[series.value.length - 1]?.x ?? 1)
const minY = computed(() => Math.min(...props.points.map(point => point.y)))
const maxY = computed(() => Math.max(...props.points.map(point => point.y)))

// Faixa com folga para a linha não encostar nas bordas
const range = computed(() => {
  const span = maxY.value - minY.value || Math.max(1, maxY.value * 0.1)
  return { low: Math.max(0, minY.value - span * 0.15), high: maxY.value + span * 0.15 }
})

const xOf = (x: number) => ((x - minX.value) / (maxX.value - minX.value || 1)) * W
const yOf = (y: number) => H - PAD - ((y - range.value.low) / (range.value.high - range.value.low || 1)) * (H - PAD * 2)

const line = computed(() => series.value.map((point, index) => {
  const x = xOf(point.x).toFixed(1)
  const y = yOf(point.y).toFixed(1)
  if (index === 0) return `M${x},${y}`
  return props.step ? `H${x}V${y}` : `L${x},${y}`
}).join(''))

const area = computed(() => `${line.value}V${H}H0Z`)

const ticks = computed(() => [0.25, 0.5, 0.75].map(f => range.value.low + (range.value.high - range.value.low) * f))

const active = computed(() => hover.value ?? props.points[props.points.length - 1]!)

function onMove(event: PointerEvent) {
  const box = svg.value?.getBoundingClientRect()
  if (!box) return
  const x = minX.value + ((event.clientX - box.left) / box.width) * (maxX.value - minX.value)
  // No degrau, vale o último ponto antes do cursor; na linha, o mais próximo
  hover.value = props.step
    ? [...props.points].reverse().find(point => point.x <= x) ?? props.points[0]!
    : props.points.reduce((best, point) => (Math.abs(point.x - x) < Math.abs(best.x - x) ? point : best))
}

const dateLabel = (x: number) => new Date(x).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>
