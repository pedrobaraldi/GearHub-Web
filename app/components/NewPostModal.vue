<template>
  <AppModal
    :open="isOpen"
    title="Nova Publicação"
    subtitle="Escolha o tipo de conteúdo que deseja criar."
    width-class="max-w-xl"
    @close="isOpen = false"
  >
    <div class="grid sm:grid-cols-2 gap-3">
      <NuxtLink
        v-for="option in OPTIONS"
        :key="option.tipo"
        data-card
        :to="`/new?tipo=${option.tipo}`"
        class="group glass-card neon-hover p-5 block"
        @click="isOpen = false"
      >
        <span class="w-10 h-10 grid place-items-center rounded-xl border mb-4" :class="option.iconClass">
          <AppIcon :name="option.icon" class="w-5 h-5" />
        </span>
        <span class="block text-lg font-semibold">{{ option.label }}</span>
        <span class="block text-xs text-gear-muted leading-relaxed mt-1 mb-4">{{ option.description }}</span>
        <span class="editorial-eyebrow !text-gear-accent inline-flex items-center gap-1.5">
          Criar {{ option.tipo }}
          <AppIcon name="arrow-right" class="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </NuxtLink>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
const OPTIONS = [
  {
    tipo: 'review',
    label: 'Review',
    icon: 'star',
    iconClass: 'border-gear-accent/40 bg-gear-accent/10 text-gear-accent',
    description: 'Avalie um produto: notas, prós, contras e review visual.',
  },
  {
    tipo: 'post',
    label: 'Post',
    icon: 'message-square',
    iconClass: 'border-gear-border bg-gear-surface text-gear-text',
    description: 'Compartilhe pensamentos, dúvidas ou discussões livremente.',
  },
]

const { isOpen } = useNewPost()
</script>
