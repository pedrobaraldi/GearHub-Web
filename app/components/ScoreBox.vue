<template>
  <div
    class="shrink-0 rounded-xl border border-gear-primary/30 bg-gear-primary/5 flex flex-col items-center justify-center"
    :class="small ? 'w-12 h-12' : 'w-16 h-16'"
  >
    <span
      class="font-display italic font-extrabold leading-none tabular-nums text-gear-primary"
      :class="small ? 'text-xl' : 'text-3xl'"
    >{{ score.toFixed(1) }}</span>
    <span v-if="!small" class="text-[8px] font-bold uppercase tracking-widest text-gear-primary/70 mt-0.5">Score</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ score: number; small?: boolean }>()
</script>
