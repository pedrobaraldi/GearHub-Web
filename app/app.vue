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
