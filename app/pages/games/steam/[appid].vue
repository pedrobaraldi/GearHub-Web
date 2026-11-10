<template>
  <!-- Jogo da Steam sem página no catálogo: mostra só o que a coleta da Steam tem -->
  <div v-if="detail" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
    <BackButton class="mb-5" />

    <section class="glass-card overflow-hidden mb-6">
      <img v-if="detail.summary.headerImage" :src="detail.summary.headerImage" :alt="detail.summary.name" class="w-full max-h-72 object-cover" />
      <div class="p-5 sm:p-6">
        <h1 class="font-display italic font-extrabold uppercase text-3xl sm:text-4xl leading-[0.95] tracking-tight">{{ detail.summary.name }}</h1>
        <p class="text-sm text-gear-muted mt-2">
          <template v-if="detail.developers">{{ detail.developers }}</template>
          <template v-if="detail.developers && detail.releaseDate">, </template>
          <template v-if="detail.releaseDate">lançado em {{ detail.releaseDate }}</template>
        </p>
        <ul v-if="detail.summary.genres.length" class="flex flex-wrap gap-2 mt-3" aria-label="Gêneros">
          <li v-for="genre in detail.summary.genres" :key="genre" class="text-xs rounded-full border border-gear-border px-2.5 py-1 text-gear-text-secondary">{{ genre }}</li>
        </ul>
        <p v-if="detail.shortDescription" class="text-sm text-gear-text-secondary leading-relaxed mt-4 max-w-2xl">{{ detail.shortDescription }}</p>
      </div>
    </section>

    <SteamPanel :appid="appid" />
  </div>
</template>

<script setup lang="ts">
import type { MarketGameDetail } from '~/utils/market'

const appid = Number(useRoute().params.appid)

// Com página no catálogo, o endereço da Steam leva para a página completa do jogo
const { data: link } = await useFetch<{ slug: string }>(`/api/v1/catalog/steam/${appid}`, { key: `steam-link-${appid}` })
if (link.value?.slug) {
  await navigateTo(`/games/${link.value.slug}`, { replace: true, redirectCode: 301 })
}

const { data: detail, error } = await useFetch<MarketGameDetail>(`/api/v1/market/games/${appid}`, { key: `market-${appid}` })
if (!link.value?.slug && (error.value || !detail.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Jogo não encontrado', fatal: true })
}

useHead({ title: () => `${detail.value?.summary.name ?? 'Jogo'} · Games · GearHub` })
</script>
