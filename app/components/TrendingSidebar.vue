<template>
  <aside
    class="hidden xl:block shrink-0 border-l border-gear-border sticky top-0 h-screen overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-out"
    :class="collapsed ? 'w-[72px]' : 'w-80'"
  >
    <button
      ref="toggle"
      type="button"
      :aria-expanded="!collapsed"
      :aria-label="collapsed ? 'Expandir coluna' : 'Recolher coluna'"
      :title="collapsed ? 'Expandir coluna' : 'Recolher coluna'"
      class="absolute left-5 top-[22px] z-10 w-8 h-8 grid place-items-center rounded-lg text-gear-muted hover:text-gear-text hover:bg-gear-surface/60 transition-colors duration-200"
      @click="collapsed = !collapsed"
    >
      <AppIcon :name="collapsed ? 'panel-right-open' : 'panel-right-close'" class="w-[18px] h-[18px]" />
    </button>

    <!-- Largura fixa para o conteúdo não se espremer durante a transição -->
    <div
      class="w-80 px-8 pt-[70px] pb-8 space-y-8 transition-opacity duration-150"
      :class="{ 'opacity-0 pointer-events-none': collapsed }"
      :inert="collapsed"
    >
      <section>
        <h4 class="editorial-eyebrow mb-4 flex items-center gap-2">
          <AppIcon name="trending-up" class="w-3 h-3" />
          Em alta
        </h4>
        <ul class="space-y-1">
          <li v-for="(product, i) in trendingProducts" :key="product.id">
            <NuxtLink
              :to="productPath(product)"
              class="group flex items-center gap-3 -mx-2 p-2 rounded-xl hover:bg-gear-surface transition-colors"
            >
              <span class="w-9 h-9 rounded-lg border border-gear-border bg-gear-surface grid place-items-center text-[10px] font-bold text-gear-muted shrink-0">
                #{{ i + 1 }}
              </span>
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold truncate group-hover:text-gear-primary transition-colors">{{ product.name }}</span>
                <span class="block text-[11px] text-gear-muted">{{ product.category }}</span>
              </span>
              <span class="font-mono text-xs font-semibold text-gear-primary tabular-nums shrink-0">{{ product.score!.toFixed(1) }}</span>
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/rankings" class="btn-outline w-full mt-4 !py-1.5 !text-xs">Ver Rankings</NuxtLink>
      </section>

      <section>
        <h4 class="editorial-eyebrow mb-4 flex items-center gap-2">
          <AppIcon name="git-compare" class="w-3 h-3" />
          Comparar
        </h4>
        <NuxtLink to="/compare" class="block glass-card neon-hover p-4">
          <p class="text-sm font-semibold mb-1">Lado a lado</p>
          <p class="text-xs text-gear-muted leading-relaxed">Compare até 4 produtos por notas, radar e prós/contras.</p>
        </NuxtLink>
      </section>

      <section>
        <h4 class="editorial-eyebrow mb-4">Categorias</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat"
            class="pill"
            :class="category === cat ? 'pill-active' : 'pill-idle'"
            :aria-pressed="category === cat"
            @click="$emit('update:category', category === cat ? 'Todos' : cat)"
          >
            {{ cat }}
          </button>
        </div>
      </section>

    </div>
  </aside>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import type { Category } from '~/composables/useGearData'
import { CATEGORIES, productPath, useMockProducts } from '~/composables/useGearData'

defineProps<{ category: Category }>()
defineEmits<{ 'update:category': [v: Category] }>()

const trendingProducts = useMockProducts().slice(0, 5)
const categories = CATEGORIES.filter(c => c !== 'Todos')

// Em cookie para a página já abrir no estado certo, como no menu esquerdo
const collapsed = useCookie<boolean>('gearhub-rail-collapsed', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})

const toggle = ref<HTMLElement | null>(null)

watch(collapsed, async () => {
  await nextTick()
  gsap.fromTo(
    toggle.value?.querySelector('svg') ?? null,
    { rotate: 90, scale: 0.6 },
    { rotate: 0, scale: 1, duration: 0.45, ease: 'back.out(2)' },
  )
})
</script>
