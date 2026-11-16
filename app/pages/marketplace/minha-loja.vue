<template>
  <div>
    <PageHeader title="Minha" accent="loja." subtitle="O perfil público da loja e os produtos da vitrine." back>
      <NuxtLink v-if="store" :to="`/marketplace/loja/${store.slug}`" class="btn-outline shrink-0">
        <AppIcon name="eye" class="w-4 h-4" /><span class="hidden sm:inline">Ver na vitrine</span>
      </NuxtLink>
    </PageHeader>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
      <div v-if="!store" class="glass-card p-6 text-sm text-gear-muted space-y-3">
        <p>Você ainda não tem uma loja parceira.</p>
        <NuxtLink to="/marketplace/parceria" class="btn-publish !py-0 min-h-[2.5rem] w-fit">Abrir minha loja</NuxtLink>
      </div>

      <template v-else>
        <p v-if="store.status === 'suspended'" class="glass-card p-4 text-sm border-gear-red/40 text-gear-red" role="alert">
          Sua loja está suspensa e não aparece na vitrine.<span v-if="store.suspendedNote"> Motivo: {{ store.suspendedNote }}</span>
        </p>

        <div class="grid sm:grid-cols-3 gap-3">
          <div class="glass-card p-4"><p class="text-xs text-gear-muted">Produtos ativos</p><p class="text-2xl font-bold">{{ activeCount }}</p></div>
          <div class="glass-card p-4"><p class="text-xs text-gear-muted">Cliques em "Comprar na loja" (30 dias)</p><p class="text-2xl font-bold">{{ store.clicksLast30Days }}</p></div>
          <div class="glass-card p-4"><p class="text-xs text-gear-muted">Endereço na vitrine</p><p class="text-sm font-semibold break-all">/marketplace/loja/{{ store.slug }}</p></div>
        </div>

        <!-- Produtos -->
        <section class="glass-card p-5 space-y-4" aria-labelledby="products-title">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 id="products-title" class="text-sm font-semibold">Produtos</h2>
            <button v-if="!editing" type="button" class="btn-publish !py-0 min-h-[2.5rem]" @click="openProduct(null)">
              <AppIcon name="plus" class="w-4 h-4" /> Novo produto
            </button>
          </div>

          <!-- Formulário de produto -->
          <form v-if="editing" class="space-y-3 border border-gear-border rounded-2xl p-4" novalidate @submit.prevent="saveProduct">
            <h3 class="text-sm font-semibold">{{ editing.id ? 'Editar produto' : 'Novo produto' }}</h3>
            <FormField id="product-name" v-model="productForm.name" label="Nome" :error="fields.name" />
            <div>
              <label for="product-description" class="form-label">Descrição</label>
              <textarea id="product-description" v-model="productForm.description" rows="3" maxlength="3000" class="field-input" />
              <p v-if="fields.description" class="field-error">{{ fields.description }}</p>
            </div>
            <div class="grid sm:grid-cols-3 gap-3 items-start">
              <FormField id="product-price" v-model="productForm.price" label="Preço (R$, informativo)" inputmode="decimal" placeholder="399,90" :error="fields.price" />
              <div>
                <label for="product-availability" class="form-label">Disponibilidade</label>
                <select id="product-availability" v-model="productForm.availability" class="field-input">
                  <option v-for="(label, value) in AVAILABILITY_LABEL" :key="value" :value="value">{{ label }}</option>
                </select>
              </div>
              <div>
                <label for="product-category" class="form-label">Categoria</label>
                <select id="product-category" v-model="productForm.category" class="field-input">
                  <option value="">Sem categoria</option>
                  <option v-for="category in categories" :key="category.slug" :value="category.slug">{{ category.name }}</option>
                </select>
                <p v-if="fields.category" class="field-error">{{ fields.category }}</p>
              </div>
            </div>
            <FormField id="product-url" v-model="productForm.purchaseUrl" label="Link do produto no site da loja" type="url" placeholder="https://sualoja.com.br/produto" hint="É para onde o botão Comprar na loja leva." :error="fields.purchaseUrl" />

            <div>
              <p class="form-label">Fotos (até 10)</p>
              <ul class="flex flex-wrap gap-2">
                <li v-for="(image, index) in productForm.images" :key="image" class="relative w-20 h-20 rounded-xl overflow-hidden bg-gear-surface">
                  <img :src="image" alt="" class="w-full h-full object-cover">
                  <button type="button" class="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-black/70 text-white" :aria-label="`Remover foto ${index + 1}`" @click="productForm.images.splice(index, 1)">
                    <AppIcon name="x" class="w-3.5 h-3.5" />
                  </button>
                </li>
                <li v-if="productForm.images.length < 10">
                  <label class="w-20 h-20 rounded-xl border border-dashed border-gear-border grid place-items-center text-gear-muted cursor-pointer hover:text-gear-text" :class="{ 'opacity-60': busy }">
                    <AppIcon name="image-plus" class="w-5 h-5" />
                    <span class="sr-only">Adicionar foto</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="busy" @change="addProductImage">
                  </label>
                </li>
              </ul>
              <p v-if="fields.images" class="field-error">{{ fields.images }}</p>
            </div>

            <div class="flex gap-2">
              <button type="submit" class="btn-publish !py-0 min-h-[2.5rem]" :disabled="busy">{{ busy ? 'Salvando...' : (editing.id ? 'Salvar' : 'Publicar') }}</button>
              <button type="button" class="btn-outline" @click="editing = null">Cancelar</button>
            </div>
          </form>

          <ul v-if="products?.length" class="divide-y divide-gear-border">
            <li v-for="product in products" :key="product.id" class="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <span class="w-14 h-14 rounded-xl overflow-hidden bg-gear-surface grid place-items-center shrink-0">
                  <img v-if="product.images[0]" :src="product.images[0]" alt="" class="w-full h-full object-cover">
                  <AppIcon v-else name="package" class="w-5 h-5 text-gear-muted" />
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-semibold truncate">{{ product.name }}</p>
                  <p class="text-xs text-gear-muted">
                    {{ formatPrice(product.price) ?? 'Sem preço' }} · {{ STATUS_LABEL[product.status] }} · {{ product.clicksLast30Days }} cliques em 30 dias
                  </p>
                  <p v-if="product.removedNote" class="text-xs text-gear-red">Tirado do ar pela equipe: {{ product.removedNote }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 shrink-0">
                <button type="button" class="btn-outline !px-3 !py-1.5 text-xs" @click="openProduct(product)">Editar</button>
                <button v-if="product.status !== 'active'" type="button" class="btn-outline !px-3 !py-1.5 text-xs" :disabled="busy" @click="setStatus(product, 'active')">Ativar</button>
                <button v-if="product.status === 'active'" type="button" class="btn-outline !px-3 !py-1.5 text-xs" :disabled="busy" @click="setStatus(product, 'paused')">Pausar</button>
                <button v-if="product.status !== 'archived'" type="button" class="btn-outline !px-3 !py-1.5 text-xs" :disabled="busy" @click="setStatus(product, 'archived')">Arquivar</button>
                <button type="button" class="btn-outline !px-3 !py-1.5 text-xs text-gear-red" :disabled="busy" @click="removeProduct(product)">Remover</button>
              </div>
            </li>
          </ul>
          <p v-else-if="!editing" class="text-sm text-gear-muted">Nenhum produto ainda. Os produtos publicados aparecem na vitrine na hora.</p>
        </section>

        <!-- Perfil público da loja -->
        <form class="glass-card p-5 space-y-3" novalidate @submit.prevent="saveStore">
          <h2 class="text-sm font-semibold">Perfil da loja</h2>
          <div class="flex flex-wrap gap-4">
            <div>
              <p class="form-label">Logotipo</p>
              <label class="w-24 h-24 rounded-2xl overflow-hidden border border-dashed border-gear-border grid place-items-center text-gear-muted cursor-pointer hover:text-gear-text">
                <img v-if="storeForm.logoUrl" :src="storeForm.logoUrl" alt="Logotipo da loja" class="w-full h-full object-cover">
                <AppIcon v-else name="image-plus" class="w-6 h-6" />
                <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="busy" @change="uploadStoreImage($event, 'logoUrl')">
              </label>
            </div>
            <div class="flex-1 min-w-[200px]">
              <p class="form-label">Banner</p>
              <label class="h-24 rounded-2xl overflow-hidden border border-dashed border-gear-border grid place-items-center text-gear-muted cursor-pointer hover:text-gear-text">
                <img v-if="storeForm.bannerUrl" :src="storeForm.bannerUrl" alt="Banner da loja" class="w-full h-full object-cover">
                <AppIcon v-else name="image-plus" class="w-6 h-6" />
                <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="busy" @change="uploadStoreImage($event, 'bannerUrl')">
              </label>
            </div>
          </div>
          <div class="grid sm:grid-cols-2 gap-3 items-start">
            <FormField id="store-name" v-model="storeForm.name" label="Nome da loja" :error="fields.name" />
            <FormField id="store-segment" v-model="storeForm.segment" label="Segmento" :error="fields.segment" />
            <FormField id="store-website" v-model="storeForm.website" label="Site" type="url" placeholder="https://" :error="fields.website" />
            <FormField id="store-instagram" v-model="storeForm.instagram" label="Instagram" placeholder="@sualoja" :error="fields.instagram" />
          </div>
          <div>
            <label for="store-description" class="form-label">Sobre a loja</label>
            <textarea id="store-description" v-model="storeForm.description" rows="4" maxlength="2000" class="field-input" />
          </div>
          <button type="submit" class="btn-publish !py-0 min-h-[2.5rem]" :disabled="busy">{{ busy ? 'Salvando...' : 'Salvar perfil' }}</button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'
import { AVAILABILITY_LABEL, formatPrice, uploadFile, type Availability, type MyProduct, type MyStore } from '~/composables/useMarketplace'

useHead({ title: 'Minha loja · Marketplace · GearHub' })

const STATUS_LABEL: Record<MyProduct['status'], string> = { active: 'Na vitrine', paused: 'Pausado', archived: 'Arquivado' }

const toast = useToast()
const { data: store, refresh: refreshStore } = await useFetch<MyStore | null>('/api/v1/marketplace/my-store', {
  key: 'market-my-store',
  default: () => null,
})
const { data: products, refresh: refreshProducts } = await useFetch<MyProduct[]>('/api/v1/marketplace/my-store/products', {
  key: 'market-my-products',
  immediate: !!store.value,
  default: () => [],
})
const { data: categories } = await useFetch<{ slug: string, name: string }[]>('/api/v1/categories', {
  key: 'categories-list',
  default: () => [],
})
const activeCount = computed(() => products.value?.filter(product => product.status === 'active' && !product.removedNote).length ?? 0)

const fields = ref<Record<string, string>>({})
const busy = ref(false)

async function run(action: () => Promise<void>) {
  fields.value = {}
  busy.value = true
  try {
    await action()
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
  }
  finally {
    busy.value = false
  }
}

// Perfil da loja
const storeForm = reactive({ name: '', description: '', logoUrl: '', bannerUrl: '', segment: '', website: '', instagram: '' })
watch(store, (value) => {
  if (!value) return
  Object.assign(storeForm, {
    name: value.name, description: value.description ?? '', logoUrl: value.logoUrl ?? '', bannerUrl: value.bannerUrl ?? '',
    segment: value.segment ?? '', website: value.website ?? '', instagram: value.instagram ? `@${value.instagram}` : '',
  })
}, { immediate: true })

function uploadStoreImage(event: Event, field: 'logoUrl' | 'bannerUrl') {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  return run(async () => {
    storeForm[field] = (await uploadFile<{ url: string }>('/api/v1/marketplace/my-store/images', file)).url
  })
}

function saveStore() {
  return run(async () => {
    store.value = await $fetch<MyStore>('/api/v1/marketplace/my-store', { method: 'PUT', body: storeForm })
    toast.success('Perfil da loja salvo.')
  })
}

// Produtos
const editing = ref<{ id: string | null } | null>(null)
const productForm = reactive({ name: '', description: '', price: '', availability: 'in_stock' as Availability, category: '', purchaseUrl: '', images: [] as string[] })

function openProduct(product: MyProduct | null) {
  fields.value = {}
  editing.value = { id: product?.id ?? null }
  Object.assign(productForm, {
    name: product?.name ?? '', description: product?.description ?? '',
    price: product?.price !== null && product?.price !== undefined ? String(product.price).replace('.', ',') : '',
    availability: product?.availability ?? 'in_stock', category: product?.category ?? '',
    purchaseUrl: product?.purchaseUrl ?? '', images: [...(product?.images ?? [])],
  })
}

function addProductImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  return run(async () => {
    productForm.images.push((await uploadFile<{ url: string }>('/api/v1/marketplace/my-store/images', file)).url)
  })
}

function saveProduct() {
  const id = editing.value?.id
  return run(async () => {
    const price = productForm.price.trim() ? Number(productForm.price.replace(/\./g, '').replace(',', '.')) : null
    if (price !== null && Number.isNaN(price)) {
      fields.value = { price: 'Use só números, como 399,90' }
      return
    }
    const body = { ...productForm, price, category: productForm.category || null }
    await $fetch(id ? `/api/v1/marketplace/my-store/products/${id}` : '/api/v1/marketplace/my-store/products', {
      method: id ? 'PUT' : 'POST', body,
    })
    editing.value = null
    await refreshProducts()
    toast.success(id ? 'Produto salvo.' : 'Produto publicado na vitrine.')
  })
}

function setStatus(product: MyProduct, status: MyProduct['status']) {
  return run(async () => {
    await $fetch(`/api/v1/marketplace/my-store/products/${product.id}/status`, { method: 'POST', body: { status } })
    await refreshProducts()
  })
}

function removeProduct(product: MyProduct) {
  if (!window.confirm(`Remover "${product.name}" da loja? Ele sai da vitrine.`)) return
  return run(async () => {
    await $fetch(`/api/v1/marketplace/my-store/products/${product.id}`, { method: 'DELETE' })
    await Promise.all([refreshProducts(), refreshStore()])
    toast.success('Produto removido.')
  })
}
</script>
