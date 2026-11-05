<template>
  <div>
    <FormHeader eyebrow="Busca global" title="Buscar" subtitle="Encontre produtos, pessoas e publicações." />

    <div class="max-w-2xl px-4 sm:px-6 lg:px-10 py-6 space-y-8">
      <div class="relative">
        <AppIcon name="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gear-muted" />
        <input
          ref="field"
          v-model="term"
          type="search"
          aria-label="Buscar"
          placeholder="Digite ao menos 2 letras"
          class="field-input !pl-11"
        />
      </div>

      <p v-if="pending" class="text-xs text-gear-muted">Buscando...</p>

      <template v-else-if="results">
        <p v-if="!hasResults" class="glass-card p-10 text-center text-sm text-gear-muted">Nada encontrado para “{{ searched }}”.</p>

        <section v-if="results.products.length">
          <h2 class="form-label">Produtos</h2>
          <ul class="glass-card divide-y divide-gear-border">
            <li v-for="product in results.products" :key="product.id">
              <NuxtLink :to="`/product/${product.slug}`" class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gear-surface/60 transition-colors">
                <span class="min-w-0">
                  <span class="block text-sm font-medium truncate">{{ product.brand }} {{ product.name }}</span>
                  <span class="block text-xs text-gear-muted">{{ product.category }}</span>
                </span>
                <span v-if="product.avgScore !== null" class="font-mono text-sm font-semibold tabular-nums">{{ product.avgScore.toFixed(1) }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section v-if="results.people.length">
          <h2 class="form-label">Pessoas</h2>
          <ul class="glass-card divide-y divide-gear-border">
            <li v-for="person in results.people" :key="person.username">
              <NuxtLink :to="`/profile/${person.username}`" class="flex items-center gap-3 px-4 py-3 hover:bg-gear-surface/60 transition-colors">
                <UserPhoto :src="person.avatarUrl" :name="person.displayName" class="w-9 h-9 text-sm shrink-0" />
                <span class="min-w-0">
                  <span class="block text-sm font-medium truncate">{{ person.displayName }}</span>
                  <span class="block text-xs text-gear-muted truncate">@{{ person.username }}</span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section v-if="results.publications.length" class="space-y-8">
          <h2 class="form-label !mb-0">Publicações</h2>
          <template v-for="item in results.publications" :key="item.id">
            <ReviewCard v-if="item.kind === 'review'" :review="toReview(item)" />
            <PostCard v-else :item="item" />
          </template>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedAuthor, FeedItem } from '~/composables/useFeed'
import { toReview } from '~/composables/useFeed'
import { toApiFailure } from '~/composables/useAuth'

interface SearchResults {
  products: { id: string, slug: string, name: string, brand: string, category: string, avgScore: number | null }[]
  people: FeedAuthor[]
  publications: FeedItem[]
}

const MIN_TERM = 2
const WAIT_MS = 300

useHead({ title: 'Buscar · GearHub' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const term = ref(typeof route.query.q === 'string' ? route.query.q : '')
const searched = ref('')
const results = ref<SearchResults | null>(null)
const pending = ref(false)
const field = ref<HTMLInputElement | null>(null)

const hasResults = computed(() => {
  const found = results.value
  return !!found && found.products.length + found.people.length + found.publications.length > 0
})

let timer: ReturnType<typeof setTimeout> | undefined
let latest = 0

async function run(text: string) {
  const request = ++latest
  pending.value = true
  try {
    const found = await $fetch<SearchResults>('/api/v1/search', { query: { q: text } })
    // Uma resposta antiga não sobrescreve a busca mais recente
    if (request === latest) {
      results.value = found
      searched.value = text
    }
  }
  catch (error) {
    if (request === latest) toast.error(toApiFailure(error).message)
  }
  finally {
    if (request === latest) pending.value = false
  }
}

watch(term, (value) => {
  clearTimeout(timer)
  const text = value.trim()
  router.replace({ query: text ? { q: text } : {} })
  if (text.length < MIN_TERM) {
    latest++
    results.value = null
    pending.value = false
    return
  }
  timer = setTimeout(() => run(text), WAIT_MS)
})

onMounted(() => {
  field.value?.focus()
  if (term.value.trim().length >= MIN_TERM) run(term.value.trim())
})

onBeforeUnmount(() => clearTimeout(timer))
</script>
