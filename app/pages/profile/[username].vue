<template>
  <div ref="page">
    <!-- Capa com luzes em movimento -->
    <div class="relative h-40 sm:h-52 lg:h-72 overflow-hidden border-b border-gear-border bg-gradient-to-br from-gear-card via-gear-sidebar to-gear-bg">
      <img v-if="profileData?.bannerUrl" :src="profileData.bannerUrl" alt="" class="absolute inset-0 w-full h-full object-cover" />
      <template v-else>
        <span data-orb class="absolute -top-24 right-[12%] w-80 h-80 rounded-full bg-gear-accent/25 blur-3xl" aria-hidden="true" />
        <span data-orb class="absolute -bottom-32 left-[8%] w-96 h-96 rounded-full bg-gear-primary/15 blur-3xl" aria-hidden="true" />
      </template>
      <div class="relative px-4 sm:px-6 lg:px-10 pt-4">
        <!-- Fundo próprio: precisa ser legível sobre qualquer banner, em qualquer tema -->
        <BackButton class="!bg-black/60 !text-white !border-white/25 backdrop-blur-md hover:!bg-black/75" />
      </div>
    </div>

    <div class="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 -mt-14 sm:-mt-20">
      <div class="flex items-end justify-between gap-4 mb-5">
        <div
          data-ring
          class="relative neon-ring rounded-full w-[108px] h-[108px] sm:w-[150px] sm:h-[150px] p-1 sm:p-[6px] shrink-0"
          :style="{ background: rank.color }"
          :title="rank.label"
        >
          <UserPhoto :src="person.avatar" :name="person.name" class="w-[100px] h-[100px] sm:w-[138px] sm:h-[138px] text-4xl sm:text-5xl" />
          <NuxtLink
            :to="`/niveis/${person.username}`"
            :aria-label="`Nível ${person.level}, ${rank.label}. Ver progresso de ${person.name}`"
            :title="`Nível ${person.level} · ${rank.label}`"
            class="absolute -bottom-2 -right-2 sm:bottom-0 sm:right-0 drop-shadow-lg hover:scale-105 transition-transform"
          >
            <RankEmblem class="block w-10 h-12 sm:w-12 sm:h-[58px]" :color="rank.color" :label="person.level" :title="rank.label" />
          </NuxtLink>
        </div>

        <div data-enter class="pb-2">
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
        <RankBadge :user="person" large />
      </div>
      <p data-enter class="text-gear-muted text-sm">@{{ person.username }}</p>
      <p v-if="profileData?.bio" data-enter class="text-gear-text-secondary leading-relaxed mt-4 max-w-2xl whitespace-pre-line">{{ profileData.bio }}</p>

      <ul v-if="links.length" data-enter class="flex flex-wrap gap-x-5 gap-y-2 mt-4" aria-label="Redes">
        <li v-for="link in links" :key="link.label">
          <a :href="link.href" target="_blank" rel="noopener noreferrer nofollow" class="inline-flex items-center gap-1.5 text-sm text-gear-text-secondary hover:text-gear-accent transition-colors">
            <AppIcon name="link" class="w-3.5 h-3.5" />
            {{ link.label }}
          </a>
        </li>
      </ul>

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
          <section v-for="section in setupSections" :key="section.label" class="glass-card p-5">
            <h2 class="editorial-eyebrow mb-3">{{ section.label }}</h2>
            <dl class="divide-y divide-gear-border">
              <div v-for="item in section.items" :key="item.key" class="grid grid-cols-[110px_1fr] gap-3 py-2.5">
                <dt class="text-xs text-gear-muted self-center">{{ item.label }}</dt>
                <dd class="text-sm font-medium break-words">{{ item.value }}</dd>
              </div>
            </dl>
          </section>
          <section v-if="setupPhotos?.length" class="glass-card p-5">
            <h2 class="editorial-eyebrow mb-3">Fotos</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <a v-for="(photo, index) in setupPhotos" :key="photo" :href="photo" target="_blank" rel="noopener noreferrer" class="block aspect-[4/3] rounded-xl overflow-hidden bg-gear-surface">
                <img :src="photo" :alt="`Foto ${index + 1} do setup de ${person.name}`" loading="lazy" class="w-full h-full object-cover" />
              </a>
            </div>
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
          <div v-if="(games?.length ?? 0) > 1" class="flex gap-2 overflow-x-auto" role="group" aria-label="Escolher jogo">
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
            <div class="flex items-center gap-3">
              <GameIcon :slug="selectedGame.slug" :name="selectedGame.name" class="w-10 h-10" />
              <div class="min-w-0">
                <h2 class="font-semibold truncate">{{ selectedGame.name }}</h2>
                <p class="text-xs text-gear-muted truncate">{{ selectedGame.genre }}</p>
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
import { userRank } from '~/composables/useGearData'

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
}

const TABS = [
  { label: 'Tudo', value: 'todos' },
  { label: 'Reviews', value: 'review' },
  { label: 'Posts', value: 'post' },
  { label: 'Setup', value: 'setup' },
  { label: 'Jogos', value: 'jogos' },
]

const SETUP_SECTIONS = [
  { key: 'perifericos', label: 'Periféricos' },
  { key: 'hardware', label: 'Hardware' },
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
const selectedGame = computed(() => games.value?.find(config => config.slug === gameSlug.value) ?? games.value?.[0])

const setupSections = computed(() =>
  SETUP_SECTIONS
    .map(section => ({ label: section.label, items: (setup.value ?? []).filter(item => item.section === section.key) }))
    .filter(section => section.items.length),
)

const links = computed(() => {
  const profile = profileData.value
  return [
    { label: profile?.website?.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: profile?.website },
    { label: profile?.twitter && `@${profile.twitter}`, href: profile?.twitter && `https://x.com/${profile.twitter}` },
    { label: profile?.instagram && 'Instagram', href: profile?.instagram && `https://instagram.com/${profile.instagram}` },
    { label: profile?.youtube && 'YouTube', href: profile?.youtube },
  ].filter(link => link.href)
})

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

const activeTab = ref('todos')
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
