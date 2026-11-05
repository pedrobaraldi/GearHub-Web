<template>
  <span
    class="inline-flex items-center gap-1 rounded-md font-semibold"
    :class="large ? 'px-2 py-0.5 text-[11px]' : 'px-1.5 py-0.5 text-[10px]'"
    :title="`Nível ${user.level} · ${rank.label}`"
    :style="{
      color: rank.color,
      border: `1px solid color-mix(in oklab, ${rank.color} 40%, transparent)`,
      background: `color-mix(in oklab, ${rank.color} 12%, transparent)`,
    }"
  >
    <AppIcon name="compass" class="w-2.5 h-2.5" />
    {{ rank.label }}
  </span>
  <span
    v-if="user.badge === 'ExploradorPro'"
    class="font-bold text-gear-primary uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-gear-primary/40 bg-gear-primary/10"
    :class="large ? 'text-[10px]' : 'text-[9px]'"
  >Pro</span>
</template>

<script setup lang="ts">
import type { User } from '~/composables/useGearData'
import { userRank } from '~/composables/useGearData'

const props = defineProps<{ user: User; large?: boolean }>()
const rank = computed(() => userRank(props.user))
</script>
