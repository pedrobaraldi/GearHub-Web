<template>
  <!-- Produto de loja parceira na vitrine -->
  <NuxtLink
    :to="`/marketplace/produto/${product.id}`"
    class="group glass-card overflow-hidden flex flex-col transition-colors hover:border-gear-primary/50 focus-visible:border-gear-primary/50"
  >
    <div class="aspect-square bg-gear-surface overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      >
      <div v-else class="w-full h-full grid place-items-center text-gear-muted">
        <AppIcon name="package" class="w-8 h-8" />
      </div>
    </div>
    <div class="p-3 flex flex-col gap-1 flex-1">
      <p class="text-[11px] uppercase tracking-wider text-gear-muted truncate">{{ product.storeName }}</p>
      <h3 class="text-sm font-semibold leading-snug line-clamp-2">{{ product.name }}</h3>
      <div class="mt-auto pt-2 flex items-center justify-between gap-2">
        <span class="text-sm font-bold">{{ formatPrice(product.price) ?? 'Ver na loja' }}</span>
        <span v-if="product.availability !== 'in_stock'" class="text-[11px] text-gear-muted">{{ AVAILABILITY_LABEL[product.availability] }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { AVAILABILITY_LABEL, formatPrice, type MarketProductCard } from '~/composables/useMarketplace'

defineProps<{ product: MarketProductCard }>()
</script>
