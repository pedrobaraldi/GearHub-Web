<template>
  <!-- Topo de toda página de jogo: fundo simples do site, capa e o essencial. Igual com ou sem ficha no IGDB -->
  <header class="relative overflow-hidden border-b border-gear-border bg-gear-sidebar">
    <div class="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-gear-accent/10 blur-3xl pointer-events-none" aria-hidden="true" />
    <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gear-accent/40 to-transparent" aria-hidden="true" />
    <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-8">
      <BackButton class="mb-6" />
      <div class="flex flex-col sm:flex-row gap-6 sm:items-end">
        <div class="w-36 sm:w-44 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden border border-gear-border bg-gear-card shadow-2xl">
          <img v-if="cover" :src="cover" :alt="`Capa de ${name}`" class="w-full h-full object-cover" @error="$emit('cover-error')" />
          <span v-else class="w-full h-full grid place-items-center p-3 text-center text-sm font-semibold text-gear-muted">{{ name }}</span>
        </div>
        <div class="min-w-0">
          <p v-if="eyebrow" class="editorial-eyebrow mb-2">{{ eyebrow }}</p>
          <h1 class="font-display italic font-extrabold uppercase text-4xl sm:text-5xl leading-[0.95] tracking-tight break-words">{{ name }}</h1>
          <p v-if="subtitle" class="text-sm text-gear-text-secondary mt-3">{{ subtitle }}</p>
          <div v-if="$slots.default" class="flex flex-wrap items-center gap-2 mt-4">
            <slot />
          </div>
          <p v-if="platforms" class="text-xs text-gear-muted mt-3">{{ platforms }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  cover?: string | null
  eyebrow?: string | null
  subtitle?: string | null
  platforms?: string | null
}>()
defineEmits<{ 'cover-error': [] }>()
</script>
