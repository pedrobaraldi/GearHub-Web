<template>
  <div>
    <div v-if="modelValue.length || !compact" class="flex flex-wrap gap-3" :class="{ 'px-4 pb-3': compact }">
      <div v-for="(url, index) in modelValue" :key="url" class="relative w-24 h-24 rounded-2xl overflow-hidden border border-gear-border">
        <img :src="url" :alt="`Imagem ${index + 1}`" class="w-full h-full object-cover" />
        <button
          type="button"
          class="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-black/70 text-white"
          :aria-label="`Remover imagem ${index + 1}`"
          @click="remove(url)"
        >
          <AppIcon name="x" class="w-3.5 h-3.5" />
        </button>
      </div>

      <label
        v-if="!compact && canAdd"
        class="w-24 h-24 grid place-items-center rounded-2xl border border-dashed border-gear-border text-gear-muted hover:text-gear-text hover:border-gear-accent transition-colors cursor-pointer"
        :class="{ 'opacity-60': uploading }"
        :title="uploading ? 'Enviando...' : 'Adicionar imagem'"
      >
        <AppIcon name="image-plus" class="w-5 h-5" />
        <input type="file" multiple :accept="ACCEPT" class="sr-only" aria-label="Adicionar imagem" :disabled="uploading" @change="pick" />
      </label>
    </div>

    <div v-if="compact" class="flex items-center justify-between gap-3 border-t border-gear-border px-4 py-3">
      <label v-if="canAdd" class="inline-flex items-center gap-2 text-xs font-medium text-gear-muted hover:text-gear-text transition-colors cursor-pointer" :class="{ 'opacity-60': uploading }">
        <AppIcon name="image-plus" class="w-4 h-4" />
        {{ uploading ? 'Enviando...' : 'Adicionar imagem' }}
        <input type="file" multiple :accept="ACCEPT" class="sr-only" aria-label="Adicionar imagem" :disabled="uploading" @change="pick" />
      </label>
      <span v-else class="text-xs text-gear-muted">Limite de {{ MAX_IMAGES }} imagens</span>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

const MAX_IMAGES = 4
const ACCEPT = 'image/jpeg,image/png,image/webp'

const props = defineProps<{ modelValue: string[], compact?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const toast = useToast()
const uploading = ref(false)
const canAdd = computed(() => props.modelValue.length < MAX_IMAGES)

function remove(url: string) {
  emit('update:modelValue', props.modelValue.filter(item => item !== url))
}

async function pick(event: Event) {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  uploading.value = true
  let images = props.modelValue
  try {
    for (const file of files.slice(0, MAX_IMAGES - images.length)) {
      const body = new FormData()
      body.append('file', file)
      const { url } = await $fetch<{ url: string }>('/api/v1/uploads/images', { method: 'POST', body })
      images = [...images, url]
      emit('update:modelValue', images)
    }
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
  finally {
    uploading.value = false
  }
}
</script>
