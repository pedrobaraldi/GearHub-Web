<template>
  <div class="flex">
    <div class="flex-1 min-w-0">
      <PageHeader title="Comunidade" accent="GearHub." subtitle="Reviews, discussões e novidades sobre hardware e periféricos." :back="false" lines>
        <button type="button" class="btn-primary hidden lg:inline-flex items-center gap-2 shrink-0" aria-label="Nova Publicação" @click="start">
          <AppIcon name="plus" class="w-4 h-4" />
          <span>Nova Publicação</span>
        </button>
      </PageHeader>

      <!-- Filtros ficam visíveis durante a rolagem -->
      <div class="lg:sticky lg:top-0 z-20 lg:bg-gear-bg/85 lg:backdrop-blur-lg px-4 sm:px-6 lg:px-10 pt-3">
        <div class="max-w-2xl mx-auto">
          <SearchBar v-model="search" class="mb-3" placeholder="Buscar publicações, produtos ou pessoas..." />
          <FeedFilter v-model="activeFeedFilter" />
          <div class="xl:hidden pb-2">
            <CategoryFilter v-model="activeCategory" />
          </div>
        </div>
      </div>

      <div class="px-4 sm:px-6 lg:px-10 py-6">
        <div class="max-w-2xl mx-auto space-y-8">
          <div v-if="error" class="glass-card p-10 text-center">
            <p class="text-sm font-semibold mb-5">{{ toApiFailure(error).message }}</p>
            <button class="btn-primary" @click="refresh()">Tentar novamente</button>
          </div>

          <template v-else-if="visibleItems.length">
            <template v-for="item in visibleItems" :key="item.id">
              <ReviewCard v-if="item.kind === 'review'" :review="toReview(item)" />
              <PostCard v-else :item="item" />
            </template>

            <div v-if="cursor" class="text-center">
              <button class="pill pill-idle px-6" :disabled="loadingMore" @click="loadMore">
                {{ loadingMore ? 'Carregando...' : 'Carregar mais' }}
              </button>
            </div>
          </template>

          <div v-else-if="status !== 'pending'" class="glass-card p-10 text-center">
            <p class="text-sm font-semibold mb-1">Nada por aqui ainda</p>
            <p class="text-xs text-gear-muted mb-5">Nenhuma publicação combina com esses filtros.</p>
            <button class="btn-primary" @click="clearFilters">Limpar filtros</button>
          </div>
        </div>
      </div>
    </div>

    <TrendingSidebar v-model:category="activeCategory" />
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useGearData'
import type { FeedItem, FeedPage } from '~/composables/useFeed'
import { toReview } from '~/composables/useFeed'
import { toApiFailure } from '~/composables/useAuth'

useHead({ title: 'Feed · GearHub' })

const PAGE_SIZE = 4

const { start } = useNewPost()
const toast = useToast()

const activeFeedFilter = useState('feed-type', () => 'todos')
const activeCategory = useState<Category>('feed-category', () => 'Todos')

const { categories } = await useCatalog()
const categorySlug = computed(() => categories.value.find(category => category.name === activeCategory.value)?.slug)

const search = useState('feed-search', () => '')
const debouncedSearch = refDebounced(search, 300)
const searchTerm = computed(() => debouncedSearch.value.trim() || undefined)

const { data, error, status, refresh } = await useFetch<FeedPage>('/api/v1/feed', {
  query: { size: PAGE_SIZE, category: categorySlug, q: searchTerm },
  key: 'feed',
  headers: useRequestHeaders(['cookie']),
})

const extraItems = ref<FeedItem[]>([])
const extraCursor = ref<string | null | undefined>(undefined)
const loadingMore = ref(false)

const items = computed(() => [...(data.value?.items ?? []), ...extraItems.value])
const cursor = computed(() => (extraCursor.value === undefined ? data.value?.nextCursor : extraCursor.value))
const visibleItems = computed(() =>
  activeFeedFilter.value === 'todos' ? items.value : items.value.filter(item => item.kind === activeFeedFilter.value),
)

watch(data, () => {
  extraItems.value = []
  extraCursor.value = undefined
})

async function loadMore() {
  loadingMore.value = true
  try {
    const page = await $fetch<FeedPage>('/api/v1/feed', {
      query: { size: PAGE_SIZE, category: categorySlug.value, q: searchTerm.value, before: cursor.value },
    })
    extraItems.value = [...extraItems.value, ...page.items]
    extraCursor.value = page.nextCursor
  }
  catch (failure) {
    toast.error(toApiFailure(failure).message)
  }
  finally {
    loadingMore.value = false
  }
}

function clearFilters() {
  search.value = ''
  activeFeedFilter.value = 'todos'
  activeCategory.value = 'Todos'
}
</script>
