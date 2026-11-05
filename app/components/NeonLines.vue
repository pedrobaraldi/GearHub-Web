<template>
  <svg
    ref="root"
    class="reveal absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 1000 260"
    preserveAspectRatio="xMaxYMid slice"
    fill="none"
    aria-hidden="true"
  >
    <path
      v-for="line in LINES"
      :key="line.d"
      data-line
      :d="line.d"
      :class="line.class"
      stroke-width="1.5"
      :pathLength="PATH_LENGTH"
      :stroke-dasharray="PATH_LENGTH"
    />
    <!-- Pulso de luz que corre pelas linhas acesas -->
    <path
      v-for="line in LINES.filter(l => l.lit)"
      :key="`pulso-${line.d}`"
      data-pulse
      :d="line.d"
      class="neon-stroke neon-line"
      stroke-width="2.5"
      stroke-linecap="round"
      :pathLength="PATH_LENGTH"
      stroke-dasharray="50 1100"
      stroke-dashoffset="50"
    />
  </svg>
</template>

<script setup lang="ts">
import gsap from 'gsap'

// Escala alta porque o GSAP arredonda o offset; com 1 a linha surgiria de uma vez
const PATH_LENGTH = 1000

const LINES = [
  { d: 'M660 -10 L790 130 L660 270', class: 'neon-stroke neon-line', lit: true },
  { d: 'M720 -10 L850 130 L720 270', class: 'stroke-gear-text/20', lit: false },
  { d: 'M860 -10 L990 130 L860 270', class: 'neon-stroke-soft neon-line', lit: true },
  { d: 'M920 -10 L1050 130 L920 270', class: 'stroke-gear-text/10', lit: false },
  { d: 'M-50 -10 L30 70 L-50 150', class: 'neon-stroke-soft neon-line', lit: true },
  { d: 'M-50 120 L30 200 L-50 280', class: 'stroke-gear-text/15', lit: false },
]

const root = ref<SVGSVGElement | null>(null)

useGsapContext(root, (el) => {
  const lines = el.querySelectorAll('[data-line]')
  const pulses = el.querySelectorAll('[data-pulse]')

  gsap.timeline()
    .fromTo(lines, { strokeDashoffset: PATH_LENGTH }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.14 }, 0.15)
    // Pisca como letreiro ligando
    .to(lines, { keyframes: { opacity: [1, 0.2, 1, 0.5, 1, 0.1, 1] }, duration: 0.7, stagger: 0.05 })
    .add(() => {
      gsap.fromTo(pulses, { strokeDashoffset: 50 }, {
        strokeDashoffset: -1000,
        duration: 2.4,
        ease: 'none',
        repeat: -1,
        repeatDelay: 1.6,
        stagger: 0.7,
      })
    })

  el.classList.remove('reveal')
})
</script>
