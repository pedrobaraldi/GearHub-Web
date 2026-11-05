<template>
  <article v-if="!removed" class="reveal space-y-4" v-reveal>
    <UserAvatar
      :user="review.user"
      :meta="`${formatDate(review.date)} · ${review.product.brand} · ${review.product.category}`"
    >
      <p class="text-[11px] text-gear-muted mt-1.5">
        <span class="uppercase tracking-widest font-bold text-[9px] mr-1.5">Produto</span>
        <NuxtLink :to="productPath(review.product)" class="text-gear-text font-medium hover:text-gear-primary transition-colors">{{ review.product.name }}</NuxtLink>
      </p>
    </UserAvatar>

    <div class="glass-card neon-hover group relative overflow-hidden">
      <MediaGallery v-if="gallery.length" :images="gallery" :alt="review.product.name" />

      <div class="p-6 lg:p-8">
        <div class="flex items-start justify-between gap-6">
          <div class="min-w-0">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight leading-snug">
              <!-- O ::after estica o link por todo o card -->
              <NuxtLink :to="productPath(review.product)" class="after:absolute after:inset-0">{{ review.title }}</NuxtLink>
            </h2>
            <p v-if="review.body" class="text-sm text-gear-text-secondary leading-relaxed mt-2 line-clamp-3">{{ review.body }}</p>
          </div>
          <ScoreBox v-if="!review.unrated" :score="review.score" />
        </div>

        <div v-if="review.subScores.length || review.pros.length || review.cons.length" class="grid sm:grid-cols-2 gap-6 mt-6">
          <ScoreBar v-if="review.subScores.length" :sub-scores="review.subScores" />

          <div
            v-if="review.pros.length || review.cons.length"
            class="grid grid-cols-2 gap-4"
            :class="{ 'sm:border-l sm:border-gear-border sm:pl-6': review.subScores.length }"
          >
            <div v-if="review.pros.length">
              <h3 class="text-[10px] font-bold uppercase tracking-wider text-gear-green mb-2">▲ Prós</h3>
              <ul class="space-y-1.5">
                <li v-for="pro in review.pros" :key="pro" class="text-xs text-gear-muted">{{ pro }}</li>
              </ul>
            </div>
            <div v-if="review.cons.length">
              <h3 class="text-[10px] font-bold uppercase tracking-wider text-gear-red mb-2">▼ Contras</h3>
              <ul class="space-y-1.5">
                <li v-for="con in review.cons" :key="con" class="text-xs text-gear-muted">{{ con }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Ficha técnica preenchida por quem avaliou -->
        <dl v-if="review.specs?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-6 pt-4 border-t border-gear-border">
          <div v-for="spec in review.specs" :key="spec.label" class="min-w-0">
            <dt class="editorial-eyebrow truncate">{{ spec.label }}</dt>
            <dd class="text-xs text-gear-text-secondary break-words">{{ spec.value }}</dd>
          </div>
        </dl>

        <ContentActions
          class="mt-6"
          kind="review"
          :id="review.id"
          :like-count="review.likes"
          :comment-count="review.comments"
          :liked-by-me="review.likedByMe"
          :saved-by-me="review.savedByMe"
          :mine="review.mine"
          @deleted="removed = true"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Review } from '~/composables/useGearData'
import { formatDate, productPath } from '~/composables/useGearData'

const props = defineProps<{ review: Review }>()

const removed = ref(false)
const gallery = computed(() => {
  if (props.review.images?.length) return props.review.images
  return props.review.product.image ? [props.review.product.image] : []
})
</script>
