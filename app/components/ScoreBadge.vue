<template>
  <span
    class="font-mono font-bold tabular-nums text-sm text-gear-primary"
  >
    {{ score.toFixed(1) }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ score: number }>()
</script>
