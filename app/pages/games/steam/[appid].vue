<template>
  <!-- Jogo da Steam sem ficha no catálogo: mesmo layout da página do jogo, com o que a coleta da Steam tem -->
  <div v-if="detail">
    <GameHero
      :name="game.name"
      :cover="coverUrl"
      :subtitle="[detail.releaseDate, detail.developers].filter(Boolean).join(' · ') || 'Steam'"
      platforms="PC"
      @cover-error="coverFailed = true"
    >
      <span v-for="genre in game.genres" :key="genre" class="rounded-full border border-gear-border px-2.5 py-1 text-xs text-gear-text-secondary">{{ genre }}</span>
    </GameHero>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-8">
      <div class="min-w-0 space-y-8">
        <section v-if="detail.shortDescription" aria-labelledby="about-title">
          <h2 id="about-title" class="font-display italic font-extrabold uppercase text-2xl mb-3">Sobre</h2>
          <p class="text-sm text-gear-text-secondary leading-relaxed">{{ detail.shortDescription }}</p>
        </section>

        <SteamPanel :appid="appid" />
      </div>

      <aside class="space-y-4 lg:sticky lg:top-6 self-start">
        <dl v-if="factRows.length" class="glass-card p-5 space-y-4 text-sm">
          <div v-for="row in factRows" :key="row.label">
            <dt class="text-[11px] uppercase tracking-widest font-bold text-gear-muted">{{ row.label }}</dt>
            <dd class="mt-1 text-gear-text-secondary">{{ row.value }}</dd>
          </div>
        </dl>

        <div class="glass-card p-5">
          <h2 class="text-[11px] uppercase tracking-widest font-bold text-gear-muted mb-3">Onde encontrar</h2>
          <a :href="`https://store.steampowered.com/app/${appid}`" target="_blank" rel="noopener noreferrer" class="btn-outline !px-3 !py-1.5 text-xs">
            Steam<span class="sr-only"> (abre em nova aba)</span>
          </a>
        </div>

        <p class="text-[11px] text-gear-muted px-1">Este jogo ainda não tem ficha no IGDB. Dados: Steam.</p>
      </aside>
    </div>
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

const game = computed(() => detail.value!.summary)

// Capa vertical da biblioteca da Steam; se o jogo não tiver, usa a imagem larga da loja
const coverFailed = ref(false)
const coverUrl = computed(() => coverFailed.value || !Number.isInteger(appid)
  ? game.value.headerImage ?? ''
  : `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`)

const factRows = computed(() => [
  { label: 'Lançamento', value: detail.value?.releaseDate },
  { label: 'Desenvolvedora', value: detail.value?.developers },
  { label: 'Gêneros', value: game.value.genres.join(', ') },
].filter(row => row.value))

useHead({ title: () => `${game.value.name} · Games · GearHub` })
</script>
