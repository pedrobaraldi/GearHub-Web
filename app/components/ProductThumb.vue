<template>
  <span class="block rounded-lg overflow-hidden bg-gear-surface border border-gear-border shrink-0">
    <img v-if="image" :src="image" :alt="name" loading="lazy" class="w-full h-full object-cover" />
    <span v-else class="w-full h-full grid place-items-center text-gear-muted" aria-hidden="true">
      <AppIcon name="package" class="w-1/2 h-1/2" />
    </span>
  </span>
</template>

<script setup lang="ts">
defineProps<{ image?: string | null, name: string }>()
</script>
