<template>
  <Teleport to="body">
    <div
      v-if="rankUp"
      ref="root"
      class="fixed inset-0 z-[80] grid place-items-center overflow-hidden px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rank-up-title"
      @keydown.esc="close"
    >
      <!-- Fundo escuro com brilho na cor do rank novo -->
      <div data-backdrop class="absolute inset-0 bg-black/85" />
      <div data-glow class="absolute left-1/2 top-1/2 w-[680px] h-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-0" :style="{ background: `radial-gradient(circle, ${toColor} 0%, transparent 65%)` }" aria-hidden="true" />

      <div class="relative flex flex-col items-center text-center">
        <p data-eyebrow class="editorial-eyebrow text-white/70">Você subiu de patente</p>

        <!-- Palco dos emblemas: o antigo racha e some, o novo se monta no lugar -->
        <div class="relative w-56 h-56 sm:w-64 sm:h-64 mt-4">
          <span data-shock class="absolute inset-0 m-auto w-40 h-40 rounded-full border-2 opacity-0" :style="{ borderColor: toColor }" aria-hidden="true" />
          <span data-flash class="absolute inset-0 m-auto w-40 h-40 rounded-full bg-white opacity-0 blur-xl" aria-hidden="true" />
          <span
            v-for="particle in particles"
            :key="particle.id"
            data-particle
            class="absolute left-1/2 top-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full opacity-0"
            :style="{ background: particle.light ? '#fff' : toColor }"
            aria-hidden="true"
          />
          <RankEmblem v-if="!showNew" data-old :rank="rankUp.fromRank" :title="rankUp.fromRank" no-hover class="absolute inset-0 w-full h-full" />
          <RankEmblem v-else data-new :rank="rankUp.toRank" :title="rankUp.toRank" animated no-hover class="absolute inset-0 w-full h-full" />
        </div>

        <h2 id="rank-up-title" data-name class="font-display italic font-extrabold uppercase text-5xl sm:text-6xl leading-none tracking-tight mt-2 opacity-0" :style="{ color: toColor }">
          {{ rankUp.toRank }}
        </h2>
        <p data-detail class="text-sm text-white/70 mt-3 opacity-0">
          Nível {{ rankUp.level }} · antes {{ rankUp.fromRank }}
        </p>

        <div data-actions class="flex flex-wrap justify-center gap-3 mt-8 opacity-0">
          <NuxtLink :to="`/niveis/${user?.username}`" class="btn-outline !text-white !border-white/30" @click="close">Ver meus níveis</NuxtLink>
          <button ref="continueButton" type="button" class="btn-primary" @click="close">Continuar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { userRank, type User } from '~/composables/useGearData'

const { user } = useAuth()
const { pending: rankUp, check, dismiss } = useRankUp()
const route = useRoute()

const root = ref<HTMLElement | null>(null)
const continueButton = ref<HTMLButtonElement | null>(null)
const showNew = ref(false)
let timeline: gsap.core.Timeline | null = null

const toColor = computed(() => (rankUp.value ? userRank({ badge: rankUp.value.toRank as User['badge'] }).color : '#fff'))

// Faíscas que saem do centro quando o emblema novo aparece
const particles = Array.from({ length: 18 }, (_, id) => ({ id, light: id % 3 === 0 }))

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

watch(rankUp, async (value) => {
  if (!value) return
  showNew.value = false
  await nextTick()
  play()
})

function play() {
  const el = root.value
  if (!el) return
  timeline?.kill()

  // Sem animação: mostra o resultado direto
  if (prefersReducedMotion()) {
    showNew.value = true
    gsap.set(el.querySelectorAll('[data-glow]'), { opacity: 0.35 })
    gsap.set(el.querySelectorAll('[data-name], [data-detail], [data-actions]'), { opacity: 1 })
    nextTick(() => continueButton.value?.focus())
    return
  }

  const q = (selector: string) => el.querySelectorAll(selector)
  timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from(q('[data-backdrop]'), { opacity: 0, duration: 0.35 })
    .from(q('[data-eyebrow]'), { opacity: 0, y: 10, duration: 0.4 }, 0.15)
    // 1. o emblema antigo entra e treme, juntando energia
    .from(q('[data-old]'), { opacity: 0, scale: 0.6, duration: 0.5, ease: 'back.out(1.7)' }, 0.2)
    .to(q('[data-old]'), { x: 4, duration: 0.05, repeat: 11, yoyo: true, ease: 'none' }, 0.8)
    .to(q('[data-glow]'), { opacity: 0.25, duration: 0.6 }, 0.8)
    // 2. racha: cresce, borra e some num clarão
    .to(q('[data-old]'), { scale: 1.25, opacity: 0, filter: 'blur(6px) brightness(2)', duration: 0.3, ease: 'power2.in' }, 1.4)
    .fromTo(q('[data-flash]'), { opacity: 0, scale: 0.3 }, { opacity: 0.9, scale: 1.4, duration: 0.18, ease: 'power2.out' }, 1.6)
    .to(q('[data-flash]'), { opacity: 0, scale: 2, duration: 0.6 }, 1.78)
    // 3. o emblema novo: o SVG faz a própria montagem, aqui só a entrada e o impacto
    .call(() => { showNew.value = true }, undefined, 1.65)
    .fromTo(q('[data-shock]'), { opacity: 0.9, scale: 0.5 }, { opacity: 0, scale: 2.2, duration: 1, ease: 'power2.out' }, 1.7)
    .to(q('[data-glow]'), { opacity: 0.5, duration: 0.8 }, 1.7)
    .add(burst(el), 1.7)
    // 4. nome do rank, detalhe e botões
    .fromTo(q('[data-name]'), { opacity: 0, y: 24, skewX: -12 }, { opacity: 1, y: 0, skewX: 0, duration: 0.6 }, 2.2)
    .to(q('[data-detail]'), { opacity: 1, duration: 0.4 }, 2.55)
    .fromTo(q('[data-actions]'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, onComplete: () => continueButton.value?.focus() }, 2.8)

  // O emblema novo só existe depois do .call: anima a entrada quando ele montar
  watch(showNew, async (visible) => {
    if (!visible) return
    await nextTick()
    gsap.from(el.querySelectorAll('[data-new]'), { scale: 0.5, opacity: 0, duration: 0.6, ease: 'back.out(1.8)' })
  }, { once: true })
}

// Faíscas em direções espalhadas, com distâncias diferentes
function burst(el: HTMLElement) {
  const group = gsap.timeline()
  el.querySelectorAll<HTMLElement>('[data-particle]').forEach((particle, index) => {
    const angle = (index / particles.length) * Math.PI * 2 + Math.random() * 0.3
    const distance = 110 + Math.random() * 80
    group.fromTo(particle,
      { opacity: 1, x: 0, y: 0, scale: 1 },
      { opacity: 0, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, scale: 0.3, duration: 0.9 + Math.random() * 0.4, ease: 'power3.out' },
      0)
  })
  return group
}

function close() {
  if (!root.value) return
  timeline?.kill()
  gsap.to(root.value, {
    opacity: 0,
    duration: prefersReducedMotion() ? 0 : 0.25,
    onComplete: () => {
      showNew.value = false
      dismiss()
    },
  })
}
</script>
