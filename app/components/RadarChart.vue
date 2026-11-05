<template>
  <svg
    ref="root"
    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
    class="w-full max-w-sm mx-auto"
    role="img"
    :aria-label="description"
  >
    <g class="stroke-gear-text/15" fill="none">
      <polygon v-for="ring in RINGS" :key="ring" data-ring :points="pointsAt(() => ring)" />
      <line
        v-for="(_, i) in axes"
        :key="i"
        data-spoke
        :x1="CENTER_X"
        :y1="CENTER_Y"
        :x2="point(i, 1).x"
        :y2="point(i, 1).y"
      />
    </g>

    <polygon
      data-shape
      :points="pointsAt(i => ratioOf(i))"
      class="neon-fill neon-stroke neon-line"
      stroke-width="2"
      stroke-linejoin="round"
    />

    <circle
      v-for="(axis, i) in axes"
      :key="axis.label"
      data-dot
      :cx="point(i, ratioOf(i)).x"
      :cy="point(i, ratioOf(i)).y"
      r="3.5"
      class="neon-dot neon-line"
    />

    <text
      v-for="(axis, i) in axes"
      :key="axis.label"
      data-label
      :x="point(i, LABEL_DISTANCE).x"
      :y="point(i, LABEL_DISTANCE).y"
      :text-anchor="anchor(i)"
      dominant-baseline="middle"
      font-size="9"
      letter-spacing="1.2"
      class="font-mono uppercase fill-gear-muted"
    >{{ axis.label }}</text>
  </svg>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  axes: { label: string; value: number }[]
  max?: number
}>(), { max: 10 })

const WIDTH = 360
const HEIGHT = 230
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2
const RADIUS = 88
const LABEL_DISTANCE = 1.16
const RINGS = [0.25, 0.5, 0.75, 1]

const ratioOf = (index: number) => props.axes[index]!.value / props.max

function point(index: number, ratio: number) {
  const angle = (Math.PI * 2 * index) / props.axes.length - Math.PI / 2
  return {
    x: Number((CENTER_X + Math.cos(angle) * RADIUS * ratio).toFixed(2)),
    y: Number((CENTER_Y + Math.sin(angle) * RADIUS * ratio).toFixed(2)),
  }
}

function pointsAt(ratioAt: (index: number) => number) {
  return props.axes.map((_, i) => {
    const { x, y } = point(i, ratioAt(i))
    return `${x},${y}`
  }).join(' ')
}

function anchor(index: number) {
  const { x } = point(index, 1)
  if (Math.abs(x - CENTER_X) < 1) return 'middle'
  return x > CENTER_X ? 'start' : 'end'
}

const description = computed(() =>
  `Gráfico em radar: ${props.axes.map(a => `${a.label} ${a.value.toFixed(1)}`).join(', ')}`,
)

const root = ref<SVGSVGElement | null>(null)

useGsapContext(root, (el, reduced) => {
  if (reduced) return

  const shape = el.querySelector('[data-shape]')!
  const dots = el.querySelectorAll('[data-dot]')
  const reach = props.axes.map(() => ({ ratio: 0 }))

  // Cada ponta do radar cresce do centro até a própria nota
  const render = () => {
    shape.setAttribute('points', pointsAt(i => reach[i]!.ratio))
    dots.forEach((dot, i) => {
      const { x, y } = point(i, reach[i]!.ratio)
      dot.setAttribute('cx', String(x))
      dot.setAttribute('cy', String(y))
    })
  }
  render()

  gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
    .from(el.querySelectorAll('[data-ring]'), {
      autoAlpha: 0,
      scale: 0.4,
      svgOrigin: `${CENTER_X} ${CENTER_Y}`,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.07,
    })
    .from(el.querySelectorAll('[data-spoke], [data-label]'), { autoAlpha: 0, duration: 0.35 }, '-=0.25')
    .to(reach, {
      ratio: (i: number) => ratioOf(i),
      duration: 0.9,
      ease: 'back.out(1.7)',
      stagger: 0.1,
      onUpdate: render,
      onComplete: render,
    }, '-=0.2')
})
</script>
