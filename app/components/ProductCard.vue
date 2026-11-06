<template>
  <article class="reveal glass-card neon-hover group relative overflow-hidden flex flex-col" v-reveal>
    <div class="relative aspect-[4/3] sm:aspect-video bg-gear-surface overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div v-else class="w-full h-full grid place-items-center text-gear-muted text-xs uppercase tracking-widest">{{ product.brand }}</div>
      <!-- Na coluna estreita do celular a nota fica sobre a foto -->
      <div v-if="product.score" class="sm:hidden absolute top-2 right-2 rounded-xl bg-gear-card/85 backdrop-blur">
        <ScoreBox :score="product.score" small />
      </div>
    </div>

    <div class="p-3 sm:p-4 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[11px] text-gear-muted truncate">{{ product.brand }} · {{ product.category }}</p>
        <h3 class="text-sm font-semibold line-clamp-2 sm:line-clamp-1">
          <!-- O ::after estica o link por todo o card -->
          <NuxtLink :to="productPath(product)" class="after:absolute after:inset-0">{{ product.name }}</NuxtLink>
        </h3>
      </div>
      <ScoreBox v-if="product.score" class="hidden sm:flex" :score="product.score" small />
    </div>

    <div v-if="$slots.default" class="relative z-10 px-3 pb-3 sm:px-4 sm:pb-4 mt-auto">
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useGearData'
import { productPath } from '~/composables/useGearData'

defineProps<{ product: Product }>()
</script>
