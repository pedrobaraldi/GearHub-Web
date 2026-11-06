<template>
  <div class="min-h-screen grid place-items-center p-6 bg-gear-bg">
    <main class="reveal w-full max-w-md" v-reveal>
      <NuxtLink to="/auth" class="btn-outline mb-6">
        <AppIcon name="arrow-left" class="w-4 h-4" />
        Voltar
      </NuxtLink>
      <AppLogo class="mb-8" />
      <p class="editorial-eyebrow mb-1.5">{{ eyebrow }}</p>
      <h1 class="text-3xl font-semibold tracking-tight">{{ title }}</h1>
      <p class="text-sm text-gear-muted mt-2 mb-6">{{ subtitle }}</p>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string, title: string, subtitle: string }>()
</script>
