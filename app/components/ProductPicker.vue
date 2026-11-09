<template>
  <div>
    <span class="form-label">{{ label }}</span>
    <div
      class="flex items-center gap-1 rounded-xl border bg-gear-surface transition-colors"
      :class="error ? 'border-gear-red' : 'border-gear-border hover:border-gear-accent'"
    >
      <button type="button" class="flex-1 min-w-0 flex items-center gap-3 min-h-[46px] sm:min-h-[42px] px-3 py-1.5 text-left" :aria-label="selected ? `${label}: ${productTitle(selected)}. Trocar` : `Escolher ${label}`" @click="open = true">
        <template v-if="selected">
          <ProductThumb :image="selected.imageUrl" :name="selected.name" class="w-8 h-8" />
          <span class="min-w-0">
            <span class="block text-sm font-medium truncate">{{ productTitle(selected) }}</span>
          </span>
        </template>
        <template v-else>
          <AppIcon name="search" class="w-4 h-4 text-gear-muted shrink-0" />
          <span class="text-sm text-gear-muted truncate">{{ placeholder }}</span>
        </template>
      </button>
      <button v-if="selected && clearable" type="button" class="w-10 h-10 grid place-items-center shrink-0 text-gear-muted hover:text-gear-text transition-colors" :aria-label="`Remover ${label}`" @click="$emit('update:modelValue', '')">
        <AppIcon name="x" class="w-4 h-4" />
      </button>
    </div>
    <p v-if="error" class="text-xs text-gear-red mt-1.5">{{ error }}</p>

    <AppModal :open="open" :title="`Escolher ${label.toLowerCase()}`" width-class="max-w-lg" @close="closePicker">
      <div class="relative mb-3">
        <AppIcon name="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gear-muted" />
        <input v-model="term" type="search" placeholder="Buscar por nome ou marca" :aria-label="`Buscar ${label}`" class="field-input !pl-10" />
      </div>
      <div class="space-y-1 max-h-[55dvh] overflow-y-auto overscroll-contain">
        <button
          v-for="product in visible"
          :key="product.id"
          type="button"
          class="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-gear-surface transition-colors"
          :class="{ 'bg-gear-surface': product.id === modelValue }"
          @click="choose(product.id)"
        >
          <ProductThumb :image="product.imageUrl" :name="product.name" class="w-10 h-10" />
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-medium truncate">{{ product.name }}</span>
            <span class="block text-xs text-gear-muted truncate">{{ product.brand }} · {{ product.category }}</span>
          </span>
          <AppIcon v-if="product.id === modelValue" name="check" class="w-4 h-4 text-gear-accent shrink-0" />
        </button>
        <p v-if="!visible.length" class="text-sm text-gear-muted text-center py-8">
          {{ products.length ? 'Nenhum produto encontrado.' : 'Ainda não há produtos cadastrados nesta categoria.' }}
        </p>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
export interface PickerProduct {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  imageUrl: string | null
}

const props = withDefaults(defineProps<{
  modelValue: string
  products: PickerProduct[]
  label: string
  placeholder?: string
  clearable?: boolean
  error?: string
}>(), { placeholder: 'Selecionar', clearable: false, error: undefined })

const emit = defineEmits<{ 'update:modelValue': [id: string] }>()

const open = ref(false)
const term = ref('')

const selected = computed(() => props.products.find(product => product.id === props.modelValue))

const visible = computed(() => {
  const text = term.value.trim().toLowerCase()
  return props.products.filter(product => !text || `${product.brand} ${product.name}`.toLowerCase().includes(text))
})

function closePicker() {
  open.value = false
  term.value = ''
}

function choose(id: string) {
  emit('update:modelValue', id)
  closePicker()
}
</script>
