<template>
  <dl v-if="stats.length" class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
    <div v-for="stat in stats" :key="stat.label">
      <dt class="editorial-eyebrow">{{ stat.label }}</dt>
      <dd class="text-sm font-mono tabular-nums mt-0.5">{{ stat.value }}</dd>
    </div>
  </dl>
  <p v-else class="text-xs text-gear-muted">Sem configurações preenchidas.</p>
</template>

<script setup lang="ts">
export interface GameConfig {
  slug: string
  name: string
  dpi: number | null
  sensitivity: number | null
  edpi: number | null
  resolution: string | null
  aspectRatio: string | null
  refreshRate: number | null
}

const props = defineProps<{ config: GameConfig }>()

const stats = computed(() => [
  { label: 'DPI', value: props.config.dpi },
  { label: 'Sensibilidade', value: props.config.sensitivity },
  { label: 'eDPI', value: props.config.edpi },
  { label: 'Resolução', value: props.config.resolution },
  { label: 'Proporção', value: props.config.aspectRatio },
  { label: 'Taxa', value: props.config.refreshRate === null ? null : `${props.config.refreshRate} Hz` },
].filter(stat => stat.value !== null))
</script>
