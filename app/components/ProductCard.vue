<template>
  <article class="reveal glass-card neon-hover group relative overflow-hidden flex flex-col" v-reveal>
    <div class="aspect-video bg-gear-surface overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div v-else class="w-full h-full grid place-items-center text-gear-muted text-xs uppercase tracking-widest">{{ product.brand }}</div>
    </div>

    <div class="p-4 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[11px] text-gear-muted truncate">{{ product.brand }} · {{ product.category }}</p>
        <h3 class="text-sm font-semibold truncate">
          <!-- O ::after estica o link por todo o card -->
          <NuxtLink :to="productPath(product)" class="after:absolute after:inset-0">{{ product.name }}</NuxtLink>
        </h3>
      </div>
      <ScoreBox v-if="product.score" :score="product.score" small />
    </div>

    <div v-if="$slots.default" class="relative z-10 px-4 pb-4 mt-auto">
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useGearData'
import { productPath } from '~/composables/useGearData'

defineProps<{ product: Product }>()
</script>
