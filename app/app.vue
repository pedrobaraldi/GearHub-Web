<template>
  <div>
    <NuxtRouteAnnouncer />
    <ToastHost />
    <NuxtLayout>
      <NuxtPage :transition="pageTransition" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

// Barra do navegador no celular acompanha o tema escolhido no site
const colorMode = useColorMode()
useHead({
  meta: [{ name: 'theme-color', content: () => (colorMode.value === 'light' ? '#f4f6f9' : '#000000') }],
})

// A entrada fica com o v-reveal de cada página; aqui é só a saída
const pageTransition = {
  mode: 'out-in' as const,
  css: false,
  onLeave(el: Element, done: () => void) {
    gsap.to(el, {
      autoAlpha: 0,
      y: prefersReducedMotion() ? 0 : -8,
      duration: 0.16,
      ease: 'power2.in',
      onComplete: done,
    })
  },
}
</script>
