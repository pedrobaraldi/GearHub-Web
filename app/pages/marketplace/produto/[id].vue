<template>
  <div v-if="product" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
    <BackButton class="mb-4" />
    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Fotos -->
      <div>
        <div class="aspect-square glass-card overflow-hidden grid place-items-center">
          <img v-if="current" :src="current" :alt="product.name" class="w-full h-full object-contain">
          <AppIcon v-else name="package" class="w-12 h-12 text-gear-muted" />
        </div>
        <ul v-if="product.images.length > 1" class="flex gap-2 mt-3 overflow-x-auto" aria-label="Fotos do produto">
          <li v-for="(image, index) in product.images" :key="image">
            <button
              type="button"
              class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors"
              :class="image === current ? 'border-gear-primary' : 'border-transparent'"
              :aria-label="`Ver foto ${index + 1}`"
              :aria-pressed="image === current"
              @click="current = image"
            >
              <img :src="image" alt="" class="w-full h-full object-cover">
            </button>
          </li>
        </ul>
      </div>

      <!-- Informações e compra -->
      <div class="flex flex-col gap-4">
        <NuxtLink :to="`/marketplace/loja/${product.storeSlug}`" class="inline-flex items-center gap-2 text-sm text-gear-muted hover:text-gear-text w-fit">
          <span class="w-7 h-7 rounded-lg overflow-hidden bg-gear-surface grid place-items-center">
            <img v-if="product.storeLogoUrl" :src="product.storeLogoUrl" alt="" class="w-full h-full object-cover">
            <AppIcon v-else name="store" class="w-4 h-4" />
          </span>
          {{ product.storeName }}
        </NuxtLink>
        <h1 class="font-display italic font-extrabold uppercase text-3xl sm:text-4xl leading-tight tracking-tight">{{ product.name }}</h1>
        <div class="flex flex-wrap items-center gap-3">
          <span v-if="formatPrice(product.price)" class="text-2xl font-bold">{{ formatPrice(product.price) }}</span>
          <span class="pill pill-idle">{{ AVAILABILITY_LABEL[product.availability] }}</span>
          <span v-if="product.category" class="pill pill-idle">{{ product.category }}</span>
        </div>

        <a
          :href="`${product.buyPath}?origem=produto`"
          target="_blank"
          rel="noopener nofollow sponsored"
          class="btn-publish !py-0 min-h-[3rem] justify-center w-full sm:w-fit sm:px-8"
        >
          Comprar na loja
          <AppIcon name="external-link" class="w-4 h-4" />
        </a>
        <p class="text-xs text-gear-muted leading-relaxed">
          Você será levado ao site de <strong>{{ product.storeName }}</strong>. A compra, o pagamento e a entrega acontecem lá,
          com as condições da loja. O preço é informado pela loja e pode mudar. Registramos o clique para medir as visitas que enviamos a ela.
        </p>

        <div v-if="product.description" class="glass-card p-4">
          <h2 class="text-sm font-semibold mb-2">Descrição</h2>
          <p class="text-sm text-gear-text-secondary whitespace-pre-line leading-relaxed">{{ product.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AVAILABILITY_LABEL, formatPrice, type MarketProductPage } from '~/composables/useMarketplace'

definePageMeta({ public: true })

const route = useRoute()
const id = String(route.params.id)
const { data: product, error } = await useFetch<MarketProductPage>(`/api/v1/marketplace/products/${encodeURIComponent(id)}`, {
  key: `market-product-${id}`,
})
if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado', fatal: true })
}
const current = ref(product.value.images[0] ?? null)
useSeoMeta({
  title: `${product.value.name} · ${product.value.storeName} · GearHub`,
  description: product.value.description?.slice(0, 160) ?? `${product.value.name} na loja parceira ${product.value.storeName}.`,
  ogImage: product.value.images[0],
})
</script>
