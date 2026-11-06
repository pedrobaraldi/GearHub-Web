<template>
  <header ref="root" class="relative overflow-hidden border-b border-gear-border">
    <NeonLines v-if="lines" class="hidden sm:block" />

    <div
      class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10"
      :class="lines ? 'pt-6 sm:pt-10 lg:pt-14 pb-5 sm:pb-10 lg:pb-14' : 'pt-5 lg:pt-6 pb-5 lg:pb-6'"
    >
      <BackButton v-if="back" class="mb-4" :class="{ 'hidden lg:inline-flex': root }" />

      <div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:gap-4">
        <div class="min-w-0">
          <h1 class="reveal font-display italic font-extrabold uppercase leading-[0.9] tracking-tight text-4xl sm:text-6xl">
            <span data-word class="inline-block">{{ title }}</span>
            {{ ' ' }}
            <span v-if="accent" data-word data-neon class="neon-text inline-block">{{ accent }}</span>
          </h1>
          <p v-if="subtitle" class="reveal text-sm text-gear-muted mt-2 max-w-xl">{{ subtitle }}</p>
        </div>
        <slot />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import gsap from 'gsap'

withDefaults(defineProps<{
  title: string
  accent?: string
  subtitle?: string
  back?: boolean
  lines?: boolean
  /** Tela da navegação principal: no celular, a barra inferior já leva a ela */
  root?: boolean
}>(), { back: true, lines: false, root: false })

const root = ref<HTMLElement | null>(null)

useGsapContext(root, (el) => {
  const title = el.querySelector('h1')!
  const words = el.querySelectorAll('[data-word]')
  const neon = el.querySelector('[data-neon]')
  const subtitle = el.querySelector('p')

  const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } })
    .fromTo(words, { autoAlpha: 0, yPercent: 45, skewX: -10 }, { autoAlpha: 1, yPercent: 0, skewX: 0, duration: 0.9, stagger: 0.12 })

  if (subtitle) {
    timeline.fromTo(subtitle, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.55')
    subtitle.classList.remove('reveal')
  }

  if (neon) {
    timeline
      .to(neon, { keyframes: { opacity: [1, 0.3, 1, 0.6, 1, 0.2, 1] }, duration: 0.8, ease: 'none' })
      .add(() => {
        // Depois de acender, o brilho respira
        gsap.fromTo(neon, { '--glow': 5 }, { '--glow': 11, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true })
      })
  }

  title.classList.remove('reveal')
})
</script>
