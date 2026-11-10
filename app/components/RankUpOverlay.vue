<template>
  <Teleport to="body">
    <div
      v-if="rankUp"
      ref="root"
      class="fixed inset-0 z-[80] grid place-items-center overflow-hidden px-4"
      role="dialog"
      aria-modal="true"
      :aria-label="label"
      @keydown.esc="close"
    >
      <div data-backdrop class="absolute inset-0 bg-black/90" />

      <div class="relative flex flex-col items-center text-center">
        <!-- Palco da coreografia (app/utils/rankUpChoreography.ts): emblemas, efeitos e título entram aqui -->
        <div ref="stage" class="rank-up-stage [--ru-size:220px] sm:[--ru-size:280px]" />

        <!-- Espaço do título, que o script posiciona logo abaixo do palco -->
        <div class="h-28" aria-hidden="true" />

        <p class="sr-only" aria-live="polite">{{ label }}</p>

        <div data-actions class="flex flex-wrap justify-center gap-3 opacity-0">
          <NuxtLink :to="`/niveis/${user?.username}`" class="btn-outline !text-white !border-white/30" @click="close">Ver meus níveis</NuxtLink>
          <button ref="continueButton" type="button" class="btn-primary" @click="close">Continuar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { playFounderUnlock, playRankUp } from '~/utils/rankUpChoreography'

// Arquivo, cor de destaque e intensidade da coreografia de cada patente
const RANKS: Record<string, { slug: string, color: string, level: number, tier: number }> = {
  Cobre: { slug: 'cobre', color: '#e8a06a', level: 0, tier: 1 },
  Prata: { slug: 'prata', color: '#cfd9e8', level: 0, tier: 2 },
  Cobalto: { slug: 'cobalto', color: '#5cb8ff', level: 0, tier: 3 },
  Esmeralda: { slug: 'esmeralda', color: '#5be38a', level: 1, tier: 4 },
  Platina: { slug: 'platina', color: '#9c8cff', level: 2, tier: 5 },
  Diamante: { slug: 'diamante', color: '#ffc443', level: 3, tier: 6 },
}

const { user } = useAuth()
const { pending: rankUp, check, dismiss } = useRankUp()
const route = useRoute()

const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const continueButton = ref<HTMLButtonElement | null>(null)
let timeline: gsap.core.Timeline | null = null

const label = computed(() => {
  const event = rankUp.value
  if (!event) return ''
  return event.kind === 'founder'
    ? `Rank exclusivo desbloqueado: Fundador nº ${event.founderNumber} de 100`
    : `Você subiu de patente: ${event.toRank}, nível ${event.level}`
})

// Consulta ao entrar, ao trocar de página e ao voltar para a aba
watch(user, value => value && check(true), { immediate: true })
watch(() => route.path, () => check())
onMounted(() => document.addEventListener('visibilitychange', onVisible))
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisible)
  timeline?.kill()
})

function onVisible() {
  if (document.visibilityState === 'visible') check()
}

watch(rankUp, async (event) => {
  if (!event) return
  await nextTick()
  try {
    await play()
  }
  catch {
    // Sem os SVGs não há animação: mostra só os botões, e a subida ainda é marcada como vista ao fechar
    showActions()
  }
})

// Os emblemas entram como SVG na página para o GSAP animar cada peça
const svgOf = (path: string) => $fetch<string>(path, { responseType: 'text' })

async function play() {
  const event = rankUp.value
  const el = stage.value
  if (!event || !el) return
  timeline?.kill()
  gsap.from(root.value!.querySelector('[data-backdrop]'), { opacity: 0, duration: 0.3 })

  if (event.kind === 'founder') {
    const founderSvg = await svgOf('/badges/founder.svg')
    timeline = playFounderUnlock(el, founderSvg, { number: event.founderNumber })
  }
  else {
    const to = RANKS[event.toRank] ?? RANKS.Cobre!
    const from = RANKS[event.fromRank ?? ''] ?? RANKS.Cobre!
    const [oldSvg, newSvg] = await Promise.all([svgOf(`/ranks/${from.slug}.svg`), svgOf(`/ranks/${to.slug}.svg`)])
    timeline = playRankUp(el, oldSvg, newSvg, {
      title: event.toRank,
      subtitle: `Tier ${to.tier} · Nível ${event.level}`,
      color: to.color,
      level: to.level,
    })
  }
  // Os raios seguem girando por vários segundos: os botões entram logo depois do título
  timeline.call(showActions, undefined, 'title+=1.4')
}

function showActions() {
  const actions = root.value?.querySelector('[data-actions]')
  if (!actions) return
  gsap.fromTo(actions, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', onComplete: () => continueButton.value?.focus() })
}

function close() {
  if (!root.value) return
  timeline?.kill()
  gsap.to(root.value, {
    opacity: 0,
    duration: prefersReducedMotion() ? 0 : 0.25,
    onComplete: () => dismiss(),
  })
}
</script>
