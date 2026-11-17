<template>
  <!-- Espaço de anúncio: some por inteiro quando não há campanha válida -->
  <div v-if="ads.length" class="space-y-3">
    <a
      v-for="ad in ads"
      :key="ad.creativeId"
      :ref="el => observe(el as HTMLElement | null, ad)"
      :href="`${ad.clickPath}&sid=${sessionId}`"
      target="_blank"
      rel="sponsored noopener nofollow"
      class="group block glass-card overflow-hidden transition-colors hover:border-gear-primary/40"
      :aria-label="`Publicidade de ${ad.advertiser}: ${ad.title ?? ''}`"
    >
      <!-- Banner e painel: a imagem é o principal -->
      <picture v-if="ad.imageUrl && ad.format !== 'brand'" class="block bg-gear-surface">
        <source v-if="ad.mobileImageUrl" :srcset="ad.mobileImageUrl" media="(max-width: 640px)">
        <img :src="ad.imageUrl" :alt="ad.altText ?? ad.title ?? ''" loading="lazy" class="w-full object-cover" :style="ratio ? { aspectRatio: ratio } : undefined">
      </picture>

      <div v-if="ad.format !== 'banner'" class="p-4 flex gap-3" :class="compact ? 'flex-col' : 'items-start'">
        <img v-if="ad.format === 'brand' && ad.logoUrl" :src="ad.logoUrl" :alt="ad.advertiser" class="w-12 h-12 rounded-xl object-cover shrink-0">
        <div class="min-w-0 flex-1 space-y-1">
          <h3 v-if="ad.title" class="text-sm font-semibold leading-snug">{{ ad.title }}</h3>
          <p v-if="ad.description" class="text-sm text-gear-text-secondary leading-relaxed">{{ ad.description }}</p>
          <span v-if="ad.ctaText" class="inline-flex items-center gap-1 text-xs font-semibold text-gear-primary mt-1 group-hover:underline underline-offset-2">
            {{ ad.ctaText }} <AppIcon name="external-link" class="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      <!-- Sempre identificado como anúncio -->
      <p class="px-4 pb-3 text-[11px] text-gear-muted" :class="{ 'pt-3': ad.format === 'banner' }">
        <span class="font-bold uppercase tracking-wider">Publicidade</span> · {{ ad.advertiser }}
      </p>
    </a>
  </div>
</template>

<script setup lang="ts">
interface Ad {
  campaignId: string
  creativeId: string
  format: 'banner' | 'panel' | 'promo_card' | 'brand' | 'institutional'
  advertiser: string
  title: string | null
  description: string | null
  imageUrl: string | null
  mobileImageUrl: string | null
  logoUrl: string | null
  ctaText: string | null
  altText: string | null
  signature: string
  clickPath: string
}
interface SlotAds { slotKey: string, format: string | null, aspectRatio: string | null, items: Ad[] }

const props = defineProps<{ slotKey: string, compact?: boolean }>()

// No navegador: a rotação muda a cada visita, e a impressão só conta quando o anúncio aparece de fato
const { data } = await useFetch<SlotAds>(`/api/v1/ads/${props.slotKey}`, { key: `ad-${props.slotKey}`, server: false, lazy: true })
const ads = computed(() => data.value?.items ?? [])
const ratio = computed(() => data.value?.aspectRatio?.replace(':', ' / ') ?? null)

// Identificador aleatório da sessão (sem conta nem IP): evita contar a mesma pessoa várias vezes
const sessionId = ref('')
onMounted(() => {
  try {
    let id = sessionStorage.getItem('gh-ad-session')
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem('gh-ad-session', id)
    }
    sessionId.value = id
  }
  catch {
    sessionId.value = crypto.randomUUID()
  }
})

// Impressão válida: pelo menos metade do anúncio visível por 1 segundo
const sent = new Set<string>()
const timers = new Map<Element, ReturnType<typeof setTimeout>>()
let observer: IntersectionObserver | null = null
const pending = new Map<Element, Ad>()

function report(ad: Ad) {
  if (sent.has(ad.creativeId) || !sessionId.value) return
  sent.add(ad.creativeId)
  $fetch('/api/v1/ads/impressions', {
    method: 'POST',
    body: { slotKey: props.slotKey, campaignId: ad.campaignId, creativeId: ad.creativeId, signature: ad.signature, sessionId: sessionId.value },
  }).catch(() => sent.delete(ad.creativeId))
}

function observe(el: HTMLElement | null, ad: Ad) {
  if (!el || !import.meta.client || pending.has(el)) return
  pending.set(el, ad)
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const item = pending.get(entry.target)
      if (!item) continue
      if (entry.isIntersecting) {
        timers.set(entry.target, setTimeout(() => report(item), 1000))
      }
      else {
        clearTimeout(timers.get(entry.target))
      }
    }
  }, { threshold: 0.5 })
  observer.observe(el)
}

onBeforeUnmount(() => {
  observer?.disconnect()
  timers.forEach(timer => clearTimeout(timer))
})
</script>
