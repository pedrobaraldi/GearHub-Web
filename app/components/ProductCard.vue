<template>
  <article class="reveal glass-card neon-hover group/product relative overflow-hidden flex flex-col" v-reveal>
    <div class="relative aspect-[16/10] bg-gear-surface overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover/product:scale-[1.03]"
      />
      <!-- Sem foto: o ícone da categoria, discreto -->
      <div v-else class="w-full h-full grid place-items-center bg-gradient-to-br from-gear-surface via-gear-card to-gear-sidebar">
        <AppIcon :name="CATEGORY_ICONS[product.category] ?? 'package'" class="w-10 h-10 text-gear-text/15" />
      </div>
    </div>

    <div class="p-3 sm:p-4 flex flex-col flex-1">
      <p class="text-[10px] uppercase tracking-widest font-bold text-gear-muted truncate">{{ product.category }}</p>
      <h3 class="text-sm sm:text-base font-semibold leading-snug line-clamp-2 mt-1">
        <!-- O ::after estica o link por todo o card -->
        <NuxtLink :to="productPath(product)" class="after:absolute after:inset-0 group-hover/product:text-gear-primary transition-colors">{{ product.name }}</NuxtLink>
      </h3>
      <p class="text-xs text-gear-muted truncate mt-0.5 mb-3">{{ product.brand }}</p>

      <!-- Rodapé: nota e reviews à esquerda, ação do card à direita -->
      <div class="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gear-border/60">
        <span v-if="product.score" class="flex items-baseline gap-1.5 min-w-0">
          <span class="font-display italic font-extrabold text-xl leading-none tabular-nums" :class="useScoreColor(product.score)">{{ product.score.toFixed(1) }}</span>
          <span class="text-[11px] text-gear-muted truncate">{{ product.reviewCount }} {{ product.reviewCount === 1 ? 'review' : 'reviews' }}</span>
        </span>
        <span v-else class="text-[11px] text-gear-muted">Sem nota ainda</span>
        <div v-if="$slots.default" class="relative z-10 shrink-0">
          <slot />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useGearData'
import { productPath, useScoreColor } from '~/composables/useGearData'

defineProps<{ product: Product }>()

// Ícone de cada categoria quando o produto não tem foto
const CATEGORY_ICONS: Record<string, string> = {
  'Mouse': 'mouse',
  'Teclado': 'keyboard',
  'Monitor': 'monitor',
  'Controle': 'gamepad',
}
</script>
