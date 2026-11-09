<template>
  <div class="flex items-center gap-3 p-2 pr-3 rounded-xl bg-gear-surface">
    <ProductThumb :image="item.imageUrl" :name="item.name" class="w-10 h-10" />
    <div class="flex-1 min-w-0">
      <p class="text-[11px] text-gear-muted truncate">{{ item.reviewAuthor ? `Review de ${item.reviewAuthor}` : item.categoryName }}</p>
      <p class="text-sm font-semibold uppercase tracking-tight leading-tight line-clamp-2">{{ productTitle(item) }}</p>
    </div>
    <NuxtLink :to="{ path: `/product/${item.slug}`, query: item.reviewId ? { review: item.reviewId } : undefined }" class="btn-primary shrink-0 !text-xs !px-3 lg:!py-1.5">{{ linkLabel }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { GameGear } from '~/components/GameConfigView.vue'

const props = defineProps<{ item: GameGear }>()

const linkLabel = computed(() => {
  if (props.item.reviewId) return 'Ver review'
  const total = props.item.reviewCount
  if (!total) return 'Ver produto'
  return total === 1 ? 'Ver review' : `Ver ${total} reviews`
})
</script>
