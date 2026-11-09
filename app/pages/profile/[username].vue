<template>
  <div ref="page">
    <!-- Banner de ponta a ponta, com altura contida; foto, insígnias e botão alinhados à coluna do perfil -->
    <div class="relative h-28 sm:h-40 lg:h-48 overflow-hidden border-b border-gear-border bg-gradient-to-br from-gear-card via-gear-sidebar to-gear-bg">
      <img v-if="profileData?.bannerUrl" :src="profileData.bannerUrl" alt="" class="absolute inset-0 w-full h-full object-cover" />
      <template v-else>
        <span data-orb class="absolute -top-24 right-[12%] w-80 h-80 rounded-full bg-gear-accent/25 blur-3xl" aria-hidden="true" />
        <span data-orb class="absolute -bottom-32 left-[8%] w-96 h-96 rounded-full bg-gear-primary/15 blur-3xl" aria-hidden="true" />
      </template>
      <!-- Escurece a base para a foto se destacar em qualquer banner -->
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gear-bg/70 to-transparent" aria-hidden="true" />
      <div class="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pt-4">
        <!-- Fundo próprio: precisa ser legível sobre qualquer banner, em qualquer tema -->
        <BackButton class="!bg-black/60 !text-white !border-white/25 backdrop-blur-md hover:!bg-black/75" />
      </div>
    </div>

    <div class="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10">
      <div class="relative flex items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-5">
        <div class="flex items-end gap-3 sm:gap-4 min-w-0">
          <div
            data-ring
            class="relative neon-ring rounded-full w-[100px] h-[100px] sm:w-[136px] sm:h-[136px] p-1 sm:p-[5px] shrink-0"
            :class="{ 'founder-ring': ring.founder }"
            :style="ring.founder ? undefined : { background: ring.color }"
            :title="rank.label"
          >
            <UserPhoto :src="person.avatar" :name="person.name" class="w-[92px] h-[92px] sm:w-[126px] sm:h-[126px] text-4xl sm:text-5xl border-4 border-gear-bg" />
          </div>
          <!-- Insígnias ao lado da foto, já abaixo do banner -->
          <ul v-if="shownBadges.length || isAdmin" data-enter class="flex items-center gap-1 rounded-lg border border-gear-border bg-gear-card px-1.5 py-1 mb-1 min-w-0 flex-wrap" aria-label="Insígnias">
            <li v-for="badge in shownBadges" :key="badge.key" class="group relative">
              <button type="button" class="block rounded-md hover:bg-gear-text/10 focus-visible:bg-gear-text/10 transition-colors" :aria-label="`Ver insígnia ${badge.name}`" @click="openBadge(badge.key)">
                <BadgeEmblem :badge="badge.key" :title="badge.name" class="block w-9 h-9" />
              </button>
              <span role="tooltip" class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-gear-sidebar border border-gear-border px-2 py-1 text-xs font-semibold opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
                {{ badge.name }}
              </span>
            </li>
            <li v-if="isAdmin">
              <button type="button" class="w-9 h-9 grid place-items-center rounded-md text-gear-muted hover:text-gear-text hover:bg-gear-text/10 transition-colors" aria-label="Gerenciar insígnias" title="Gerenciar insígnias" @click="badgesOpen = true">
                <AppIcon name="pencil" class="w-4 h-4" />
              </button>
            </li>
          </ul>
        </div>

        <div data-enter class="pb-1 shrink-0">
          <NuxtLink v-if="isMine" to="/account" class="btn-outline">
            <AppIcon name="pencil" class="w-4 h-4" />
            Editar perfil
          </NuxtLink>
          <button
            v-else
            class="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            :class="followedByMe ? 'border border-gear-border text-gear-text' : 'bg-gear-primary text-gear-on-primary hover:bg-gear-primary-hover'"
            :aria-pressed="followedByMe"
            :disabled="following"
            @click="toggleFollow"
          >
            {{ followedByMe ? 'Seguindo' : 'Seguir' }}
          </button>
        </div>
      </div>

      <div data-enter class="mb-2 flex items-center gap-2 flex-wrap">
        <h1 class="font-display italic font-extrabold uppercase text-4xl sm:text-5xl leading-none tracking-tight">{{ person.name }}</h1>
        <NuxtLink
          :to="`/niveis/${person.username}`"
          :aria-label="`Nível ${person.level}, ${rank.label}. Ver progresso de ${person.name}`"
          :title="`Nível ${person.level} · ${rank.label}`"
          class="shrink-0 hover:scale-105 transition-transform"
        >
          <RankEmblem animated no-hover class="block w-10 h-10 sm:w-12 sm:h-12" :rank="rank.label" :title="`Nível ${person.level}, ${rank.label}`" />
        </NuxtLink>
        <!-- Fundador fica junto do rank normal, com o número da pessoa -->
        <button v-if="founder" type="button" class="shrink-0 hover:scale-105 transition-transform" :aria-label="`Fundador nº ${founder.number} de 100`" :title="`Fundador nº ${founder.number} de 100`" @click="openBadge('founder')">
          <FounderEmblem :number="founder.number" class="block w-10 h-10 sm:w-12 sm:h-12" />
        </button>
        <span v-if="person.pro" class="text-[10px] font-bold text-gear-primary uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-gear-primary/40 bg-gear-primary/10">Pro</span>
      </div>
      <div data-enter class="flex items-center gap-2 flex-wrap">
        <p class="text-gear-muted text-sm">@{{ person.username }}</p>
      </div>
      <p v-if="profileData?.bio" data-enter class="text-gear-text-secondary leading-relaxed mt-4 max-w-2xl whitespace-pre-line">{{ profileData.bio }}</p>

      <SocialLinks v-if="links.length" data-enter class="mt-5" :links="links" />


      <!-- Detalhe da insígnia: a única exibição animada, as outras do perfil ficam paradas -->
      <AppModal :open="!!selectedBadge" :title="selectedBadge?.name ?? ''" :subtitle="selectedBadge?.description" @close="selectedBadgeKey = null">
        <template v-if="selectedBadge">
          <FounderEmblem v-if="selectedBadge.key === 'founder'" :number="selectedBadge.number" animated class="block w-40 h-40 mx-auto" />
          <BadgeEmblem v-else :key="selectedBadge.key" :badge="selectedBadge.key" :title="selectedBadge.name" animated class="w-40 h-40 mx-auto" />
          <p v-if="selectedBadge.number" class="font-display italic font-extrabold uppercase text-2xl text-center mt-2">Nº {{ selectedBadge.number }} de 100</p>
          <p class="text-sm text-gear-text-secondary text-center mt-4">{{ BADGE_DETAILS[selectedBadge.key] ?? selectedBadge.description }}</p>
          <p v-if="selectedBadge.grantedAt" class="text-xs text-gear-muted text-center mt-2">
            {{ person.name }} recebeu em {{ formatDate(selectedBadge.grantedAt) }}
          </p>
          <div v-if="badges.length > 1" class="mt-6 pt-4 border-t border-gear-border">
            <p class="editorial-eyebrow mb-2 text-center">Insígnias de {{ person.name }}</p>
            <ul class="flex justify-center flex-wrap gap-2">
              <li v-for="badge in badges" :key="badge.key">
                <button
                  type="button"
                  class="block p-1 rounded-lg border transition-colors"
                  :class="badge.key === selectedBadge.key ? 'border-gear-accent bg-gear-accent/10' : 'border-transparent hover:border-gear-border'"
                  :aria-pressed="badge.key === selectedBadge.key"
                  :aria-label="badge.name"
                  :title="badge.name"
                  @click="selectedBadgeKey = badge.key"
                >
                  <BadgeEmblem :badge="badge.key" :title="badge.name" class="block w-10 h-10" />
                </button>
              </li>
            </ul>
          </div>
        </template>
      </AppModal>

      <AppModal v-if="isAdmin" :open="badgesOpen" title="Insígnias" :subtitle="`Destaques de ${person.name}`" @close="badgesOpen = false">
        <ul class="space-y-2">
          <li v-for="badge in grantableBadges" :key="badge.key">
            <button
              type="button"
              class="w-full flex items-center gap-3 p-2 rounded-xl border transition-colors text-left"
              :class="hasBadge(badge.key) ? 'border-gear-accent bg-gear-accent/10' : 'border-gear-border hover:border-gear-text/30'"
              :aria-pressed="hasBadge(badge.key)"
              :disabled="savingBadge === badge.key"
              @click="toggleBadge(badge.key)"
            >
              <BadgeEmblem :badge="badge.key" :title="badge.name" class="w-12 h-12 shrink-0" :locked="!hasBadge(badge.key)" />
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-semibold">{{ badge.name }}</span>
                <span class="block text-xs text-gear-muted">{{ badge.description }}</span>
              </span>
              <AppIcon v-if="hasBadge(badge.key)" name="check" class="w-4 h-4 text-gear-accent shrink-0" />
            </button>
          </li>
        </ul>
      </AppModal>

      <dl class="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-sm">
        <div v-for="stat in stats" :key="stat.label" data-enter class="flex flex-row-reverse items-baseline gap-1.5">
          <dt class="text-gear-muted">{{ stat.label }}</dt>
          <dd data-count class="font-semibold tabular-nums">{{ stat.value }}</dd>
        </div>
      </dl>

      <!-- Abas: o marcador desliza até a aba ativa -->
      <div class="relative flex gap-4 sm:gap-6 border-b border-gear-border mt-6 sm:mt-8 mb-6 sm:mb-8" role="group" aria-label="Filtrar publicações">
        <button
          v-for="tab in TABS"
          :key="tab.value"
          :ref="element => setTabRef(tab.value, element as HTMLElement | null)"
          class="pt-2 sm:pt-0 pb-3 text-sm font-medium transition-colors"
          :class="activeTab === tab.value ? 'text-gear-text' : 'text-gear-muted hover:text-gear-text'"
          :aria-pressed="activeTab === tab.value"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
        <span ref="marker" class="absolute -bottom-px left-0 h-0.5 w-10 bg-gear-accent" aria-hidden="true" />
      </div>

      <div class="space-y-8 pb-12">
        <template v-if="activeTab === 'setup'">
          <!-- Periféricos e hardware lado a lado; nome do item em cima, valor embaixo -->
          <div v-if="setupSections.length" class="grid sm:grid-cols-2 gap-4">
            <section v-for="section in setupSections" :key="section.label" class="glass-card p-5">
              <h2 class="flex items-center gap-2 font-semibold mb-4">
                <AppIcon :name="section.icon" class="w-4 h-4 text-gear-accent" />
                {{ section.label }}
              </h2>
              <dl class="space-y-3">
                <div v-for="item in section.items" :key="item.key">
                  <dt class="text-[11px] text-gear-muted">{{ item.label }}</dt>
                  <dd class="text-sm font-semibold break-words mt-0.5">{{ item.value }}</dd>
                </div>
              </dl>
            </section>
          </div>
          <!-- Galeria: a primeira foto em destaque; clicar abre o visualizador com setas -->
          <section v-if="setupPhotos?.length" aria-label="Fotos do setup">
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="(photo, index) in setupPhotos"
                :key="photo"
                type="button"
                class="relative block rounded-xl overflow-hidden bg-gear-surface group"
                :class="index === 0 ? 'col-span-3 sm:col-span-2 sm:row-span-2 aspect-video sm:aspect-auto' : 'aspect-[4/3]'"
                :aria-label="`Abrir foto ${index + 1} do setup`"
                @click="photoIndex = index"
              >
                <img :src="photo" :alt="`Foto ${index + 1} do setup de ${person.name}`" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </button>
            </div>
            <PhotoViewer v-model:index="photoIndex" :images="setupPhotos" :label="`Setup de ${person.name}`" />
          </section>
          <div v-if="!setupSections.length && !setupPhotos?.length" class="glass-card p-10 text-center">
            <p class="text-sm font-semibold">Setup ainda não cadastrado</p>
          </div>
          <NuxtLink v-if="isMine" to="/setup" class="btn-outline">
            <AppIcon name="pencil" class="w-4 h-4" />
            Editar setup
          </NuxtLink>
        </template>

        <template v-else-if="activeTab === 'jogos'">
          <div v-if="(games?.length ?? 0) > 1" class="flex gap-2 overflow-x-auto -mb-2" role="group" aria-label="Escolher jogo">
            <button
              v-for="config in games"
              :key="config.slug"
              type="button"
              class="pill"
              :class="selectedGame?.slug === config.slug ? 'pill-active' : 'pill-idle'"
              :aria-pressed="selectedGame?.slug === config.slug"
              @click="gameSlug = config.slug"
            >
              <GameIcon :slug="config.slug" :name="config.name" class="w-5 h-5 mr-1.5 !bg-transparent !text-current" />
              {{ config.name }}
            </button>
          </div>
          <template v-if="selectedGame">
            <!-- Cabeçalho do jogo com o número que mais importa para quem joga: o eDPI -->
            <div class="glass-card p-5 flex items-center gap-4">
              <GameIcon :slug="selectedGame.slug" :name="selectedGame.name" class="w-12 h-12" />
              <div class="flex-1 min-w-0">
                <h2 class="font-display italic font-extrabold uppercase text-2xl leading-none truncate">{{ selectedGame.name }}</h2>
                <p class="text-xs text-gear-muted truncate mt-1">{{ selectedGame.genre }}</p>
              </div>
              <div v-if="gameEdpi" class="text-right shrink-0">
                <p class="text-[11px] text-gear-muted">eDPI</p>
                <p class="font-display italic font-extrabold text-3xl leading-none tabular-nums text-gear-accent">{{ gameEdpi }}</p>
              </div>
            </div>
            <GameConfigView :config="selectedGame" />
          </template>
          <div v-if="!games?.length" class="glass-card p-10 text-center">
            <p class="text-sm font-semibold">Nenhum jogo cadastrado</p>
          </div>
          <NuxtLink v-if="isMine" to="/games" class="btn-outline">
            <AppIcon name="pencil" class="w-4 h-4" />
            Editar jogos
          </NuxtLink>
        </template>

        <template v-else>
          <template v-for="item in visibleItems" :key="item.id">
            <ReviewCard v-if="item.kind === 'review'" :review="toReview(item)" />
            <PostCard v-else :item="item" />
          </template>
          <div v-if="!visibleItems.length" class="glass-card p-10 text-center">
            <p class="text-sm font-semibold mb-1">Nada por aqui ainda</p>
            <p class="text-xs text-gear-muted">{{ isMine ? 'Publique algo para aparecer no seu perfil.' : 'Esta pessoa ainda não publicou nesta aba.' }}</p>
            <button v-if="isMine" type="button" class="btn-primary mt-5" @click="start">Nova Publicação</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import type { GameConfig } from '~/components/GameConfigView.vue'
import type { FeedAuthor, FeedPage } from '~/composables/useFeed'
import { toReview, toUser } from '~/composables/useFeed'
import { ringAppearance, userRank } from '~/composables/useGearData'
import { socialLinks } from '~/utils/socialLinks'
import { toApiFailure } from '~/composables/useAuth'

interface Badge {
  key: string
  name: string
  description: string
  grantedAt: string | null
  number?: number | null
}

// Texto da tela de detalhe: o que a insígnia reconhece
const BADGE_DETAILS: Record<string, string> = {
  'founder': 'Um dos 100 primeiros a entrar na GearHub. Essa insígnia não pode mais ser conquistada.',
  'developer': 'Faz parte da equipe que constrói a GearHub.',
  'partner': 'Influencer ou criador de conteúdo parceiro da GearHub.',
  'pro-player': 'Jogador profissional, que compete em alto nível.',
  'reviewer': 'Se destaca pela quantidade e qualidade das reviews publicadas.',
  'game-talker': 'Uma das vozes mais ativas da comunidade quando o assunto é games.',
}

interface PublicProfile extends FeedAuthor {
  bio: string | null
  bannerUrl: string | null
  website: string | null
  twitter: string | null
  instagram: string | null
  youtube: string | null
  followerCount: number
  followingCount: number
  followedByMe: boolean
  badges: Badge[]
  ringStyle: string | null
}

const TABS = [
  { label: 'Tudo', value: 'todos' },
  { label: 'Reviews', value: 'review' },
  { label: 'Posts', value: 'post' },
  { label: 'Setup', value: 'setup' },
  { label: 'Jogos', value: 'jogos' },
]

const SETUP_SECTIONS = [
  { key: 'perifericos', label: 'Periféricos', icon: 'mouse' },
  { key: 'hardware', label: 'Hardware', icon: 'monitor' },
]

const route = useRoute()
const username = route.params.username as string
const { user } = useAuth()
const { ensureUser, setFollowing } = useInteractions()
const { start } = useNewPost()
const cookies = useRequestHeaders(['cookie'])

const { data: profileData, error } = await useFetch<PublicProfile>(`/api/v1/users/${username}`, {
  key: `profile-${username}`,
  headers: cookies,
})
if (error.value || !profileData.value) {
  throw createError({
    statusCode: error.value?.statusCode ?? 404,
    statusMessage: error.value?.data?.detail ?? 'Usuário não encontrado',
    fatal: true,
  })
}

const { data: feed } = await useFetch<FeedPage>('/api/v1/feed', {
  query: { author: username, size: 50 },
  key: `profile-feed-${username}`,
  headers: cookies,
})

const { data: setup } = await useFetch<{ key: string, label: string, section: string, value: string }[]>(`/api/v1/users/${username}/setup`, {
  key: `profile-setup-${username}`,
})
const { data: games } = await useFetch<GameConfig[]>(`/api/v1/users/${username}/games`, {
  key: `profile-games-${username}`,
})

const { data: setupPhotos } = await useFetch<string[]>(`/api/v1/users/${username}/setup/photos`, {
  key: `profile-setup-photos-${username}`,
})

const gameSlug = ref('')
// Foto aberta no visualizador (nulo: fechado)
const photoIndex = ref<number | null>(null)

const gameEdpi = computed(() => {
  const settings = selectedGame.value?.settings ?? {}
  const value = Number(String(settings.dpi ?? '').replace(',', '.')) * Number(String(settings.sensitivity ?? '').replace(',', '.'))
  return Number.isFinite(value) && value > 0 ? Number(value.toFixed(2)).toLocaleString('pt-BR') : null
})

const selectedGame = computed(() => games.value?.find(config => config.slug === gameSlug.value) ?? games.value?.[0])

const setupSections = computed(() =>
  SETUP_SECTIONS
    .map(section => ({ label: section.label, icon: section.icon, items: (setup.value ?? []).filter(item => item.section === section.key) }))
    .filter(section => section.items.length),
)

const links = computed(() => socialLinks(profileData.value ?? {}))

const person = computed(() => toUser(profileData.value!))
const items = computed(() => feed.value?.items ?? [])
const rank = computed(() => userRank(person.value))
const isMine = computed(() => user.value?.username === username)

useHead({ title: () => `${person.value.name} · GearHub` })

const followerCount = ref(profileData.value.followerCount)
const followedByMe = ref(profileData.value.followedByMe)
const following = ref(false)

const stats = computed(() => [
  { label: 'Publicações', value: items.value.length },
  { label: 'Seguidores', value: followerCount.value },
  { label: 'Seguindo', value: profileData.value?.followingCount ?? 0 },
])

// Insígnias: todo mundo vê, só admin dá ou tira
const toast = useToast()
const isAdmin = computed(() => user.value?.role === 'admin')
const badges = ref<Badge[]>(profileData.value.badges ?? [])
const badgesOpen = ref(false)
const savingBadge = ref<string | null>(null)
const catalog = ref<Badge[]>([])

// O catálogo só é buscado quando o admin abre o painel
watch(badgesOpen, async (open) => {
  if (!open || catalog.value.length) return
  try {
    catalog.value = await $fetch<Badge[]>('/api/v1/badges')
  }
  catch (failure) {
    toast.failure(toApiFailure(failure))
  }
})

// Fundador aparece ao lado do rank; a fileira de insígnias fica com as outras
const founder = computed(() => badges.value.find(badge => badge.key === 'founder') ?? null)
// Contorno da foto: a escolha da pessoa ou o automático
const ring = computed(() => ringAppearance(profileData.value?.ringStyle, rank.value.label, !!founder.value))
const shownBadges = computed(() => badges.value.filter(badge => badge.key !== 'founder'))
// O Fundador é automático (100 primeiros): não aparece no painel do admin
const grantableBadges = computed(() => catalog.value.filter(badge => badge.key !== 'founder'))

const selectedBadgeKey = ref<string | null>(null)
const selectedBadge = computed(() => badges.value.find(badge => badge.key === selectedBadgeKey.value) ?? null)
const openBadge = (key: string) => { selectedBadgeKey.value = key }
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

const hasBadge = (key: string) => badges.value.some(badge => badge.key === key)

async function toggleBadge(key: string) {
  savingBadge.value = key
  try {
    badges.value = await $fetch<Badge[]>(`/api/v1/users/${username}/badges/${key}`, { method: hasBadge(key) ? 'DELETE' : 'PUT' })
  }
  catch (failure) {
    toast.failure(toApiFailure(failure))
  }
  finally {
    savingBadge.value = null
  }
}

async function toggleFollow() {
  if (!ensureUser()) return
  following.value = true
  const result = await setFollowing(username, !followedByMe.value)
  if (result) {
    followedByMe.value = result.followedByMe
    followerCount.value = result.followers
  }
  following.value = false
}

// A aba pode vir da URL (?aba=setup), por exemplo depois de salvar o setup
const activeTab = ref(TABS.some(tab => tab.value === route.query.aba) ? String(route.query.aba) : 'todos')
const visibleItems = computed(() =>
  activeTab.value === 'todos' ? items.value : items.value.filter(item => item.kind === activeTab.value),
)

const tabRefs = new Map<string, HTMLElement>()
const marker = ref<HTMLElement | null>(null)

function setTabRef(value: string, element: HTMLElement | null) {
  if (element) tabRefs.set(value, element)
}

function moveMarker(animated: boolean) {
  const tab = tabRefs.get(activeTab.value)
  if (!tab || !marker.value) return
  const position = { x: tab.offsetLeft, width: tab.offsetWidth }
  if (animated) {
    gsap.to(marker.value, { ...position, duration: 0.4, ease: 'power3.out', overwrite: 'auto' })
  }
  else {
    gsap.set(marker.value, position)
  }
}

watch(activeTab, () => moveMarker(true))
onMounted(() => moveMarker(false))

const page = ref<HTMLElement | null>(null)

useGsapContext(page, (el) => {
  gsap.from(el.querySelector('[data-ring]'), { scale: 0.6, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.8)' })
  gsap.from(el.querySelectorAll('[data-enter]'), { autoAlpha: 0, y: 16, duration: 0.5, ease: 'power3.out', stagger: 0.07, delay: 0.15 })
  // Os números sobem de 0 até o valor real
  gsap.from(el.querySelectorAll('[data-count]'), { textContent: 0, snap: { textContent: 1 }, duration: 1, ease: 'power2.out', stagger: 0.1, delay: 0.25 })

  el.querySelectorAll('[data-orb]').forEach((orb, index) => {
    gsap.to(orb, { x: index ? 60 : -60, y: index ? -30 : 30, duration: 7 + index * 2, ease: 'sine.inOut', repeat: -1, yoyo: true })
  })
  gsap.fromTo(el.querySelector('[data-ring]'), { '--glow': 8 }, { '--glow': 22, duration: 1.8, ease: 'sine.inOut', repeat: -1, yoyo: true })
})
</script>
