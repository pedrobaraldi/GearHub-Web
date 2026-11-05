<template>
  <div ref="root" class="space-y-3">
    <div v-for="sub in subScores" :key="sub.label">
      <div class="flex items-baseline justify-between gap-2 mb-1.5">
        <span class="editorial-eyebrow truncate">{{ sub.label }}</span>
        <span class="font-mono text-[11px] font-semibold tabular-nums">{{ sub.value.toFixed(1) }}</span>
      </div>
      <div class="h-1 bg-gear-surface rounded-full overflow-hidden">
        <div data-bar class="h-full rounded-full neon-bar" :style="{ width: `${(sub.value / 10) * 100}%` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import type { SubScore } from '~/composables/useGearData'

defineProps<{ subScores: SubScore[] }>()

const root = ref<HTMLElement | null>(null)

useGsapContext(root, (el, reduced) => {
  if (reduced) return
  gsap.from(el.querySelectorAll('[data-bar]'), {
    scaleX: 0,
    transformOrigin: 'left center',
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  })
})
</script>
