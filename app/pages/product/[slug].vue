<template>
  <div>
    <PageHeader :title="product.brand" :accent="`${product.name}.`" :subtitle="product.category">
      <NuxtLink :to="{ path: '/compare', query: { p: product.slug } }" class="btn-primary inline-flex items-center gap-2 shrink-0"><AppIcon name="git-compare" class="w-4 h-4" />Comparar</NuxtLink>
    </PageHeader>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <div class="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start mb-12">
        <div class="space-y-8 min-w-0">
          <div class="reveal glass-card overflow-hidden" v-reveal>
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" class="block w-full h-auto" />
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
            <span class="font-display italic font-extrabold text-6xl leading-none tabular-nums text-gear-primary">{{ product.avgScore?.toFixed(1) }}</span>
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
          <!-- As do próprio produto vêm completas; as relacionadas levam à tela do produto delas -->
          <ReviewCard v-for="review in reviews" :key="review.id" :review="review" :full="review.product.id === slug" />
          <div v-if="cursor" class="text-center">
            <button class="pill pill-idle px-6" :disabled="loadingMore" @click="loadMore">
              {{ loadingMore ? 'Carregando...' : 'Carregar mais' }}
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-gear-muted">Ainda não há reviews deste produto nem de categorias relacionadas.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedItem, FeedPage } from '~/composables/useFeed'
import type { Review } from '~/composables/useGearData'
import { toReview } from '~/composables/useFeed'
import { toApiFailure } from '~/composables/useAuth'

const PAGE_SIZE = 50

interface ProductDetail {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  imageUrl: string | null
  about: string | null
  specs: { label: string, value: string }[]
  avgScore: number | null
  reviewCount: number
}

const route = useRoute()
const slug = route.params.slug as string
const headers = useRequestHeaders(['cookie'])

const { data, error } = await useFetch<ProductDetail>(`/api/v1/products/${slug}`, { key: `product-${slug}` })
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado', fatal: true })
}
const product = data.value

useHead({ title: `${product.name} · GearHub` })

const { data: feed } = await useFetch<FeedPage>(`/api/v1/feed?product=${slug}&size=${PAGE_SIZE}`, { key: `product-reviews-${slug}`, headers })

const toast = useToast()
const extraItems = ref<FeedItem[]>([])
const extraCursor = ref<string | null | undefined>(undefined)
const loadingMore = ref(false)
const cursor = computed(() => (extraCursor.value === undefined ? feed.value?.nextCursor : extraCursor.value))

async function loadMore() {
  loadingMore.value = true
  try {
    const page = await $fetch<FeedPage>('/api/v1/feed', { query: { product: slug, size: PAGE_SIZE, before: cursor.value } })
    extraItems.value = [...extraItems.value, ...page.items]
    extraCursor.value = page.nextCursor
  }
  catch (failure) {
    toast.error(toApiFailure(failure).message)
  }
  finally {
    loadingMore.value = false
  }
}

// A review aberta vem primeiro, depois as do produto e as relacionadas, das mais curtidas para as menos
const priority = (review: Review) => (review.id === route.query.review ? 2 : review.product.id === slug ? 1 : 0)

const reviews = computed(() =>
  [...(feed.value?.items ?? []), ...extraItems.value]
    .map(toReview)
    .sort((a, b) => priority(b) - priority(a) || b.likes - a.likes),
)

const ownReviews = computed(() => reviews.value.filter(review => review.product.id === slug))

// Média de cada critério entre as reviews do produto
const averages = computed(() =>
  [...new Set(ownReviews.value.flatMap(r => r.subScores.map(s => s.label)))].map((label) => {
    const values = ownReviews.value.flatMap(r => r.subScores.filter(s => s.label === label).map(s => s.value))
    return { label, value: values.reduce((sum, v) => sum + v, 0) / values.length }
  }),
)
</script>
