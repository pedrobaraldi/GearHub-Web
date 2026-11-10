<template>
  <article class="reveal glass-card neon-hover group relative overflow-hidden flex flex-col" v-reveal>
    <div class="relative aspect-[4/3] bg-gear-surface overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <!-- Sem foto: a marca em destaque no lugar -->
      <div v-else class="w-full h-full grid place-items-center bg-gradient-to-br from-gear-surface to-transparent">
        <span class="font-display italic font-extrabold uppercase text-3xl text-gear-text/25 tracking-tight">{{ product.brand }}</span>
      </div>
      <!-- Nota sempre sobre a foto, no canto -->
      <div v-if="product.score" class="absolute top-2 right-2 rounded-xl bg-black/70 backdrop-blur">
        <ScoreBox :score="product.score" small />
      </div>
    </div>

    <div class="p-3 sm:p-4 flex flex-col flex-1">
      <p class="text-[11px] text-gear-muted truncate">{{ product.brand }}, {{ product.category }}</p>
      <h3 class="text-sm font-semibold line-clamp-2 mt-0.5">
        <!-- O ::after estica o link por todo o card -->
        <NuxtLink :to="productPath(product)" class="after:absolute after:inset-0">{{ product.name }}</NuxtLink>
      </h3>
      <!-- Rodapé: reviews à esquerda, ação do card à direita -->
      <div class="flex items-center justify-between gap-2 mt-auto pt-3">
        <span class="text-[11px] text-gear-muted">{{ product.reviewCount ? `${product.reviewCount} review${product.reviewCount !== 1 ? 's' : ''}` : 'Sem reviews' }}</span>
        <div v-if="$slots.default" class="relative z-10">
          <slot />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useGearData'
import { productPath } from '~/composables/useGearData'

defineProps<{ product: Product }>()
</script>
