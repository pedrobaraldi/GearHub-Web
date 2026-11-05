<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[65] grid place-items-center p-4 overflow-y-auto" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div data-backdrop class="fixed inset-0 bg-black/70" @click="$emit('close')" />
      <div ref="panel" class="relative w-full bg-gear-sidebar border border-gear-border rounded-2xl p-6 sm:p-7" :class="widthClass">
        <button
          ref="closeButton"
          type="button"
          class="absolute top-4 right-4 w-8 h-8 grid place-items-center rounded-full border border-gear-accent/50 text-gear-text-secondary hover:text-gear-text transition-colors"
          aria-label="Fechar"
          @click="$emit('close')"
        >
          <AppIcon name="x" class="w-4 h-4" />
        </button>
        <h2 :id="titleId" class="text-2xl font-bold tracking-tight pr-10">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm text-gear-muted mt-1">{{ subtitle }}</p>
        <div class="mt-5">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  subtitle?: string
  widthClass?: string
}>(), { subtitle: undefined, widthClass: 'max-w-md' })

const emit = defineEmits<{ close: [] }>()

const titleId = useId()
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLElement | null>(null)

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(() => props.open, async (open) => {
  if (!open) {
    window.removeEventListener('keydown', onKey)
    return
  }
  window.addEventListener('keydown', onKey)
  await nextTick()
  closeButton.value?.focus()
  gsap.fromTo(panel.value, { autoAlpha: 0, y: 16, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' })
  const cards = panel.value?.querySelectorAll('[data-card]')
  if (cards?.length) {
    gsap.fromTo(cards, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.08, delay: 0.08 })
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('keydown', onKey)
})
</script>
