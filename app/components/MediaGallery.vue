<template>
  <!-- relative z-10: fica acima do link que cobre o card, para arrastar e clicar nas fotos -->
  <div
    class="group/gallery relative z-10 bg-gear-surface overflow-hidden"
    role="region"
    aria-roledescription="carrossel"
    :aria-label="images.length > 1 ? `${alt}: ${images.length} fotos` : alt"
    @keydown.left.prevent="go(index - 1)"
    @keydown.right.prevent="go(index + 1)"
  >
    <!-- Rolagem nativa com encaixe: no celular é só arrastar, como no Instagram -->
    <div
      ref="track"
      class="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      :class="images.length === 1 ? 'aspect-video' : 'aspect-[4/3]'"
      @scroll.passive="onScroll"
    >
      <button
        v-for="(url, position) in images"
        :key="url"
        type="button"
        class="w-full h-full shrink-0 snap-center snap-always"
        :aria-label="`Abrir foto ${position + 1} de ${images.length} em tela cheia`"
        :tabindex="position === index ? 0 : -1"
        @click="viewer = position"
      >
        <img
          :src="url"
          :alt="images.length > 1 ? `${alt}, foto ${position + 1}` : alt"
          :loading="position === 0 ? 'eager' : 'lazy'"
          draggable="false"
          class="w-full h-full object-cover select-none"
        />
      </button>
    </div>

    <template v-if="images.length > 1">
      <span class="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums pointer-events-none" aria-live="polite">
        {{ index + 1 }}/{{ images.length }}
      </span>

      <!-- Setas para quem usa mouse; no toque, aparecem só ao focar -->
      <button
        v-show="index > 0"
        type="button"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full bg-black/60 text-white transition-opacity opacity-0 group-hover/gallery:opacity-100 focus-visible:opacity-100 hover:bg-black/80"
        aria-label="Foto anterior"
        @click="go(index - 1)"
      >
        <AppIcon name="chevron-left" class="w-5 h-5" />
      </button>
      <button
        v-show="index < images.length - 1"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full bg-black/60 text-white transition-opacity opacity-0 group-hover/gallery:opacity-100 focus-visible:opacity-100 hover:bg-black/80"
        aria-label="Próxima foto"
        @click="go(index + 1)"
      >
        <AppIcon name="chevron-right" class="w-5 h-5" />
      </button>

      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1.5 pointer-events-none" aria-hidden="true">
        <span
          v-for="(url, position) in images"
          :key="url"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="position === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'"
        />
      </div>
    </template>

    <PhotoViewer v-model:index="viewer" :images="images" :label="alt" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ images: string[], alt: string }>()

const track = ref<HTMLElement | null>(null)
const index = ref(0)
const viewer = ref<number | null>(null)

function onScroll() {
  const element = track.value
  if (!element?.clientWidth) return
  index.value = Math.min(props.images.length - 1, Math.max(0, Math.round(element.scrollLeft / element.clientWidth)))
}

function go(position: number) {
  const element = track.value
  if (!element || position < 0 || position >= props.images.length) return
  element.scrollTo({ left: position * element.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

// Fechou a tela cheia em outra foto: o carrossel acompanha
watch(viewer, (current, previous) => {
  if (current === null && previous !== null && previous !== index.value) {
    track.value?.scrollTo({ left: previous * track.value.clientWidth })
  }
})

// Editou o post e a lista mudou: volta para a primeira
watch(() => props.images.join(), () => {
  index.value = 0
  track.value?.scrollTo({ left: 0 })
})
</script>
