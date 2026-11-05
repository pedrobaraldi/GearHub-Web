<template>
  <header class="border-b border-gear-border px-4 sm:px-6 lg:px-10 pt-5 pb-6">
    <BackButton class="mb-5" />
    <p class="editorial-eyebrow">{{ eyebrow }}</p>
    <h1 class="text-3xl font-bold tracking-tight mt-1">{{ title }}</h1>
    <p class="text-sm text-gear-muted mt-1">{{ subtitle }}</p>
  </header>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string, title: string, subtitle: string }>()
</script>
