import gsap from 'gsap'
import type { Ref } from 'vue'

// As animações são parte central do site, então rodam mesmo com "reduzir movimento"
// ativo no sistema. Com true, quem usa esse ajuste passa a ver só um fade.
const RESPECT_REDUCED_MOTION = false

export function prefersReducedMotion(): boolean {
  return RESPECT_REDUCED_MOTION
    && import.meta.client
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Roda animações GSAP do componente e desfaz tudo ao desmontar.
export function useGsapContext<T extends Element>(
  root: Ref<T | null>,
  animate: (el: T, reduced: boolean) => void,
) {
  let ctx: gsap.Context | undefined

  onMounted(() => {
    const el = root.value
    if (!el) return
    ctx = gsap.context(() => animate(el, prefersReducedMotion()), el)
  })

  onBeforeUnmount(() => ctx?.revert())
}
