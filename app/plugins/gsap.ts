import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const tweens = new WeakMap<HTMLElement, gsap.core.Tween>()

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    gsap.registerPlugin(ScrollTrigger)
    nuxtApp.hook('page:finish', () => ScrollTrigger.refresh())
  }

  // v-reveal: o elemento entra ao chegar na tela. Use junto com a classe `reveal`,
  // que o mantém oculto desde o HTML do servidor e evita que ele pisque.
  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    mounted(el: HTMLElement) {
      const reduced = prefersReducedMotion()
      const tween = gsap.fromTo(
        el,
        { autoAlpha: 0, y: reduced ? 0 : 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduced ? 0.4 : 0.7,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        },
      )
      el.classList.remove('reveal')
      tweens.set(el, tween)
    },
    beforeUnmount(el: HTMLElement) {
      const tween = tweens.get(el)
      tween?.scrollTrigger?.kill()
      tween?.kill()
    },
  })
})
