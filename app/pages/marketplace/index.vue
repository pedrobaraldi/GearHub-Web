<template>
  <div>
    <PageHeader root title="Marketplace" subtitle="Produtos de lojas parceiras do GearHub. A compra acontece no site da loja.">
      <NuxtLink v-if="partnerLink" :to="partnerLink.to" class="btn-publish !py-0 min-h-[2.75rem] shrink-0">
        <AppIcon name="store" class="w-4 h-4" />
        <span class="hidden sm:inline">{{ partnerLink.label }}</span>
      </NuxtLink>
    </PageHeader>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-8">
      <SearchBar v-model="term" placeholder="Buscar produto, loja ou categoria..." class="max-w-md" />

      <!-- Lojas -->
      <section v-if="!searching && stores?.length" aria-labelledby="stores-title">
        <h2 id="stores-title" class="font-display italic font-extrabold uppercase text-2xl mb-4">Lojas</h2>
        <ul class="flex gap-3 overflow-x-auto pb-1">
          <li v-for="store in stores" :key="store.slug" class="shrink-0">
            <NuxtLink :to="`/marketplace/loja/${store.slug}`" class="glass-card w-40 p-3 flex flex-col items-center gap-2 text-center hover:border-gear-primary/50 transition-colors">
              <span class="w-14 h-14 rounded-2xl overflow-hidden bg-gear-surface grid place-items-center">
                <img v-if="store.logoUrl" :src="store.logoUrl" :alt="`Logo de ${store.name}`" class="w-full h-full object-cover">
                <AppIcon v-else name="store" class="w-6 h-6 text-gear-muted" />
              </span>
              <span class="text-sm font-semibold truncate w-full">{{ store.name }}</span>
              <span class="text-[11px] text-gear-muted">{{ store.productCount }} {{ store.productCount === 1 ? 'produto' : 'produtos' }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- Produtos -->
      <section aria-labelledby="products-title" aria-live="polite">
        <h2 id="products-title" class="font-display italic font-extrabold uppercase text-2xl mb-4">{{ searching ? 'Resultados' : 'Produtos' }}</h2>
        <ul v-if="items.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <li v-for="product in items" :key="product.id"><MarketProductCard :product="product" /></li>
        </ul>
        <p v-else-if="!pending" class="glass-card p-6 text-sm text-gear-muted text-center">
          {{ searching ? 'Nenhum produto encontrado.' : 'Ainda não há produtos. As primeiras lojas parceiras chegam em breve.' }}
        </p>
        <div v-if="nextPage" class="text-center mt-6">
          <button type="button" class="btn-outline" :disabled="loadingMore" @click="loadMore">{{ loadingMore ? 'Carregando...' : 'Ver mais' }}</button>
        </div>
      </section>

      <p class="text-xs text-gear-muted">
        Os preços são informados pelas lojas e podem mudar. A compra, o pagamento e a entrega acontecem no site da loja parceira.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MarketProductCard, MarketStoreCard, PartnerApplication } from '~/composables/useMarketplace'

definePageMeta({ public: true })
useSeoMeta({
  title: 'Marketplace · GearHub',
  description: 'Periféricos e hardware de lojas parceiras do GearHub.',
})

interface ShowcasePage { items: MarketProductCard[], nextPage: number | null }

const { user } = useAuth()
const route = useRoute()
const term = ref(typeof route.query.q === 'string' ? route.query.q : '')
const query = ref(term.value.trim())
const searching = computed(() => query.value.length >= 2)

// Busca em tempo real, sem disparar uma requisição por tecla
let timer: ReturnType<typeof setTimeout> | undefined
watch(term, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => { query.value = value.trim() }, 300)
})

const { data: stores } = await useFetch<MarketStoreCard[]>('/api/v1/marketplace/stores', { key: 'market-stores' })
const { data: page, pending } = await useFetch<ShowcasePage>('/api/v1/marketplace/products', {
  key: 'market-products',
  query: computed(() => ({ q: searching.value ? query.value : undefined })),
})

const extra = ref<MarketProductCard[]>([])
const extraNext = ref<number | null | undefined>(undefined)
watch(page, () => { extra.value = []; extraNext.value = undefined })
const items = computed(() => [...(page.value?.items ?? []), ...extra.value])
const nextPage = computed(() => (extraNext.value === undefined ? page.value?.nextPage : extraNext.value))
const loadingMore = ref(false)

async function loadMore() {
  if (!nextPage.value) return
  loadingMore.value = true
  try {
    const more = await $fetch<ShowcasePage>('/api/v1/marketplace/products', {
      query: { q: searching.value ? query.value : undefined, page: nextPage.value },
    })
    extra.value.push(...more.items)
    extraNext.value = more.nextPage
  }
  finally {
    loadingMore.value = false
  }
}

// Logado: atalho para pedir a loja ou gerenciar a que já tem
const { data: application } = await useFetch<PartnerApplication | null>('/api/v1/marketplace/application', {
  key: 'market-application',
  immediate: !!user.value,
  default: () => null,
})
const partnerLink = computed(() => {
  if (!user.value) return null
  if (application.value?.storeSlug) return { to: '/marketplace/minha-loja', label: 'Minha loja' }
  return { to: '/marketplace/parceria', label: application.value ? 'Minha solicitação' : 'Abrir minha loja' }
})
</script>
