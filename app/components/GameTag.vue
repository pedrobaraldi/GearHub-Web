<template>
  <!-- Jogo de que o post fala: capa e nome. No feed leva à página do jogo; na prévia do formulário é só visual -->
  <!-- group/tag: só reage ao mouse em cima da etiqueta, não ao passar pelo card inteiro -->
  <component
    :is="static ? 'div' : NuxtLink"
    v-bind="static ? {} : { to: `/games/${game.slug}` }"
    class="group/tag relative z-10 inline-flex max-w-full items-center gap-3 rounded-xl border border-gear-border bg-gear-surface/60 py-1.5 pl-1.5 pr-3"
    :class="{ 'hover:bg-gear-surface hover:border-gear-text/25 transition-colors': !static }"
  >
    <span class="w-9 aspect-[3/4] rounded-md overflow-hidden bg-gear-card shrink-0">
      <img v-if="game.coverUrl" :src="game.coverUrl" :alt="static ? '' : `Capa de ${game.name}`" loading="lazy" class="w-full h-full object-cover" />
    </span>
    <span class="min-w-0">
      <span class="block text-[10px] uppercase tracking-widest font-bold text-gear-muted">Sobre o jogo</span>
      <span class="block text-sm font-semibold truncate">{{ game.name }}</span>
    </span>
    <AppIcon
      v-if="!static"
      name="chevron-right"
      class="w-4 h-4 shrink-0 text-gear-muted transition-transform group-hover/tag:translate-x-0.5 group-hover/tag:text-gear-text"
    />
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

defineProps<{ game: { slug: string, name: string, coverUrl: string | null }, static?: boolean }>()
</script>
