<template>
  <!-- Emblema provisório: quando houver os personalizados, basta trocar este componente -->
  <svg viewBox="0 0 100 120" class="overflow-visible" :style="{ color }" role="img" :aria-label="title">
    <g v-if="glow" data-rings fill="none" stroke="currentColor" opacity="0.35" stroke-width="1">
      <path d="M50 2 92 26v50L50 100 8 76V26Z" />
      <path d="M50 12 83 31v40L50 90 17 71V31Z" opacity="0.6" />
    </g>
    <path d="M24 16h52v58c0 8-14 18-26 26-12-8-26-18-26-26Z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
    <path d="M33 24h34v44c0 5-9 12-17 17-8-5-17-12-17-17Z" fill="currentColor" />
    <path d="m50 3 3.200 9.800h10.300l-8.300 6 3.200 9.800-8.400-6.100-8.400 6.100 3.200-9.800-8.300-6h10.300Z" fill="currentColor" />
    <text x="50" y="62" text-anchor="middle" dominant-baseline="middle" font-size="28" font-weight="800" class="font-display italic" fill="var(--gear-bg)">{{ label }}</text>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ color: string, label: string | number, title: string, glow?: boolean }>(), { glow: false })
</script>
