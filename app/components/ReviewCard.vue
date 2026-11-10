<template>
  <article v-if="!removed" class="reveal space-y-4" v-reveal>
    <UserAvatar
      :user="review.user"
      :meta="`${formatDate(review.date)} · ${review.product.brand} · ${review.product.category}`"
    >
      <p class="text-[11px] text-gear-muted mt-1.5">
        <span class="uppercase tracking-widest font-bold text-[11px] mr-1.5">{{ review.game ? 'Jogo' : 'Produto' }}</span>
        <NuxtLink :to="review.game ? `/games/${review.game.slug}` : `/product/${review.product.id}`" class="text-gear-text font-medium hover:text-gear-primary transition-colors">{{ review.product.name }}</NuxtLink>
      </p>
    </UserAvatar>

    <div class="glass-card neon-hover group relative overflow-hidden">
      <MediaGallery v-if="gallery.length" :images="gallery" :alt="review.product.name" />

      <div class="p-6 lg:p-8">
        <!-- Review de jogo: a capa leva à página do jogo, como no post -->
        <GameTag v-if="review.game" :game="review.game" class="mb-4" />
        <div class="flex items-start justify-between gap-6">
          <div class="min-w-0">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight leading-snug">
              <template v-if="full">{{ review.title }}</template>
              <!-- O ::after estica o link por todo o card -->
              <NuxtLink v-else :to="reviewLink" class="after:absolute after:inset-0">{{ review.title }}</NuxtLink>
            </h2>
            <p v-if="review.body" class="text-sm text-gear-text-secondary leading-relaxed mt-2 whitespace-pre-line" :class="{ 'line-clamp-3': !full }">{{ review.body }}</p>
          </div>
          <ScoreBox v-if="!review.unrated" :score="review.score" />
        </div>

        <div v-if="review.pros.length || review.cons.length" class="grid grid-cols-2 gap-4 sm:gap-6 mt-6">
          <div v-if="review.pros.length">
            <h3 class="text-[11px] font-bold uppercase tracking-wider text-gear-green mb-2">▲ Prós</h3>
            <ul class="space-y-1.5">
              <li v-for="pro in review.pros" :key="pro" class="text-sm text-gear-text-secondary">{{ pro }}</li>
            </ul>
          </div>
          <div v-if="review.cons.length">
            <h3 class="text-[11px] font-bold uppercase tracking-wider text-gear-red mb-2">▼ Contras</h3>
            <ul class="space-y-1.5">
              <li v-for="con in review.cons" :key="con" class="text-sm text-gear-text-secondary">{{ con }}</li>
            </ul>
          </div>
        </div>

        <template v-if="full">
          <section v-if="review.subScores.length" class="mt-6 pt-5 border-t border-gear-border">
            <h3 class="editorial-eyebrow mb-3">Notas por critério</h3>
            <div class="grid sm:grid-cols-2 gap-6 items-center">
              <RadarChart v-if="review.subScores.length >= 3" :axes="review.subScores" />
              <ScoreBar :sub-scores="review.subScores" />
            </div>
          </section>

          <!-- Ficha técnica preenchida por quem avaliou -->
          <section v-if="review.specs?.length" class="mt-6 pt-5 border-t border-gear-border">
            <h3 class="editorial-eyebrow mb-3">Ficha técnica</h3>
            <dl class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <div v-for="spec in review.specs" :key="spec.label" class="min-w-0">
                <dt class="text-xs text-gear-muted">{{ spec.label }}</dt>
                <dd class="text-sm font-medium break-words mt-0.5">{{ spec.value }}</dd>
              </div>
            </dl>
          </section>
        </template>

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
import { formatDate } from '~/composables/useGearData'

// No feed o card é um resumo; na tela do produto, com `full`, mostra tudo
const props = defineProps<{ review: Review, full?: boolean }>()

const removed = ref(false)

// Review de jogo abre na comunidade da página do jogo; a de hardware, na página do produto
const reviewLink = computed(() => (props.review.game
  ? { path: `/games/${props.review.game.slug}`, hash: '#comunidade' }
  : { path: `/product/${props.review.product.id}`, query: { review: props.review.id } }))

const gallery = computed(() => {
  if (props.review.images?.length) return props.review.images
  // A capa vertical do jogo não cabe no carrossel largo: ela aparece na etiqueta do jogo
  if (props.review.game) return []
  return props.review.product.image ? [props.review.product.image] : []
})
</script>
