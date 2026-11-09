<template>
  <div>
    <header class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-6">
      <BackButton v-if="!noBack" class="mb-4 sm:mb-6" />
      <h1 class="font-display italic font-extrabold uppercase text-4xl sm:text-5xl leading-[0.95] tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-gear-muted mt-2 max-w-xl">{{ subtitle }}</p>
    </header>

    <!-- Campos à esquerda; prévia ao vivo à direita, presa na tela enquanto os campos rolam -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-10 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 xl:gap-12 items-start">
      <div class="min-w-0">
        <slot />
      </div>

      <aside class="lg:sticky lg:top-6" :aria-label="previewLabel">
        <div class="preview-mat">
          <p class="flex items-center gap-2 text-xs font-medium text-gear-muted mb-4">
            <span class="preview-live" aria-hidden="true" />
            {{ previewLabel }}
          </p>
          <slot name="preview" />
        </div>
        <slot name="below-preview" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title: string, subtitle?: string, previewLabel?: string, noBack?: boolean }>(), {
  subtitle: undefined,
  previewLabel: 'Prévia ao vivo',
  noBack: false,
})
</script>
