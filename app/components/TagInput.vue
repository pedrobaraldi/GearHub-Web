<template>
  <div>
    <label for="tags" class="sr-only">Tags</label>
    <div class="flex flex-wrap items-center gap-2 min-h-[46px] sm:min-h-[42px] px-3 py-2 rounded-xl border bg-gear-surface transition-colors focus-within:border-gear-accent" :class="error ? 'border-gear-red' : 'border-gear-border'">
      <span v-for="tag in modelValue" :key="tag" class="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-gear-accent/10 text-gear-accent text-xs font-medium">
        #{{ tag }}
        <button type="button" class="w-6 h-6 grid place-items-center" :aria-label="`Remover tag ${tag}`" @click="remove(tag)">
          <AppIcon name="x" class="w-3 h-3" />
        </button>
      </span>
      <input
        id="tags"
        v-model="text"
        type="text"
        enterkeyhint="done"
        :placeholder="modelValue.length ? '' : 'valorant, superlight2, setup'"
        class="flex-1 min-w-[120px] bg-transparent text-base sm:text-sm text-gear-text placeholder-gear-muted outline-none"
        @keydown.enter.prevent="add"
        @keydown.backspace="removeLast"
        @input="splitOnComma"
        @blur="add"
      />
    </div>
    <p v-if="error" class="text-xs text-gear-red mt-1.5">{{ error }}</p>
    <p v-else class="text-xs text-gear-muted mt-1.5">Toque em Enter ou use vírgula para adicionar. Hashtags no texto também são detectadas.</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string[], error?: string }>()
const emit = defineEmits<{ 'update:modelValue': [tags: string[]] }>()

const text = ref('')

function add() {
  const tag = text.value.replace(/[#,\s]/g, '')
  text.value = ''
  if (tag && !props.modelValue.includes(tag)) emit('update:modelValue', [...props.modelValue, tag])
}

function splitOnComma() {
  if (text.value.includes(',')) add()
}

function remove(tag: string) {
  emit('update:modelValue', props.modelValue.filter(item => item !== tag))
}

function removeLast() {
  if (!text.value && props.modelValue.length) remove(props.modelValue.at(-1)!)
}
</script>
