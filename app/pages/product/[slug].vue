<template>
  <div>
    <PageHeader :title="product.brand" :accent="`${product.name}.`" :subtitle="product.category">
      <NuxtLink :to="{ path: '/compare', query: { p: product.id } }" class="btn-primary inline-flex items-center gap-2 shrink-0"><AppIcon name="git-compare" class="w-4 h-4" />Comparar</NuxtLink>
    </PageHeader>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <div class="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start mb-12">
        <div class="space-y-8 min-w-0">
          <div class="reveal glass-card overflow-hidden" v-reveal>
            <img v-if="product.image" :src="product.image" :alt="product.name" class="block w-full h-auto" />
            <div v-else class="aspect-[4/3] grid place-items-center text-gear-muted text-sm uppercase tracking-widest">{{ product.brand }}</div>
          </div>

          <section v-if="product.about" class="reveal" v-reveal>
            <p class="editorial-eyebrow mb-3">Sobre</p>
            <p class="text-gear-text-secondary leading-relaxed">{{ product.about }}</p>
          </section>

          <section v-if="product.specs?.length" class="reveal" v-reveal>
            <p class="editorial-eyebrow mb-4">Especificações</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div v-for="spec in product.specs" :key="spec.label" class="glass-card p-4 min-w-0">
                <p class="editorial-eyebrow mb-1 truncate">{{ spec.label }}</p>
                <p class="text-sm font-medium truncate">{{ spec.value }}</p>
              </div>
            </div>
          </section>
        </div>

        <div class="reveal glass-card p-6 lg:p-7" v-reveal>
          <p class="editorial-eyebrow mb-4">Pontuação média da comunidade</p>
          <div class="flex items-baseline gap-3 mb-1">
            <span class="font-display italic font-extrabold text-6xl leading-none tabular-nums text-gear-primary">{{ product.score?.toFixed(1) }}</span>
            <span class="text-sm text-gear-muted">/ 10</span>
          </div>
          <p class="text-xs text-gear-muted mb-6">{{ product.reviewCount }} {{ product.reviewCount === 1 ? 'review' : 'reviews' }} da comunidade</p>
          <RadarChart v-if="averages.length >= 3" :axes="averages" class="mb-6" />
          <ScoreBar v-if="averages.length" :sub-scores="averages" />
        </div>
      </div>

      <section class="max-w-2xl">
        <p class="editorial-eyebrow mb-6">Reviews da comunidade</p>
        <div v-if="reviews.length" class="space-y-8">
          <ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
        </div>
        <p v-else class="text-sm text-gear-muted">Este produto ainda não tem reviews publicadas aqui.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productPath, useMockProducts, useMockReviews } from '~/composables/useGearData'

const route = useRoute()
const found = useMockProducts().find(p => productPath(p) === `/product/${route.params.slug}`)
if (!found) {
  throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado', fatal: true })
}
const product = found

useHead({ title: `${product.name} · GearHub` })

const reviews = useMockReviews().filter(r => r.product.id === product.id)

// Média de cada critério entre as reviews do produto
const averages = [...new Set(reviews.flatMap(r => r.subScores.map(s => s.label)))].map((label) => {
  const values = reviews.flatMap(r => r.subScores.filter(s => s.label === label).map(s => s.value))
  return { label, value: values.reduce((sum, v) => sum + v, 0) / values.length }
})
</script>
