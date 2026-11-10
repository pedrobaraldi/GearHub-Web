<template>
  <!-- Capa vertical do jogo, como numa estante: busca, DLCs e jogos parecidos -->
  <NuxtLink :to="`/games/${game.slug}`" class="group/cover block min-w-0">
    <div class="relative aspect-[3/4] rounded-xl overflow-hidden border border-gear-border bg-gradient-to-br from-gear-card via-gear-sidebar to-gear-bg">
      <img
        v-if="game.coverUrl && !broken"
        :src="game.coverUrl"
        alt=""
        loading="lazy"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-[1.04]"
        @error="broken = true"
      />
      <span v-else class="absolute inset-0 grid place-items-center p-3 text-center text-xs font-semibold text-gear-muted">{{ game.name }}</span>
      <span v-if="game.rating != null" class="absolute top-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white tabular-nums">{{ game.rating }}</span>
    </div>
    <p class="text-sm font-semibold mt-2 leading-snug line-clamp-2 group-hover/cover:text-gear-primary transition-colors">{{ game.name }}</p>
    <p v-if="game.year || game.platforms.length" class="text-[11px] text-gear-muted truncate">
      {{ [game.year, game.platforms.slice(0, 3).join(', ')].filter(Boolean).join(' · ') }}
    </p>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { CatalogCard } from '~/utils/catalog'

defineProps<{ game: CatalogCard }>()

const broken = ref(false)
</script>
