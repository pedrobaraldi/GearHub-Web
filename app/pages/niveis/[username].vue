<template>
  <div v-if="data" ref="root" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-5 space-y-4">
    <div class="flex items-center gap-3">
      <BackButton />
      <NuxtLink :to="`/profile/${data.username}`" class="flex items-center gap-2 min-w-0 min-h-11 hover:opacity-80 transition-opacity">
        <span v-if="founder" class="founder-ring relative rounded-full p-[2px] shrink-0"><UserPhoto :src="data.avatarUrl" :name="data.displayName" class="w-8 h-8 text-xs" /></span>
        <UserPhoto v-else :src="data.avatarUrl" :name="data.displayName" class="w-8 h-8 text-xs shrink-0 ring-2" :style="{ '--tw-ring-color': rankColor }" />
        <span class="text-sm font-semibold truncate">{{ data.displayName }}</span>
      </NuxtLink>
    </div>

    <section class="relative glass-card overflow-hidden">
      <!-- Faixas diagonais na cor da patente -->
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <span data-stripe class="absolute -top-1/4 left-1/2 w-40 h-[160%] rotate-[24deg] opacity-[0.07]" :style="{ background: rankColor }" />
        <span data-stripe class="absolute -top-1/4 left-[62%] w-16 h-[160%] rotate-[24deg] opacity-[0.12]" :style="{ background: rankColor }" />
      </div>

      <div class="relative grid lg:grid-cols-[1fr_1.3fr_1fr] gap-8 p-5 sm:p-8">
        <!-- Patente atual -->
        <div class="lg:order-2 text-center">
          <p class="text-xs text-gear-muted">Patente atual</p>
          <p data-rank-name class="font-display italic font-extrabold uppercase text-4xl leading-none mt-1" :style="{ color: rankColor }">{{ data.rankName }}</p>
          <RankEmblem data-emblem animated class="w-44 h-44 mx-auto mt-2" :style="rankHasAura(data.rankName) ? { filter: `drop-shadow(0 0 calc(var(--glow, 6) * 1px) ${rankColor})` } : undefined" :rank="data.rankName" :title="`Nível ${data.level}, ${data.rankName}`" />

          <div class="flex items-center gap-2 mt-5">
            <span class="shrink-0 text-center"><RankEmblem class="w-10 h-10" :rank="data.rankName" :title="`Nível ${data.level}`" /><span class="block text-[11px] font-mono text-gear-muted">Nv {{ data.level }}</span></span>
            <div class="flex-1 min-w-0">
              <div class="h-1.5 rounded-full bg-gear-surface overflow-hidden" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100" :aria-label="`Progresso para o nível ${data.level + 1}`">
                <div data-xp-bar class="h-full rounded-full" :style="{ width: `${percent}%`, background: rankColor }" />
              </div>
              <div class="flex justify-between mt-1 text-[11px] font-mono text-gear-muted tabular-nums">
                <span>{{ format(data.levelStartXp) }}</span>
                <span>{{ format(data.nextLevelXp) }}</span>
              </div>
            </div>
            <span class="shrink-0 text-center opacity-60"><RankEmblem class="w-10 h-10" :rank="nextRank" :title="`Nível ${data.level + 1}`" /><span class="block text-[11px] font-mono text-gear-muted">Nv {{ data.level + 1 }}</span></span>
          </div>
          <p class="text-xs text-gear-muted mt-2">Faltam {{ format(missing) }} XP para o nível {{ data.level + 1 }}</p>
        </div>

        <!-- Números -->
        <div class="lg:order-1 space-y-6">
        <dl class="grid grid-cols-2 gap-x-4 gap-y-4 content-start">
          <div data-stat class="col-span-2">
            <dt class="text-xs text-gear-muted">XP total</dt>
            <dd data-count-up :data-value="data.xp" class="font-display italic font-extrabold text-4xl leading-none mt-1 tabular-nums">{{ format(data.xp) }}</dd>
          </div>
          <div v-for="activity in data.activities" :key="activity.key" data-stat>
            <dt class="text-xs text-gear-muted">{{ LABELS[activity.key] ?? activity.label }}</dt>
            <dd data-count-up :data-value="activity.count" class="text-lg font-semibold tabular-nums">{{ activity.count }}</dd>
          </div>
        </dl>

        <!-- Insígnias: lista vertical, espelhando as patentes do outro lado -->
        <div v-if="otherBadges.length">
          <h2 class="font-display italic font-extrabold uppercase text-lg" :style="{ color: rankColor }">Insígnias</h2>
          <ul class="mt-3 space-y-3">
            <li v-for="badge in otherBadges" :key="badge.key" data-badge class="flex items-center gap-3" :title="badge.description">
              <BadgeEmblem :badge="badge.key" :title="badge.name" class="w-11 h-11 shrink-0" />
              <span class="min-w-0">
                <span class="block font-semibold text-sm">{{ badge.name }}</span>
                <span class="block text-xs text-gear-muted whitespace-nowrap">{{ badge.grantedAt ? `Desde ${formatDate(badge.grantedAt)}` : badge.description }}</span>
              </span>
            </li>
          </ul>
        </div>
        </div>

        <!-- Patentes -->
        <div class="lg:order-3 lg:justify-self-end">
          <!-- Patente especial: Fundador, junto das patentes normais e com o número da pessoa -->
          <template v-if="founder">
            <h2 class="founder-text font-display italic font-extrabold uppercase text-lg">Patente especial</h2>
            <div data-rank-row class="flex items-center gap-3 mt-3 mb-6">
              <FounderEmblem :number="founder.number" class="block w-14 h-14 shrink-0" />
              <span class="min-w-0">
                <span class="block font-semibold text-sm">Fundador nº {{ founder.number }}</span>
                <span class="block text-xs text-gear-muted">Um dos 100 primeiros</span>
              </span>
            </div>
          </template>
          <h2 class="font-display italic font-extrabold uppercase text-lg" :style="{ color: rankColor }">Patentes</h2>
          <ol class="mt-3 space-y-3">
            <li v-for="rank in data.ranks" :key="rank.name" data-rank-row class="flex items-center gap-3">
              <RankEmblem no-hover class="w-11 h-11 shrink-0" :rank="rank.name" :title="rank.reached ? rank.name : `${rank.name}, bloqueado`" :locked="!rank.reached" />
              <span class="min-w-0">
                <span class="block font-semibold text-sm" :class="{ 'text-gear-muted': !rank.reached }">{{ rank.name }}</span>
                <span class="block text-xs text-gear-muted">
                  {{ rank.current ? 'Atual' : rank.reached ? 'Alcançada' : `A partir do nível ${rank.minLevel}` }}
                </span>
              </span>
            </li>
          </ol>
        </div>
      </div>

    </section>

    <!-- Escada de níveis -->
    <section data-ladder class="glass-card p-5 sm:p-6" aria-label="Escada de níveis">
      <!-- Uma coluna por patente, sempre em uma linha; no celular a linha rola de lado -->
      <div class="-mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto">
        <div class="grid gap-x-2 min-w-[600px] sm:min-w-0" :style="{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }">
          <div v-for="tier in tiers" :key="tier.name" data-tier class="min-w-0 text-center">
            <RankEmblem no-hover class="w-12 h-12 mx-auto" :rank="tier.name" :title="`${tier.name}, a partir do nível ${tier.start}`" :locked="data.level < tier.start" />
            <p class="text-[11px] font-semibold lg:uppercase tracking-tight whitespace-nowrap mt-1" :style="{ color: data.level >= tier.start ? tier.color : undefined }">{{ tier.name }}</p>
            <p class="text-[11px] font-mono text-gear-muted tabular-nums whitespace-nowrap">Nv {{ tier.start }}</p>
            <p class="text-[11px] font-mono text-gear-muted tabular-nums whitespace-nowrap">{{ format(xpForLevel(tier.start)) }} XP</p>
          </div>
        </div>
      </div>
      <div class="flex items-end gap-px sm:gap-0.5 h-24 mt-5 border-b border-gear-border" aria-hidden="true">
        <span
          v-for="bar in bars"
          :key="bar.level"
          data-bar
          class="flex-1 min-w-0 rounded-t-sm"
          :style="{
            height: `${bar.height}%`,
            background: bar.color,
            opacity: bar.level <= data.level ? 1 : 0.2,
            boxShadow: bar.level === data.level ? `0 0 10px ${bar.color}` : undefined,
          }"
        />
      </div>
    </section>

    <FormSection title="De onde vem a XP" icon="trending-up" subtitle="Curtidas no próprio conteúdo não contam.">
      <ul class="divide-y divide-gear-border">
        <li v-for="activity in data.activities" :key="activity.key" class="flex items-center justify-between gap-3 py-2.5">
          <span class="min-w-0">
            <span class="block text-sm font-medium">{{ activity.label }}</span>
            <span class="block text-xs text-gear-muted">{{ activity.points }} XP cada</span>
          </span>
          <span class="text-right shrink-0">
            <span class="block font-mono text-sm font-semibold tabular-nums">{{ format(activity.xp) }} XP</span>
            <span class="block text-xs text-gear-muted tabular-nums">{{ activity.count }}×</span>
          </span>
        </li>
      </ul>
    </FormSection>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { rankHasAura, userRank } from '~/composables/useGearData'
import type { User } from '~/composables/useGearData'

interface Progress {
  username: string
  displayName: string
  avatarUrl: string | null
  rankName: string
  level: number
  xp: number
  levelStartXp: number
  nextLevelXp: number
  activities: { key: string, label: string, points: number, count: number, xp: number }[]
  ranks: { name: string, minLevel: number, reached: boolean, current: boolean }[]
  badges: { key: string, name: string, description: string, grantedAt: string | null, number?: number | null }[]
}

const LABELS: Record<string, string> = {
  review: 'Reviews',
  post: 'Posts',
  comment: 'Comentários',
  like: 'Curtidas',
  follower: 'Seguidores',
}

// A escada mostra pelo menos este alcance, e cresce com quem passar dele
const MIN_LADDER_LEVELS = 40

const username = useRoute().params.username as string

const { data, error } = await useFetch<Progress>(`/api/v1/users/${username}/progress`, { key: `progress-${username}` })
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado', fatal: true })
}

useHead({ title: () => `Nível de ${data.value?.displayName} · GearHub` })

const format = (value: number) => value.toLocaleString('pt-BR')
// Mês e ano bastam aqui, e cabem numa linha ao lado do emblema
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
const xpForLevel = (level: number) => 50 * level * (level - 1)
const colorOf = (rank: string) => userRank({ badge: rank as User['badge'] }).color

const rankColor = computed(() => colorOf(data.value!.rankName))

// Fundador vira patente especial; a lista de insígnias fica com as outras
const founder = computed(() => data.value?.badges?.find(badge => badge.key === 'founder') ?? null)
const otherBadges = computed(() => data.value?.badges?.filter(badge => badge.key !== 'founder') ?? [])

const rankOfLevel = (level: number) =>
  [...data.value!.ranks].reverse().find(rank => level >= rank.minLevel) ?? data.value!.ranks[0]!

const nextRank = computed(() => rankOfLevel(data.value!.level + 1).name)

const percent = computed(() => {
  const { xp, levelStartXp, nextLevelXp } = data.value!
  return Math.floor(((xp - levelStartXp) / (nextLevelXp - levelStartXp)) * 100)
})

const missing = computed(() => data.value!.nextLevelXp - data.value!.xp)

const lastLevel = computed(() => Math.max(MIN_LADDER_LEVELS, data.value!.level + 5))

const bars = computed(() =>
  Array.from({ length: lastLevel.value }, (_, index) => ({
    level: index + 1,
    height: 12 + (index / (lastLevel.value - 1)) * 88,
    color: colorOf(rankOfLevel(index + 1).name),
  })),
)

const tiers = computed(() =>
  data.value!.ranks.map(rank => ({ name: rank.name, start: rank.minLevel, color: colorOf(rank.name) })),
)

const root = ref<HTMLElement | null>(null)

useGsapContext(root, (el) => {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('[data-stripe]', { x: -120, autoAlpha: 0, duration: 0.8, stagger: 0.12 })
    .from('[data-rank-name]', { autoAlpha: 0, y: 14, skewX: -10, duration: 0.5 }, 0.15)
    .from('[data-emblem]', { autoAlpha: 0, scale: 0.4, rotate: -14, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(1.9)' }, 0.25)
    .from('[data-stat]', { autoAlpha: 0, x: -16, duration: 0.45, stagger: 0.06 }, 0.45)
    .from('[data-rank-row]', { autoAlpha: 0, x: 16, duration: 0.45, stagger: 0.08 }, 0.5)
    .from('[data-badge]', { autoAlpha: 0, y: 10, duration: 0.4, stagger: 0.06 }, 0.6)
    .from('[data-xp-bar]', { width: 0, duration: 1.1, ease: 'power2.out' }, 0.7)

  // Os números sobem junto com a entrada dos cartões
  el.querySelectorAll<HTMLElement>('[data-count-up]').forEach((node) => {
    const target = Number(node.dataset.value)
    const counter = { value: 0 }
    timeline.to(counter, {
      value: target,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: () => { node.textContent = format(Math.round(counter.value)) },
    }, 0.5)
  })

  // Depois de entrar, o emblema respira
  gsap.fromTo('[data-emblem]', { '--glow': 6 }, { '--glow': 22, duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1 })

  // A escada anima quando entra na tela
  const ladder = { trigger: '[data-ladder]', start: 'top 92%', once: true }
  gsap.from('[data-tier]', { autoAlpha: 0, y: 14, duration: 0.45, ease: 'power3.out', stagger: 0.07, scrollTrigger: ladder })
  gsap.from('[data-bar]', { scaleY: 0, transformOrigin: 'bottom', duration: 0.55, ease: 'power2.out', stagger: 0.012, scrollTrigger: ladder })
})
</script>
