<template>
  <div>
    <PageHeader root title="Seus" accent="Salvos." subtitle="Publicações que você guardou para ver depois." />

    <div class="px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <div class="max-w-2xl mx-auto space-y-8">
        <template v-for="item in items" :key="item.id">
          <ReviewCard v-if="item.kind === 'review'" :review="toReview(item)" />
          <PostCard v-else :item="item" />
        </template>

        <div v-if="!items.length" class="glass-card p-10 text-center">
          <AppIcon name="bookmark" class="w-8 h-8 mx-auto mb-4 text-gear-accent" />
          <p class="text-sm font-semibold mb-1">Nada salvo ainda</p>
          <p class="text-xs text-gear-muted mb-5">Toque no marcador de uma publicação para encontrá-la aqui.</p>
          <NuxtLink to="/" class="btn-primary inline-block">Ver o feed</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedPage } from '~/composables/useFeed'
import { toReview } from '~/composables/useFeed'

useHead({ title: 'Salvos · GearHub' })

const { data } = await useFetch<FeedPage>('/api/v1/me/saved', {
  query: { size: 50 },
  key: 'saved-feed',
  headers: useRequestHeaders(['cookie']),
})

const items = computed(() => data.value?.items ?? [])
</script>
