<template>
  <section class="glass-card p-5 sm:p-6">
    <header class="flex items-start gap-3 mb-5">
      <span class="w-9 h-9 grid place-items-center rounded-xl bg-gear-accent/10 text-gear-accent shrink-0">
        <AppIcon :name="icon" class="w-[18px] h-[18px]" />
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
