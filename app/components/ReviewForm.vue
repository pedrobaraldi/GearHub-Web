<template>
  <div ref="root">
    <FormHeader
      eyebrow="Publicar"
      :title="editing ? 'Editar review' : 'Nova review'"
      subtitle="Compartilhe sua análise técnica."
    />

    <form class="max-w-2xl px-4 sm:px-6 lg:px-10 py-6 space-y-6" novalidate @submit.prevent="submit">
      <div data-step>
        <template v-if="editing">
          <span class="form-label">Produto</span>
          <p class="text-sm font-medium">{{ editing.draft.productName }}</p>
        </template>
        <template v-else>
          <label for="product" class="form-label">Produto</label>
          <select id="product" v-model="productId" class="field-input" :class="{ 'field-error': fields.productId }">
            <option value="">Selecione um produto...</option>
            <optgroup v-for="group in productGroups" :key="group.name" :label="group.name">
              <option v-for="product in group.products" :key="product.id" :value="product.id">{{ product.brand }} {{ product.name }}</option>
            </optgroup>
          </select>
          <p v-if="fields.productId" class="text-xs text-gear-red mt-1.5">{{ fields.productId }}</p>
        </template>
      </div>

      <div data-step>
        <FormField id="title" v-model="form.title" label="Título da review" eyebrow placeholder="Ex: &quot;Hall Effect é o novo padrão competitivo&quot;" :error="fields.title" />
      </div>

      <div data-step>
        <label for="body" class="form-label">Análise</label>
        <textarea
          id="body"
          v-model="form.body"
          rows="6"
          placeholder="Descreva a experiência, construção, performance, comparações..."
          class="field-input"
          :class="{ 'field-error': fields.body }"
        />
        <p v-if="fields.body" class="text-xs text-gear-red mt-1.5">{{ fields.body }}</p>
      </div>

      <template v-if="selectedCategory">
        <section data-extra>
          <h2 class="form-label">Notas</h2>
          <div class="space-y-4">
            <div v-for="criterion in selectedCategory.criteria" :key="criterion.id">
              <div class="flex items-center justify-between gap-3 mb-1.5">
                <label :for="`score-${criterion.id}`" class="text-sm font-medium">{{ criterion.label }}</label>
                <span class="flex items-center gap-3">
                  <button v-if="scores[criterion.id] !== undefined" type="button" class="text-xs text-gear-muted hover:text-gear-text transition-colors" :aria-label="`Limpar nota de ${criterion.label}`" @click="clearScore(criterion.id)">Limpar</button>
                  <span class="font-mono text-sm font-semibold tabular-nums">{{ scores[criterion.id] ?? '—' }}</span>
                </span>
              </div>
              <input
                :id="`score-${criterion.id}`"
                :value="scores[criterion.id] ?? 0"
                type="range"
                min="0"
                max="10"
                step="0.5"
                class="w-full accent-[var(--neon-color)] transition-opacity"
                :class="{ 'opacity-50': scores[criterion.id] === undefined }"
                @input="setScore(criterion.id, $event)"
              />
              <p v-if="fields[`scores.${criterion.id}`]" class="text-xs text-gear-red mt-1">{{ fields[`scores.${criterion.id}`] }}</p>
            </div>
          </div>
        </section>

        <section v-if="selectedCategory.specFields.length" data-extra>
          <h2 class="form-label">Ficha técnica</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <FormField
              v-for="field in selectedCategory.specFields"
              :id="`spec-${field.key}`"
              :key="field.key"
              v-model="specs[field.key]"
              :label="field.label"
              :error="fields[`specs.${field.key}`]"
            />
          </div>
        </section>
      </template>

      <div data-step>
        <ListField v-model="form.pros" label="Prós" placeholder="Ex: Sensor preciso" :error="fieldError('pros')" />
      </div>

      <div data-step>
        <ListField v-model="form.cons" label="Contras" placeholder="Ex: Software instável" :error="fieldError('cons')" />
      </div>

      <div data-step>
        <span class="form-label">Imagens</span>
        <ImageListField v-model="images" />
        <p v-if="fields.images" class="text-xs text-gear-red mt-1.5">{{ fields.images }}</p>
        <p class="text-xs text-gear-muted mt-2">Até 4 imagens, JPG, PNG ou WebP, com 2 MB cada.</p>
      </div>

      <div data-step class="flex items-center justify-end gap-4 border-t border-gear-border pt-6">
        <button type="button" class="btn-cancel" @click="goBack">Cancelar</button>
        <button type="submit" class="btn-publish" :disabled="sending" :class="{ 'opacity-60': sending }">
          {{ editing ? (sending ? 'Salvando...' : 'Salvar review') : (sending ? 'Publicando...' : 'Publicar review') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { toApiFailure } from '~/composables/useAuth'

export interface ReviewDraft {
  productId: string
  productName: string
  category: string
  title: string | null
  body: string | null
  scores: Record<string, number>
  specs: Record<string, string>
  pros: string[]
  cons: string[]
  images: string[]
}

interface CategoryOption {
  slug: string
  name: string
  criteria: { id: number, label: string }[]
  specFields: { key: string, label: string }[]
}

interface ProductOption {
  id: string
  name: string
  brand: string
  category: string
}

const props = defineProps<{ editing?: { id: string, draft: ReviewDraft } }>()

const toast = useToast()
const goBack = useGoBack()

const { data: categories } = await useFetch<CategoryOption[]>('/api/v1/categories', { key: 'categories' })
const { data: products } = await useFetch<ProductOption[]>('/api/v1/products', { key: 'form-products' })

const draft = props.editing?.draft
const productId = ref('')
const images = ref<string[]>(draft?.images ?? [])
const form = reactive({
  title: draft?.title ?? '',
  body: draft?.body ?? '',
  pros: draft?.pros.length ? draft.pros : [''],
  cons: draft?.cons.length ? draft.cons : [''],
})
const scores = ref<Record<number, number>>(
  Object.fromEntries(Object.entries(draft?.scores ?? {}).map(([id, value]) => [Number(id), Number(value)])),
)
const specs = ref<Record<string, string>>({ ...draft?.specs })
const fields = ref<Record<string, string>>({})
const sending = ref(false)

const productGroups = computed(() => {
  const groups = new Map<string, ProductOption[]>()
  for (const product of products.value ?? []) {
    groups.set(product.category, [...(groups.get(product.category) ?? []), product])
  }
  return [...groups].map(([name, list]) => ({ name, products: list }))
})

const selectedCategory = computed(() => {
  if (draft) return categories.value?.find(category => category.slug === draft.category)
  const product = products.value?.find(item => item.id === productId.value)
  return categories.value?.find(category => category.name === product?.category)
})

// Notas e ficha mudam com a categoria do produto
const root = ref<HTMLElement | null>(null)

watch(selectedCategory, async (next, previous) => {
  if (next?.slug === previous?.slug) return
  scores.value = {}
  specs.value = {}
  await nextTick()
  const sections = root.value?.querySelectorAll('[data-extra]')
  if (sections?.length) {
    gsap.fromTo(sections, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' })
  }
})

useGsapContext(root, (el) => {
  gsap.from(el.querySelectorAll('[data-step], [data-extra]'), { autoAlpha: 0, y: 18, duration: 0.45, ease: 'power3.out', stagger: 0.06, clearProps: 'transform' })
})

function setScore(id: number, event: Event) {
  scores.value[id] = Number((event.target as HTMLInputElement).value)
}

function clearScore(id: number) {
  delete scores.value[id]
}

function fieldError(prefix: string) {
  return Object.entries(fields.value).find(([key]) => key.startsWith(prefix))?.[1]
}

const filled = (items: string[]) => items.map(item => item.trim()).filter(Boolean)

async function submit() {
  fields.value = {}
  sending.value = true
  const review = {
    title: form.title,
    body: form.body,
    scores: scores.value,
    specs: specs.value,
    pros: filled(form.pros),
    cons: filled(form.cons),
    images: images.value,
  }
  try {
    if (props.editing) await $fetch(`/api/v1/reviews/${props.editing.id}`, { method: 'PATCH', body: review })
    else await $fetch('/api/v1/reviews', { method: 'POST', body: { ...review, productId: productId.value || null } })
    clearNuxtData('feed')
    await navigateTo('/')
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.error(failure.message)
  }
  finally {
    sending.value = false
  }
}
</script>
