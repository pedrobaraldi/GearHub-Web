<template>
  <div v-if="store">
    <!-- Banner e identidade da loja -->
    <div class="relative h-36 sm:h-52 bg-gear-surface overflow-hidden border-b border-gear-border">
      <img v-if="store.bannerUrl" :src="store.bannerUrl" alt="" class="w-full h-full object-cover">
    </div>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
        <span class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-gear-surface border-4 border-gear-bg grid place-items-center shrink-0">
          <img v-if="store.logoUrl" :src="store.logoUrl" :alt="`Logo de ${store.name}`" class="w-full h-full object-cover">
          <AppIcon v-else name="store" class="w-8 h-8 text-gear-muted" />
        </span>
        <div class="min-w-0 pb-1">
          <p class="text-[11px] uppercase tracking-wider text-gear-accent font-bold">Loja parceira</p>
          <h1 class="font-display italic font-extrabold uppercase text-3xl sm:text-4xl leading-tight tracking-tight break-words">{{ store.name }}</h1>
          <p v-if="store.segment" class="text-sm text-gear-muted">{{ store.segment }}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-[1fr_280px] gap-8 py-8">
        <section aria-labelledby="store-products">
          <h2 id="store-products" class="font-display italic font-extrabold uppercase text-2xl mb-4">Produtos</h2>
          <ul v-if="store.products.length" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <li v-for="product in store.products" :key="product.id"><MarketProductCard :product="product" /></li>
          </ul>
          <p v-else class="glass-card p-6 text-sm text-gear-muted text-center">A loja ainda não publicou produtos.</p>
        </section>

        <aside class="space-y-4">
          <div v-if="store.description" class="glass-card p-4">
            <h2 class="text-sm font-semibold mb-2">Sobre a loja</h2>
            <p class="text-sm text-gear-text-secondary whitespace-pre-line leading-relaxed">{{ store.description }}</p>
          </div>
          <div v-if="store.website || store.instagram" class="glass-card p-4 space-y-2 text-sm">
            <a v-if="store.website" :href="store.website" target="_blank" rel="noopener noreferrer nofollow" class="flex items-center gap-2 text-gear-primary hover:underline underline-offset-2 break-all">
              <AppIcon name="external-link" class="w-4 h-4 shrink-0" />{{ store.website.replace(/^https?:\/\//, '') }}
            </a>
            <a v-if="store.instagram" :href="`https://instagram.com/${store.instagram}`" target="_blank" rel="noopener noreferrer nofollow" class="flex items-center gap-2 text-gear-primary hover:underline underline-offset-2">
              <AppIcon name="external-link" class="w-4 h-4 shrink-0" />@{{ store.instagram }}
            </a>
          </div>
          <p class="text-xs text-gear-muted">A compra, o pagamento e a entrega acontecem no site da loja.</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MarketStorePage } from '~/composables/useMarketplace'

definePageMeta({ public: true })

const route = useRoute()
const slug = String(route.params.slug)
const { data: store, error } = await useFetch<MarketStorePage>(`/api/v1/marketplace/stores/${encodeURIComponent(slug)}`, {
  key: `market-store-${slug}`,
})
if (error.value || !store.value) {
  throw createError({ statusCode: 404, statusMessage: 'Loja não encontrada', fatal: true })
}
useSeoMeta({
  title: `${store.value.name} · Marketplace · GearHub`,
  description: store.value.description?.slice(0, 160) ?? `Produtos da loja parceira ${store.value.name} no GearHub.`,
})
</script>
