<template>
  <header class="border-b border-gear-border">
    <div class="mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-6" :class="wide ? 'max-w-3xl' : 'max-w-2xl'">
      <BackButton class="mb-3 sm:mb-5" />
      <p class="editorial-eyebrow">{{ eyebrow }}</p>
      <h1 class="text-3xl font-bold tracking-tight mt-1">{{ title }}</h1>
      <p class="text-sm text-gear-muted mt-1">{{ subtitle }}</p>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string, title: string, subtitle: string, wide?: boolean }>()
</script>
