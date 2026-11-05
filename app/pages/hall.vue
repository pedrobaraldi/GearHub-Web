<template>
  <div>
    <PageHeader title="Hall of" accent="Fame." subtitle="Setups, reviewers e produtos que marcaram o ano." />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-10">
      <!-- Pódio -->
      <section class="reveal" v-reveal>
        <h2 class="editorial-eyebrow mb-4">Top reviewers 2024</h2>
        <div class="glass-card p-6 flex items-end justify-center gap-3 sm:gap-6">
          <NuxtLink
            v-for="reviewer in podium"
            :key="reviewer.place"
            :to="`/profile/${reviewer.slug}`"
            class="group text-center flex flex-col items-center gap-1 min-w-0"
          >
            <img
              :src="reviewer.avatar"
              :alt="reviewer.name"
              class="rounded-full object-cover ring-2 mb-1"
              :class="reviewer.place === 1 ? 'w-16 h-16 ring-gear-accent' : 'w-14 h-14 ring-gear-border'"
            />
            <p class="text-sm font-semibold truncate max-w-full group-hover:text-gear-primary transition-colors">{{ reviewer.name }}</p>
            <p class="text-xs text-gear-muted mb-1">{{ reviewer.reviews }} reviews</p>
            <div
              class="w-20 sm:w-24 rounded-t-xl border grid place-items-center"
              :class="reviewer.place === 1 ? 'h-24 border-gear-accent/40 bg-gear-accent/10' : `${reviewer.height} border-gear-border bg-gear-surface`"
            >
              <span
                class="font-display italic font-extrabold text-3xl leading-none"
                :class="reviewer.place === 1 ? 'text-gear-primary' : 'text-gear-muted'"
              >{{ reviewer.place }}</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Melhores setups -->
      <section>
        <h2 class="editorial-eyebrow mb-4">Melhores setups do ano</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <article
            v-for="setup in topSetups"
            :key="setup.id"
            class="reveal glass-card neon-hover group overflow-hidden"
            v-reveal
          >
            <div class="aspect-video bg-gear-surface overflow-hidden">
              <img
                :src="setup.image"
                :alt="setup.title"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div class="p-4">
              <h3 class="text-sm font-semibold mb-2 truncate">{{ setup.title }}</h3>
              <div class="flex items-center gap-2 text-xs text-gear-muted">
                <img :src="setup.user.avatar" class="w-5 h-5 rounded-full" alt="" />
                <span>{{ setup.user.name }}</span>
                <span class="ml-auto">{{ setup.likes }} curtidas</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Produtos do ano -->
      <section>
        <h2 class="editorial-eyebrow mb-4">Produtos do ano</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProductCard v-for="p in yearProducts" :key="p.id" :product="p" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMockProducts } from '~/composables/useGearData'

useHead({ title: 'Hall of Fame · GearHub' })

const yearProducts = useMockProducts().slice(0, 4)

// Na ordem de exibição: 2º, 1º e 3º
const podium = [
  { place: 2, name: 'Nayara HZ', slug: 'nayarahz', reviews: 28, avatar: 'https://i.pravatar.cc/56?img=5', height: 'h-16' },
  { place: 1, name: 'Pedro LM', slug: 'pedrolm', reviews: 45, avatar: 'https://i.pravatar.cc/64?img=12', height: 'h-24' },
  { place: 3, name: 'Mariana Eng.', slug: 'marianaeng', reviews: 21, avatar: 'https://i.pravatar.cc/56?img=25', height: 'h-10' },
]

const topSetups = [
  { id: '1', title: 'Setup Minimalista Branco — Foco Total', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', user: { name: 'pedro_lm', avatar: 'https://i.pravatar.cc/32?img=12' }, likes: 892 },
  { id: '2', title: 'RGB Battlestation — Dark Aesthetic', image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80', user: { name: 'gabriel_a', avatar: 'https://i.pravatar.cc/32?img=15' }, likes: 754 },
  { id: '3', title: 'Home Office Produtivo com Dual Monitor', image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80', user: { name: 'mariana_e', avatar: 'https://i.pravatar.cc/32?img=25' }, likes: 611 },
]
</script>
