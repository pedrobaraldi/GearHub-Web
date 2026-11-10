<template>
  <div ref="root">
    <PageHeader root title="Hall of" accent="Fame." subtitle="Os destaques da comunidade, calculados com a atividade real." />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-10">
      <SearchBar v-model="term" placeholder="Buscar reviewer, setup ou produto..." class="max-w-md" />

      <!-- Pódio: um card por pessoa, o 1º no centro e mais alto -->
      <!-- minmax(0,…): o conteúdo do 1º lugar não alarga a coluna nem empurra o 3º para fora -->
      <section v-if="first && !searching" aria-label="Pódio" class="grid grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] gap-3 sm:gap-4 items-end">
        <NuxtLink
          :to="`/niveis/${first.username}`"
          data-first
          class="col-span-2 lg:col-span-1 lg:order-2 glass-card neon-hover group relative overflow-hidden text-center min-w-0 px-5 pt-6 pb-7 bg-gradient-to-b from-gear-gold/10 to-transparent"
        >
          <span class="inline-flex items-center gap-1.5 rounded-full bg-gear-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gear-gold">
            <AppIcon name="trophy" class="w-3.5 h-3.5" />1º lugar
          </span>
          <RankEmblem no-hover data-emblem animated class="w-32 h-32 sm:w-36 sm:h-36 mx-auto mt-3" :style="rankHasAura(first.rankName) ? { filter: `drop-shadow(0 0 calc(var(--glow, 6) * 1px) ${first.color})` } : undefined" :rank="first.rankName" :title="`Nível ${first.level}, ${first.rankName}`" />
          <div class="flex items-center justify-center gap-3 mt-3 min-w-0">
            <UserPhoto :src="first.avatarUrl" :name="first.displayName" class="w-11 h-11 text-base shrink-0 ring-2" :style="{ '--tw-ring-color': first.color }" />
            <p class="font-display italic font-extrabold uppercase text-2xl sm:text-3xl leading-none truncate group-hover:opacity-80 transition-opacity" :style="{ color: first.color }">{{ first.displayName }}</p>
          </div>
          <p class="text-sm font-semibold mt-3">Nível {{ first.level }} · <span :style="{ color: first.color }">{{ first.rankName }}</span></p>
          <p class="font-display italic font-extrabold text-3xl leading-none tabular-nums mt-2"><span data-count-up :data-value="first.xp">{{ format(first.xp) }}</span> XP</p>
        </NuxtLink>

        <NuxtLink
          v-for="(person, index) in runnersUp"
          :key="person.username"
          :to="`/niveis/${person.username}`"
          data-runner
          class="glass-card neon-hover group relative overflow-hidden text-center min-w-0 px-4 pt-5 pb-6"
          :class="index === 0 ? 'lg:order-1' : 'lg:order-3'"
        >
          <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest" :class="index === 0 ? 'bg-gear-text/10 text-gear-text-secondary' : 'bg-[#cd7f32]/15 text-[#cd7f32]'">
            {{ person.place }}º lugar
          </span>
          <div class="relative w-16 h-16 mx-auto mt-4">
            <UserPhoto :src="person.avatarUrl" :name="person.displayName" class="w-16 h-16 text-xl ring-2" :style="{ '--tw-ring-color': person.color }" />
            <RankEmblem no-hover class="absolute -bottom-3 -right-4 w-10 h-10 drop-shadow-lg" :rank="person.rankName" :title="`Nível ${person.level}, ${person.rankName}`" />
          </div>
          <p class="font-semibold truncate mt-4 group-hover:opacity-80 transition-opacity">{{ person.displayName }}</p>
          <p class="text-xs font-medium mt-0.5 truncate">Nível {{ person.level }} · <span :style="{ color: person.color }">{{ person.rankName }}</span></p>
          <p class="font-display italic font-extrabold text-xl leading-none tabular-nums mt-2">{{ format(person.xp) }} XP</p>
        </NuxtLink>
      </section>

      <p v-if="!people.length && !searching" class="glass-card p-8 text-center text-sm text-gear-muted">Ainda não há reviews publicadas.</p>

      <!-- Classificação e setups lado a lado no desktop -->
      <div v-if="ranking.length || setups.length || !searching" class="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-10 lg:gap-8 items-start">
        <section v-if="ranking.length" aria-labelledby="ranking-title">
          <header class="mb-4">
            <h2 id="ranking-title" class="font-display italic font-extrabold uppercase text-2xl">Classificação</h2>
            <p class="text-xs text-gear-muted mt-1">{{ searching ? 'Quem combina com a busca, na posição real.' : 'Do 4º lugar em diante, por XP.' }}</p>
          </header>
          <ol class="glass-card divide-y divide-gear-border overflow-hidden">
            <li v-for="person in ranking" :key="person.username" data-row>
              <NuxtLink :to="`/niveis/${person.username}`" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gear-surface transition-colors">
                <span class="w-7 font-display italic font-extrabold text-lg text-gear-muted tabular-nums shrink-0">{{ person.place }}</span>
                <UserPhoto :src="person.avatarUrl" :name="person.displayName" class="w-9 h-9 text-xs shrink-0" />
                <span class="flex-1 min-w-0">
                  <span class="block text-sm font-semibold truncate">{{ person.displayName }}</span>
                  <span class="block text-xs text-gear-muted truncate">Nível {{ person.level }} · {{ person.rankName }}</span>
                </span>
                <RankEmblem no-hover class="w-8 h-8 shrink-0" :rank="person.rankName" :title="`Nível ${person.level}, ${person.rankName}`" />
                <span class="font-mono text-xs sm:text-sm font-semibold tabular-nums shrink-0">{{ format(person.xp) }} XP</span>
              </NuxtLink>
            </li>
          </ol>
        </section>

        <section v-if="setups.length || !searching" aria-labelledby="setups-title" :class="{ 'lg:col-span-2': !ranking.length }">
          <header class="mb-4">
            <h2 id="setups-title" class="font-display italic font-extrabold uppercase text-2xl">Setups da comunidade</h2>
            <p class="text-xs text-gear-muted mt-1">Toque para ver o setup completo no perfil.</p>
          </header>
          <div v-if="setups.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Leva direto à aba Setup do perfil -->
            <NuxtLink
              v-for="setup in setups"
              :key="setup.username"
              :to="{ path: `/profile/${setup.username}`, query: { aba: 'setup' } }"
              class="reveal glass-card neon-hover group relative overflow-hidden block aspect-[4/3]"
              v-reveal
            >
              <img
                :src="setup.photo"
                :alt="`Setup de ${setup.displayName}`"
                loading="lazy"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" aria-hidden="true" />
              <div class="absolute inset-x-0 bottom-0 p-4 flex items-center gap-2.5 text-white">
                <UserPhoto :src="setup.avatarUrl" :name="setup.displayName" class="w-8 h-8 text-[11px] shrink-0 ring-2 ring-white/20" />
                <span class="min-w-0">
                  <span class="block text-[10px] uppercase tracking-widest font-bold text-white/60">Setup de</span>
                  <span class="block text-sm font-semibold truncate">{{ setup.displayName }}</span>
                </span>
              </div>
            </NuxtLink>
          </div>
          <p v-else class="glass-card p-8 text-center text-sm text-gear-muted">Nenhum setup com foto ainda. <NuxtLink to="/setup" class="font-semibold text-gear-primary hover:underline underline-offset-2">Adicione o seu</NuxtLink>.</p>
        </section>
      </div>

      <!-- Produtos -->
      <section v-if="topProducts.length || !searching" aria-labelledby="products-title">
        <header class="mb-4">
          <h2 id="products-title" class="font-display italic font-extrabold uppercase text-2xl">Produtos mais bem avaliados</h2>
          <p class="text-xs text-gear-muted mt-1">Pela nota média das reviews da comunidade.</p>
        </header>
        <div v-if="topProducts.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <ProductCard v-for="p in topProducts" :key="p.id" :product="p" />
        </div>
        <p v-else class="glass-card p-8 text-center text-sm text-gear-muted">Ainda não há produtos avaliados.</p>
      </section>

      <p v-if="searching && !ranking.length && !setups.length && !topProducts.length" class="glass-card p-8 text-center text-sm text-gear-muted">Nada encontrado para "{{ term.trim() }}".</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { rankHasAura, userRank } from '~/composables/useGearData'
import { matchesSearch, productSearchFields } from '~/utils/search'
import type { User } from '~/composables/useGearData'

interface Hall {
  reviewers: { username: string, displayName: string, avatarUrl: string | null, reviewCount: number, xp: number, level: number, rankName: string }[]
  setups: { username: string, displayName: string, avatarUrl: string | null, photo: string }[]
  products: Parameters<typeof toProduct>[0][]
}

const PODIUM_SIZE = 3

useHead({ title: 'Hall of Fame · GearHub' })

const { data: hall } = await useFetch<Hall>('/api/v1/hall', { key: 'hall' })

const term = ref('')
const searching = computed(() => term.value.trim().length > 0)
// Sem acento, e cada palavra pode estar em qualquer campo
const matches = (...fields: (string | number | null | undefined)[]) => matchesSearch(term.value, ...fields)

const format = (value: number) => value.toLocaleString('pt-BR')

const people = computed(() =>
  (hall.value?.reviewers ?? []).map((reviewer, index) => ({
    ...reviewer,
    place: index + 1,
    color: userRank({ badge: reviewer.rankName as User['badge'] }).color,
  })),
)

const first = computed(() => people.value[0])
const runnersUp = computed(() => people.value.slice(1, PODIUM_SIZE))

// Com busca, todos entram na lista, mantendo a posição real de cada um
const ranking = computed(() =>
  searching.value
    ? people.value.filter(person => matches(person.displayName, person.username, person.rankName, `nivel ${person.level}`))
    : people.value.slice(PODIUM_SIZE),
)

const setups = computed(() => (hall.value?.setups ?? []).filter(setup => matches(setup.displayName, setup.username)))

const topProducts = computed(() =>
  (hall.value?.products ?? []).map(toProduct).filter(product => matches(...productSearchFields(product))),
)

const root = ref<HTMLElement | null>(null)

useGsapContext(root, (el) => {
  if (!first.value) return

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('[data-emblem]', { autoAlpha: 0, scale: 0.4, rotate: -14, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(1.9)' })

  if (runnersUp.value.length) {
    timeline.from('[data-runner]', { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.12 }, 0.45)
  }

  el.querySelectorAll<HTMLElement>('[data-count-up]').forEach((node) => {
    const target = Number(node.dataset.value)
    const counter = { value: 0 }
    timeline.to(counter, {
      value: target,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: () => { node.textContent = format(Math.round(counter.value)) },
    }, 0.4)
  })

  gsap.fromTo('[data-emblem]', { '--glow': 6 }, { '--glow': 22, duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1 })

  if (ranking.value.length) {
    gsap.from('[data-row]', { autoAlpha: 0, x: -14, duration: 0.4, ease: 'power3.out', stagger: 0.05, delay: 0.5 })
  }
})
</script>
