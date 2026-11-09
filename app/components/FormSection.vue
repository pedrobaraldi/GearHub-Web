<template>
  <!-- Seções separadas por linha fina, sem cartão: a coluna de campos fica leve e a prévia ganha destaque -->
  <section class="form-section">
    <header class="flex items-start gap-3 mb-4">
      <span class="w-8 h-8 grid place-items-center rounded-lg bg-gear-accent/10 text-gear-accent shrink-0">
        <AppIcon :name="icon" class="w-4 h-4" />
      </span>
      <div class="flex-1 min-w-0">
        <h2 class="font-semibold leading-tight">{{ title }}</h2>
        <p v-if="subtitle" class="text-xs text-gear-muted mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="aside" />
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string, icon: string, subtitle?: string }>()
</script>
