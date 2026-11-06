<template>
  <div>
    <span class="form-label">{{ label }}</span>
    <div
      class="flex items-center gap-1 rounded-xl border bg-gear-surface transition-colors"
      :class="error ? 'border-gear-red' : 'border-gear-border hover:border-gear-accent'"
    >
      <button
        type="button"
        class="flex-1 min-w-0 flex items-center gap-3 min-h-[46px] sm:min-h-[42px] px-3 py-1.5 text-left"
        :aria-label="modelValue ? `${label}: ${productTitle(modelValue)}. Trocar` : `Escolher ${label}`"
        @click="openPicker"
      >
        <template v-if="modelValue">
          <ProductThumb :image="modelValue.imageUrl" :name="modelValue.name" class="w-8 h-8" />
          <span class="min-w-0">
            <span class="block text-sm font-medium truncate">{{ productTitle(modelValue) }}</span>
            <span v-if="modelValue.reviewTitle" class="block text-xs text-gear-muted truncate">{{ modelValue.reviewTitle }}</span>
          </span>
        </template>
        <template v-else>
          <AppIcon name="search" class="w-4 h-4 text-gear-muted shrink-0" />
          <span class="text-sm text-gear-muted truncate">Buscar {{ label.toLowerCase() }}</span>
        </template>
      </button>
      <button v-if="modelValue" type="button" class="w-10 h-10 grid place-items-center shrink-0 text-gear-muted hover:text-gear-text transition-colors" :aria-label="`Remover ${label}`" @click="$emit('update:modelValue', null)">
        <AppIcon name="x" class="w-4 h-4" />
      </button>
    </div>
    <p v-if="error" class="text-xs text-gear-red mt-1.5">{{ error }}</p>

    <AppModal :open="open" :title="`Escolher ${label.toLowerCase()}`" subtitle="As reviews mais populares aparecem primeiro." width-class="max-w-lg" @close="closePicker">
      <div class="relative mb-3">
        <AppIcon name="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gear-muted" />
        <input v-model="term" type="search" placeholder="Buscar por nome ou marca" :aria-label="`Buscar ${label}`" class="field-input !pl-10" />
      </div>
      <div class="space-y-1 max-h-[55dvh] overflow-y-auto overscroll-contain" aria-live="polite">
        <button
          v-for="option in options"
          :key="option.reviewId ?? option.productId"
          type="button"
          class="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-gear-surface transition-colors"
          :class="{ 'bg-gear-surface': isSelected(option) }"
          @click="choose(option)"
        >
          <ProductThumb :image="option.imageUrl" :name="option.name" class="w-11 h-11" />
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-medium truncate">{{ productTitle(option) }}</span>
            <span v-if="option.reviewId" class="block text-xs text-gear-text-secondary truncate">{{ option.reviewTitle ?? 'Review' }}</span>
            <span class="block text-xs text-gear-muted truncate">{{ option.reviewId ? `por ${option.reviewAuthor}` : 'Sem reviews ainda' }}</span>
          </span>
          <span v-if="option.reviewId" class="flex items-center gap-1 text-xs font-medium text-gear-muted tabular-nums shrink-0">
            <AppIcon name="heart" class="w-3.5 h-3.5" />
            {{ option.likeCount }}
          </span>
        </button>
        <p v-if="loading && !options.length" class="text-sm text-gear-muted text-center py-8">Carregando...</p>
        <p v-else-if="failed" class="text-sm text-gear-red text-center py-8">Não foi possível buscar agora. Tente novamente.</p>
        <p v-else-if="!options.length" class="text-sm text-gear-muted text-center py-8">
          {{ term.trim() ? 'Nada encontrado com esse nome.' : 'Ainda não há produtos cadastrados nesta categoria.' }}
        </p>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
export interface GearOption {
  productId: string
  slug: string
  name: string
  brand: string
  imageUrl: string | null
  reviewId: string | null
  reviewTitle: string | null
  reviewAuthor: string | null
  likeCount: number
}

export type GearChoice = Pick<GearOption, 'productId' | 'reviewId' | 'name' | 'brand' | 'imageUrl' | 'reviewTitle'>

const props = withDefaults(defineProps<{
  modelValue?: GearChoice | null
  category: string
  label: string
  error?: string
}>(), { modelValue: null, error: undefined })

const emit = defineEmits<{ 'update:modelValue': [value: GearChoice | null] }>()

const open = ref(false)
const term = ref('')
const options = ref<GearOption[]>([])
const loading = ref(false)
const failed = ref(false)
let latest = 0

async function search() {
  const request = ++latest
  loading.value = true
  failed.value = false
  try {
    const found = await $fetch<GearOption[]>('/api/v1/gear-options', {
      query: { category: props.category, q: term.value.trim() || undefined },
    })
    // Uma resposta antiga não pode sobrescrever a busca mais nova
    if (request === latest) options.value = found
  }
  catch {
    if (request === latest) failed.value = true
  }
  finally {
    if (request === latest) loading.value = false
  }
}

watchDebounced(term, () => {
  if (open.value) search()
}, { debounce: 250 })

function openPicker() {
  open.value = true
  search()
}

function closePicker() {
  open.value = false
  term.value = ''
}

const isSelected = (option: GearOption) =>
  option.productId === props.modelValue?.productId && option.reviewId === props.modelValue?.reviewId

function choose(option: GearOption) {
  emit('update:modelValue', option)
  closePicker()
}
</script>
