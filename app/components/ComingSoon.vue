<template>
  <div>
    <PageHeader :title="title" :accent="accent" :subtitle="subtitle" />
    <div class="px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <div class="reveal glass-card max-w-2xl mx-auto p-10 text-center" v-reveal>
        <AppIcon :name="icon" class="w-8 h-8 mx-auto mb-4 text-gear-accent" />
        <p class="text-sm font-semibold mb-1">Em breve</p>
        <p class="text-xs text-gear-muted mb-5">Esta área ainda está sendo preparada.</p>
        <NuxtLink to="/" class="btn-primary inline-block">Voltar ao feed</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; accent?: string; subtitle?: string; icon: string }>()
useHead({ title: `${(props.accent ?? props.title).replace('.', '')} · GearHub` })
</script>
