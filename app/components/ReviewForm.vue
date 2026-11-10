<template>
  <div ref="root">
  <FormShell
    :title="editing ? 'Editar review' : 'Nova review'"
    subtitle="Escolha o produto, preencha a ficha e conte sua experiência."
    preview-label="Como vai aparecer no feed"
  >
    <form novalidate @submit.prevent="submit">
      <div data-step>
        <FormSection title="Produto" icon="package" :subtitle="editing ? undefined : 'Diga qual produto você está avaliando. Se ele já existir na GearHub, sua review entra nele.'">
          <p v-if="editing" class="text-sm font-medium">{{ editing.draft.productName }}</p>
          <div v-else class="space-y-4">
            <fieldset>
              <legend class="block text-sm font-medium mb-1.5">Categoria<span class="text-gear-accent" aria-hidden="true"> *</span></legend>
              <!-- Fechado mostra as primeiras e a escolhida; o resto abre no botão -->
              <div id="review-categories" class="flex flex-wrap gap-2">
                <button
                  v-for="option in visibleCategories"
                  :key="option.slug"
                  type="button"
                  class="h-9 px-3 rounded-full border text-xs font-medium transition-colors"
                  :class="categorySlug === option.slug ? 'border-gear-primary bg-gear-primary/10 text-gear-primary' : 'border-gear-border text-gear-muted hover:text-gear-text hover:border-gear-text/30'"
                  :aria-pressed="categorySlug === option.slug"
                  @click="categorySlug = option.slug"
                >
                  {{ option.name }}
                </button>
                <button
                  v-if="hiddenCategoryCount"
                  type="button"
                  class="inline-flex items-center gap-1 h-9 px-3 rounded-full text-xs font-semibold text-gear-accent hover:bg-gear-accent/10 transition-colors"
                  :aria-expanded="showAllCategories"
                  aria-controls="review-categories"
                  @click="showAllCategories = !showAllCategories"
                >
                  {{ showAllCategories ? 'Menos categorias' : `Mais categorias (${hiddenCategoryCount})` }}
                  <AppIcon name="chevron-down" class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': showAllCategories }" />
                </button>
              </div>
              <p v-if="fields.category" class="text-xs text-gear-red mt-1.5">{{ fields.category }}</p>
            </fieldset>
            <!-- Marca e modelo sugerem o que já existe, para o mesmo produto não aparecer duas vezes -->
            <div class="grid sm:grid-cols-2 gap-4">
              <FormField id="brand" v-model="brand" label="Marca" placeholder="Ex: Logitech" :options="brandSuggestions" :error="fields.brand" required />
              <FormField id="model" v-model="model" label="Modelo" placeholder="Ex: G Pro X Superlight 2" :options="modelSuggestions" :error="fields.model" required />
            </div>
            <p v-if="matchedProduct" class="text-xs text-gear-green flex items-center gap-1.5">
              <AppIcon name="check" class="w-3.5 h-3.5" />
              Esse produto já está na GearHub: sua review vai somar às outras.
            </p>
          </div>
        </FormSection>
      </div>

      <template v-if="selectedCategory">
        <div data-extra>
          <FormSection title="Ficha técnica" icon="list-checks" :subtitle="`Campos de ${selectedCategory.name}. Se não souber, use &quot;Não informado&quot;.`">
            <template #aside>
              <span class="text-xs font-mono tabular-nums shrink-0" :class="requiredFilled === requiredFields.length ? 'text-gear-green' : 'text-gear-muted'">{{ requiredFilled }}/{{ requiredFields.length }}</span>
            </template>
            <div class="grid sm:grid-cols-2 gap-4">
              <FormField
                v-for="field in requiredFields"
                :id="`spec-${field.key}`"
                :key="field.key"
                v-model="specs[field.key]"
                :label="field.label"
                :options="optionsOf(field)"
                :placeholder="field.key === 'valor' ? 'Ex: R$ 1.299,00' : undefined"
                :error="fields[`specs.${field.key}`]"
                required
              />
            </div>

            <template v-if="optionalFields.length">
              <button type="button" class="flex items-center gap-2 mt-5 min-h-11 sm:min-h-0 text-sm font-medium text-gear-text-secondary hover:text-gear-text transition-colors" :aria-expanded="showOptional" @click="showOptional = !showOptional">
                <AppIcon name="chevron-down" class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showOptional }" />
                Mais detalhes (opcional)
              </button>
              <div v-show="showOptional" class="grid sm:grid-cols-2 gap-4 mt-4">
                <FormField
                  v-for="field in optionalFields"
                  :id="`spec-${field.key}`"
                  :key="field.key"
                  v-model="specs[field.key]"
                  :label="field.label"
                  :options="optionsOf(field)"
                  :error="fields[`specs.${field.key}`]"
                />
              </div>
            </template>
          </FormSection>
        </div>
      </template>

      <div data-step>
        <FormSection title="Sua análise" icon="file-text">
          <div class="space-y-4">
            <FormField id="title" v-model="form.title" label="Título" placeholder="Ex: Hall Effect é o novo padrão competitivo" :error="fields.title" />
            <div>
              <label for="body" class="block text-sm font-medium mb-1.5">Texto</label>
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
          </div>
        </FormSection>
      </div>

      <div v-if="selectedCategory" data-extra>
        <FormSection title="Notas" icon="star" subtitle="Avalie só o que você testou. A nota geral é a média.">
          <template #aside>
            <span class="font-display italic font-extrabold text-2xl leading-none tabular-nums text-gear-primary shrink-0">{{ average ?? '—' }}</span>
          </template>
          <div class="space-y-5">
            <div v-for="criterion in selectedCategory.criteria" :key="criterion.id">
              <div class="flex items-center justify-between gap-3 mb-1">
                <label :for="`score-${criterion.id}`" class="text-sm font-medium">{{ criterion.label }}</label>
                <span class="flex items-center gap-3">
                  <button v-if="scores[criterion.id] !== undefined" type="button" class="text-xs text-gear-muted hover:text-gear-text transition-colors py-1" :aria-label="`Limpar nota de ${criterion.label}`" @click="clearScore(criterion.id)">Limpar</button>
                  <span class="font-mono text-sm font-semibold tabular-nums w-8 text-right">{{ scores[criterion.id] ?? '—' }}</span>
                </span>
              </div>
              <input
                :id="`score-${criterion.id}`"
                :value="scores[criterion.id] ?? 0"
                type="range"
                min="0"
                max="10"
                step="0.5"
                class="w-full h-8 accent-[var(--neon-color)] transition-opacity"
                :class="{ 'opacity-50': scores[criterion.id] === undefined }"
                @input="setScore(criterion.id, $event)"
              />
              <p v-if="fields[`scores.${criterion.id}`]" class="text-xs text-gear-red mt-1">{{ fields[`scores.${criterion.id}`] }}</p>
            </div>
          </div>
        </FormSection>
      </div>

      <div data-step>
        <FormSection title="Prós e contras" icon="check">
          <div class="grid sm:grid-cols-2 gap-5">
            <ListField v-model="form.pros" label="Prós" placeholder="Ex: Sensor preciso" :error="fieldError('pros')" />
            <ListField v-model="form.cons" label="Contras" placeholder="Ex: Software instável" :error="fieldError('cons')" />
          </div>
        </FormSection>
      </div>

      <div data-step>
        <FormSection title="Imagens" icon="image-plus" subtitle="Até 10 imagens, JPG, PNG ou WebP, com 2 MB cada. No feed elas viram um carrossel.">
          <ImageListField v-model="images" />
          <p v-if="fields.images" class="text-xs text-gear-red mt-1.5">{{ fields.images }}</p>
        </FormSection>
      </div>

      <div data-step class="form-actions">
        <button type="button" class="btn-cancel" @click="goBack">Cancelar</button>
        <button type="submit" class="btn-publish" :disabled="sending" :class="{ 'opacity-60': sending }">
          {{ editing ? (sending ? 'Salvando...' : 'Salvar review') : (sending ? 'Publicando...' : 'Publicar review') }}
        </button>
      </div>
    </form>

    <template #preview>
      <ReviewPreview
        :author="user ? { displayName: user.displayName, avatarUrl: user.avatarUrl } : null"
        :product-name="previewProductName"
        :category-name="selectedCategory?.name"
        :title="form.title"
        :body="form.body"
        :average="average"
        :pros="filled(form.pros)"
        :cons="filled(form.cons)"
        :images="images"
      />
    </template>
  </FormShell>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import type { PickerProduct } from '~/components/ProductPicker.vue'
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
  specFields: SpecFieldOption[]
}

interface SpecFieldOption {
  key: string
  label: string
  required: boolean
  options: string[]
}

// Regra do catálogo: o que não se aplica ou não se sabe também é uma resposta
const UNKNOWN_VALUES = ['Não se aplica', 'Não informado']

const props = defineProps<{ editing?: { id: string, draft: ReviewDraft } }>()
const rankUp = useRankUp()
const { user } = useAuth()

const toast = useToast()
const goBack = useGoBack()

const { data: categories } = await useFetch<CategoryOption[]>('/api/v1/categories', { key: 'categories' })
const { data: products } = await useFetch<PickerProduct[]>('/api/v1/products', { key: 'form-products' })

const draft = props.editing?.draft
// Produto informado por categoria, marca e modelo (a API encontra o existente ou cria)
const categorySlug = ref('')
const brand = ref('')
const model = ref('')
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
const specs = ref<Record<string, string>>({ modelo: draft?.productName ?? '', ...draft?.specs })
const showOptional = ref(false)
const fields = ref<Record<string, string>>({})
const sending = ref(false)

const selectedCategory = computed(() =>
  categories.value?.find(category => category.slug === (draft ? draft.category : categorySlug.value)))

// Categorias que aparecem com a lista fechada; a escolhida sempre aparece
const COLLAPSED_CATEGORIES = 6
const showAllCategories = ref(false)
const visibleCategories = computed(() => {
  const all = categories.value ?? []
  if (showAllCategories.value) return all
  const first = all.slice(0, COLLAPSED_CATEGORIES)
  const chosen = all.find(option => option.slug === categorySlug.value)
  return chosen && !first.includes(chosen) ? [...first, chosen] : first
})
const hiddenCategoryCount = computed(() => Math.max(0, (categories.value?.length ?? 0) - COLLAPSED_CATEGORIES))

// Sugestões tiradas do catálogo da categoria escolhida
const sameCategory = computed(() => (products.value ?? []).filter(product => product.category === selectedCategory.value?.name))
const brandSuggestions = computed(() => [...new Set(sameCategory.value.map(product => product.brand))].sort())
const modelSuggestions = computed(() =>
  sameCategory.value.filter(product => product.brand.toLowerCase() === brand.value.trim().toLowerCase()).map(product => product.name))
const matchedProduct = computed(() => sameCategory.value.find(product =>
  product.brand.toLowerCase() === brand.value.trim().toLowerCase()
  && [product.name.toLowerCase(), productTitle(product).toLowerCase()].includes(model.value.trim().replace(/\s+/g, ' ').toLowerCase())))

const requiredFields = computed(() => selectedCategory.value?.specFields.filter(field => field.required) ?? [])
const optionalFields = computed(() => selectedCategory.value?.specFields.filter(field => !field.required) ?? [])
const requiredFilled = computed(() => requiredFields.value.filter(field => specs.value[field.key]?.trim()).length)

const optionsOf = (field: SpecFieldOption) => (field.key === 'modelo' ? [] : [...field.options, ...UNKNOWN_VALUES])

const average = computed(() => {
  const values = Object.values(scores.value)
  return values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : null
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

// O campo "modelo" da ficha acompanha marca e modelo, e a pessoa pode detalhar
watch([brand, model], ([nextBrand, nextModel]) => {
  specs.value.modelo = [nextBrand.trim(), nextModel.trim()].filter(Boolean).join(' ')
}, { flush: 'post' })

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

const previewProductName = computed(() =>
  draft ? draft.productName : [brand.value.trim(), model.value.trim()].filter(Boolean).join(' ') || undefined)

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
    else await $fetch('/api/v1/reviews', { method: 'POST', body: { ...review, category: categorySlug.value || null, brand: brand.value, model: model.value } })
    // Publicar dá XP: confere na hora se a pessoa subiu de patente
    rankUp.check(true)
    clearNuxtData('feed')
    await navigateTo('/', { replace: true })
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
    if (optionalFields.value.some(field => failure.fields[`specs.${field.key}`])) showOptional.value = true
    await nextTick()
    root.value?.querySelector('[aria-invalid="true"], .field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  finally {
    sending.value = false
  }
}
</script>
