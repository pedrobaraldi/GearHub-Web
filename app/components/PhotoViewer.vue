<template>
  <Teleport to="body">
    <div
      v-if="index !== null && images[index]"
      ref="root"
      class="fixed inset-0 z-[70] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      :aria-label="`${label}: foto ${index + 1} de ${images.length}`"
      tabindex="-1"
      @keydown.esc="close"
      @keydown.left.prevent="go(-1)"
      @keydown.right.prevent="go(1)"
    >
      <div class="flex items-center justify-between px-4 py-3 text-white">
        <p class="text-sm tabular-nums" aria-live="polite">{{ index + 1 }} de {{ images.length }}</p>
        <button ref="closeButton" type="button" class="w-11 h-11 grid place-items-center rounded-full hover:bg-white/10 transition-colors" aria-label="Fechar" @click="close">
          <AppIcon name="x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Foto: arrastar para o lado troca de foto no celular -->
      <div class="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16 select-none" @pointerdown="onDown" @pointerup="onUp">
        <img :key="images[index]" :src="images[index]" :alt="`${label}, foto ${index + 1}`" class="max-w-full max-h-full object-contain rounded-lg" draggable="false" />
        <button
          v-if="images.length > 1"
          type="button"
          class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Foto anterior"
          @click="go(-1)"
        >
          <AppIcon name="chevron-left" class="w-5 h-5" />
        </button>
        <button
          v-if="images.length > 1"
          type="button"
          class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Próxima foto"
          @click="go(1)"
        >
          <AppIcon name="chevron-right" class="w-5 h-5" />
        </button>
      </div>

      <!-- Miniaturas -->
      <div v-if="images.length > 1" class="flex justify-center gap-2 overflow-x-auto px-4 py-4">
        <button
          v-for="(image, position) in images"
          :key="image"
          type="button"
          class="shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-opacity"
          :class="position === index ? 'border-gear-accent opacity-100' : 'border-transparent opacity-50 hover:opacity-80'"
          :aria-label="`Ver foto ${position + 1}`"
          :aria-current="position === index"
          @click="emit('update:index', position)"
        >
          <img :src="image" alt="" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ images: string[], index: number | null, label: string }>()
const emit = defineEmits<{ 'update:index': [value: number | null] }>()

const root = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

// Ao abrir, o foco vai para o visualizador (setas e Esc funcionam direto) e a página para de rolar
watch(() => props.index !== null, async (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (open) {
    await nextTick()
    root.value?.focus()
  }
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})

function go(step: number) {
  if (props.index === null) return
  emit('update:index', (props.index + step + props.images.length) % props.images.length)
}

function close() {
  emit('update:index', null)
}

let startX = 0
function onDown(event: PointerEvent) {
  startX = event.clientX
}
function onUp(event: PointerEvent) {
  const distance = event.clientX - startX
  if (Math.abs(distance) > 50) go(distance < 0 ? 1 : -1)
}
</script>
