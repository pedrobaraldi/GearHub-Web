<template>
  <div v-if="game">
    <GameHero
      :name="game.name"
      :cover="game.coverUrl"
      :eyebrow="game.type && game.type !== 'Main Game' ? TYPE_LABELS[game.type] ?? game.type : null"
      :subtitle="[releaseLabel(game.releaseDate), game.developers.join(', ')].filter(Boolean).join(' · ') || 'Sem data de lançamento'"
      :platforms="game.platforms.map(platform => platform.abbreviation || platform.name).join(' · ') || null"
    >
      <span v-if="game.ageRating" class="rounded-md px-2 py-0.5 text-xs font-extrabold" :class="ageRatingClass(game.ageRating)" :title="`Classificação indicativa: ${game.ageRating === 'L' ? 'livre' : `${game.ageRating} anos`}`">
        {{ game.ageRating }}
      </span>
      <span v-if="ptLabel" class="rounded-full bg-gear-accent/15 px-2.5 py-1 text-xs font-semibold text-gear-accent">{{ ptLabel }}</span>
      <span v-for="genre in game.genres" :key="genre" class="rounded-full border border-gear-border px-2.5 py-1 text-xs text-gear-text-secondary">{{ genre }}</span>
    </GameHero>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-8">
      <div class="min-w-0 space-y-8">
        <!-- Notas e tempo para zerar -->
        <div class="grid sm:grid-cols-2 gap-3">
          <div class="glass-card p-5">
            <h2 class="text-xs text-gear-muted mb-3">Notas</h2>
            <dl class="grid grid-cols-3 gap-3 text-center">
              <div v-for="score in scores" :key="score.label">
                <dd class="font-display italic font-extrabold text-3xl leading-none tabular-nums" :class="score.value == null ? 'text-gear-muted' : scoreColor(score.value)">{{ score.value ?? '—' }}</dd>
                <dt class="text-[11px] font-semibold mt-1.5">{{ score.label }}</dt>
                <dd v-if="score.count" class="text-[10px] text-gear-muted">{{ score.count.toLocaleString('pt-BR') }} {{ score.count === 1 ? 'voto' : 'votos' }}</dd>
              </div>
            </dl>
          </div>
          <div class="glass-card p-5">
            <h2 class="text-xs text-gear-muted mb-3">Tempo para zerar</h2>
            <dl v-if="game.timeToBeat" class="grid grid-cols-3 gap-3 text-center">
              <div v-for="time in times" :key="time.label">
                <dd class="font-display italic font-extrabold text-3xl leading-none tabular-nums">{{ time.value != null ? `${time.value}h` : '—' }}</dd>
                <dt class="text-[11px] font-semibold mt-1.5">{{ time.label }}</dt>
              </div>
            </dl>
            <p v-else class="text-sm text-gear-muted">Ainda sem dados de tempo para este jogo.</p>
            <p v-if="game.timeToBeat?.count" class="text-[10px] text-gear-muted text-center mt-3">Média de {{ game.timeToBeat.count.toLocaleString('pt-BR') }} jogadores</p>
          </div>
        </div>

        <!-- Sobre -->
        <section v-if="game.summary || game.storyline" aria-labelledby="about-title">
          <h2 id="about-title" class="font-display italic font-extrabold uppercase text-2xl mb-3">Sobre</h2>
          <p v-if="game.summary" lang="en" class="text-sm text-gear-text-secondary leading-relaxed whitespace-pre-line">{{ game.summary }}</p>
          <details v-if="game.storyline" class="mt-4 group">
            <summary class="cursor-pointer text-sm font-semibold text-gear-primary hover:underline underline-offset-2">História</summary>
            <p lang="en" class="text-sm text-gear-text-secondary leading-relaxed whitespace-pre-line mt-3">{{ game.storyline }}</p>
          </details>
          <p class="text-[11px] text-gear-muted mt-3">Texto em inglês, como vem do IGDB.</p>
        </section>

        <!-- Imagens e trailer -->
        <section v-if="game.screenshots.length || trailer" aria-labelledby="media-title" class="space-y-4">
          <h2 id="media-title" class="font-display italic font-extrabold uppercase text-2xl">Imagens</h2>
          <div v-if="game.screenshots.length" class="glass-card overflow-hidden">
            <MediaGallery :images="game.screenshots" :alt="`Tela de ${game.name}`" />
          </div>
          <!-- O YouTube só carrega no clique: página mais leve e sem rastreio antes da hora -->
          <div v-if="trailer" class="glass-card overflow-hidden">
            <div class="relative aspect-video bg-black">
              <iframe
                v-if="playing"
                :src="`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&rel=0`"
                :title="trailer.name ?? `Trailer de ${game.name}`"
                class="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowfullscreen
              />
              <button v-else type="button" class="group absolute inset-0 w-full h-full" :aria-label="`Assistir ${trailer.name ?? 'trailer'}`" @click="playing = true">
                <img :src="`https://i.ytimg.com/vi/${trailer.youtubeId}/hqdefault.jpg`" alt="" loading="lazy" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <span class="absolute inset-0 grid place-items-center">
                  <span class="w-16 h-16 rounded-full bg-black/70 grid place-items-center text-white group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" class="w-7 h-7 ml-1" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </span>
              </button>
            </div>
            <div v-if="game.videos.length > 1" class="flex gap-2 overflow-x-auto p-3 border-t border-gear-border" role="group" aria-label="Vídeos">
              <button
                v-for="(video, index) in game.videos"
                :key="video.youtubeId"
                type="button"
                class="pill shrink-0"
                :class="index === videoIndex ? 'pill-active' : 'pill-idle'"
                :aria-pressed="index === videoIndex"
                @click="videoIndex = index; playing = false"
              >
                {{ video.name ?? `Vídeo ${index + 1}` }}
              </button>
            </div>
          </div>
        </section>

        <!-- O que a comunidade da GearHub diz: nota média das reviews, reviews e posts sobre o jogo -->
        <section id="comunidade" class="scroll-mt-24" aria-labelledby="community-title">
          <div class="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <h2 id="community-title" class="font-display italic font-extrabold uppercase text-2xl">Na GearHub</h2>
              <p class="text-xs text-gear-muted mt-1">
                <template v-if="community.reviewCount">{{ community.reviewCount }} {{ community.reviewCount === 1 ? 'review' : 'reviews' }} da comunidade</template>
                <template v-else>Ninguém avaliou este jogo ainda.</template>
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div v-if="community.score != null" class="text-right">
                <p class="font-display italic font-extrabold text-4xl leading-none tabular-nums" :class="scoreColor(Number(community.score) * 10)">{{ Number(community.score).toFixed(1) }}</p>
                <p class="text-[11px] text-gear-muted mt-1">nota GearHub</p>
              </div>
              <NuxtLink :to="{ path: '/new', query: { tipo: 'review', jogo: game.slug } }" class="btn-publish !py-0 min-h-[2.75rem]">
                <AppIcon name="star" class="w-4 h-4" />
                Escrever review
              </NuxtLink>
            </div>
          </div>
          <div v-if="communityItems.length" class="space-y-8">
            <template v-for="item in communityItems" :key="item.id">
              <ReviewCard v-if="item.kind === 'review'" :review="toReview(item)" />
              <PostCard v-else :item="item" />
            </template>
          </div>
          <p v-else class="glass-card p-6 text-sm text-gear-muted text-center">
            Seja a primeira pessoa a falar de {{ game.name }}: escreva uma review ou um post no tópico Games.
          </p>
        </section>

        <!-- Preço e jogadores, quando a GearHub acompanha o jogo na Steam -->
        <SteamPanel v-if="steam" :appid="steam.appid" />

        <section v-for="group in relatedGroups" :key="group.title" :aria-label="group.title">
          <h2 class="font-display italic font-extrabold uppercase text-2xl mb-4">{{ group.title }}</h2>
          <ul class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <li v-for="item in group.items" :key="item.slug"><GameCoverCard :game="item" /></li>
          </ul>
        </section>
      </div>

      <!-- Ficha técnica e links -->
      <aside class="space-y-4 lg:sticky lg:top-6 self-start">
        <dl class="glass-card p-5 space-y-4 text-sm">
          <div v-for="row in factRows" :key="row.label">
            <dt class="text-[11px] uppercase tracking-widest font-bold text-gear-muted">{{ row.label }}</dt>
            <dd class="mt-1 text-gear-text-secondary">{{ row.value }}</dd>
          </div>
        </dl>

        <div v-if="multiplayerLines.length" class="glass-card p-5">
          <h2 class="text-[11px] uppercase tracking-widest font-bold text-gear-muted mb-2">Multiplayer</h2>
          <ul class="space-y-1.5 text-sm text-gear-text-secondary">
            <li v-for="line in multiplayerLines" :key="line" class="flex items-center gap-2">
              <AppIcon name="check" class="w-3.5 h-3.5 text-gear-accent shrink-0" />{{ line }}
            </li>
          </ul>
        </div>

        <div v-if="game.links.length" class="glass-card p-5">
          <h2 class="text-[11px] uppercase tracking-widest font-bold text-gear-muted mb-3">Onde encontrar</h2>
          <div class="flex flex-wrap gap-2">
            <a v-for="link in game.links" :key="link.label" :href="link.url" target="_blank" rel="noopener noreferrer nofollow" class="btn-outline !px-3 !py-1.5 text-xs">
              {{ link.label }}<span class="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </div>

        <!-- Crédito pedido pelo IGDB, em lugar fixo e visível -->
        <p class="text-[11px] text-gear-muted px-1">
          Dados do jogo: <a :href="`https://www.igdb.com/games/${game.slug}`" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-gear-text">IGDB.com</a>
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedPage } from '~/composables/useFeed'
import { toReview } from '~/composables/useFeed'
import { ageRatingClass, portugueseLabel, releaseLabel, type CatalogGameResponse } from '~/utils/catalog'

const TYPE_LABELS: Record<string, string> = {
  'Remake': 'Remake',
  'Remaster': 'Remaster',
  'Expanded Game': 'Versão expandida',
  'Standalone Expansion': 'Expansão independente',
  'Port': 'Port',
  'Expansion': 'Expansão',
  'DLC': 'DLC',
  'Bundle': 'Pacote',
}

const slug = useRoute().params.slug as string

const { data, error } = await useFetch<CatalogGameResponse>(`/api/v1/catalog/games/${slug}`, { key: `catalog-${slug}` })
if (error.value || !data.value) {
  const status = error.value?.statusCode === 503 ? 503 : 404
  throw createError({
    statusCode: status,
    statusMessage: status === 503 ? 'O catálogo de jogos está indisponível agora. Tente de novo em instantes.' : 'Jogo não encontrado',
    fatal: true,
  })
}

const game = computed(() => data.value!.game)
const steam = computed(() => data.value!.steam)
const community = computed(() => data.value!.community)

// Reviews e posts da comunidade sobre o jogo
const { data: communityFeed } = await useFetch<FeedPage>('/api/v1/feed', { key: `game-feed-${slug}`, query: { game: slug, size: 10 } })
const communityItems = computed(() => communityFeed.value?.items ?? [])

useHead({ title: () => `${game.value.name} · Games · GearHub` })

const ptLabel = computed(() => portugueseLabel(game.value.portuguese))

const scores = computed(() => [
  { label: 'Crítica', value: game.value.ratings.critics, count: game.value.ratings.criticsCount },
  { label: 'Jogadores', value: game.value.ratings.users, count: game.value.ratings.usersCount },
  { label: 'Geral', value: game.value.ratings.total, count: null },
])

function scoreColor(value: number) {
  if (value >= 80) return 'text-gear-green'
  if (value >= 60) return 'text-gear-gold'
  return 'text-gear-red'
}

const times = computed(() => [
  { label: 'História', value: game.value.timeToBeat?.main ?? null },
  { label: 'Com extras', value: game.value.timeToBeat?.extras ?? null },
  { label: '100%', value: game.value.timeToBeat?.completionist ?? null },
])

const videoIndex = ref(0)
const playing = ref(false)
const trailer = computed(() => game.value.videos[videoIndex.value] ?? null)

const factRows = computed(() => [
  { label: 'Lançamento', value: releaseLabel(game.value.releaseDate) },
  { label: 'Desenvolvedora', value: game.value.developers.join(', ') },
  { label: 'Publicadora', value: game.value.publishers.join(', ') },
  { label: 'Franquia', value: game.value.franchise },
  { label: 'Modos', value: game.value.modes.join(', ') },
  { label: 'Perspectiva', value: game.value.perspectives.join(', ') },
  { label: 'Temas', value: game.value.themes.join(', ') },
  { label: 'Engine', value: game.value.engines.join(', ') },
  { label: 'Plataformas', value: game.value.platforms.map(platform => platform.name).join(', ') },
].filter(row => row.value))

const multiplayerLines = computed(() => {
  const mode = game.value.multiplayer
  if (!mode) return []
  return [
    mode.onlineMax && mode.onlineMax > 1 ? `Online até ${mode.onlineMax} jogadores` : null,
    mode.onlineCoop ? 'Co-op online' : null,
    mode.campaignCoop ? 'Campanha em co-op' : null,
    mode.offlineCoop ? 'Co-op local' : null,
    mode.splitscreen ? 'Tela dividida' : null,
    mode.lanCoop ? 'Co-op em rede local (LAN)' : null,
    mode.offlineMax && mode.offlineMax > 1 ? `Até ${mode.offlineMax} no mesmo aparelho` : null,
  ].filter((line): line is string => !!line)
})

const relatedGroups = computed(() => [
  { title: 'Expansões', items: game.value.expansions },
  { title: 'DLCs', items: game.value.dlcs },
  { title: 'Jogos parecidos', items: game.value.similar },
].filter(group => group.items.length))
</script>
