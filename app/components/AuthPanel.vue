<template>
  <div class="min-h-[100dvh] grid place-items-center p-5 sm:p-6 bg-gear-bg">
    <main class="reveal w-full max-w-md" v-reveal>
      <NuxtLink to="/auth" class="btn-outline mb-6">
        <AppIcon name="arrow-left" class="w-4 h-4" />
        Voltar
      </NuxtLink>
      <AppLogo class="mb-8" />
      <h1 class="text-3xl font-semibold tracking-tight">{{ title }}</h1>
      <p class="text-sm text-gear-muted mt-2 mb-6">{{ subtitle }}</p>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string, subtitle: string }>()
</script>
