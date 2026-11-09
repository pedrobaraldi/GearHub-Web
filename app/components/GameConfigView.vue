<template>
  <!-- Seções em duas colunas no desktop; cada uma com o equipamento usado e os valores -->
  <div class="grid md:grid-cols-2 gap-4">
    <section v-for="section in config.sections" :key="section.key" class="glass-card p-5">
      <h3 class="flex items-center gap-2 font-semibold mb-3">
        <AppIcon :name="SECTION_ICONS[section.key] ?? 'settings'" class="w-[18px] h-[18px] text-gear-accent" />
        {{ section.label }}
      </h3>
      <GameGearRow v-if="gearFor(section.key)" :item="gearFor(section.key)!" class="mb-4" />
      <dl class="grid grid-cols-2 gap-x-4 gap-y-3">
        <div v-for="item in section.items" :key="item.key" class="min-w-0">
          <dt class="text-xs text-gear-muted">{{ item.label }}</dt>
          <dd class="text-sm font-semibold mt-0.5 break-words">{{ item.value }}<span v-if="item.unit" class="font-normal text-gear-muted ml-1">{{ item.unit }}</span></dd>
        </div>
      </dl>
    </section>

    <section v-if="otherGear.length" class="glass-card p-5 md:col-span-2">
      <h3 class="flex items-center gap-2 font-semibold mb-3">
        <AppIcon name="package" class="w-[18px] h-[18px] text-gear-accent" />
        Equipamentos
      </h3>
      <div class="space-y-2">
        <GameGearRow v-for="item in otherGear" :key="item.category" :item="item" />
      </div>
    </section>

    <p v-if="!config.sections.length && !config.gear.length" class="glass-card p-6 text-sm text-gear-muted text-center md:col-span-2">Sem configurações preenchidas.</p>
  </div>
</template>

<script setup lang="ts">
export interface GameGear {
  category: string
  categoryName: string
  productId: string
  slug: string
  name: string
  brand: string
  imageUrl: string | null
  avgScore: number | null
  reviewCount: number
  reviewId: string | null
  reviewTitle: string | null
  reviewAuthor: string | null
}

export interface GameConfig {
  slug: string
  name: string
  genre: string | null
  selectable: boolean
  sections: { key: string, label: string, items: { key: string, label: string, value: string, unit: string | null }[] }[]
  gear: GameGear[]
  settings: Record<string, string>
}

const props = defineProps<{ config: GameConfig }>()

function gearFor(section: string) {
  const category = SECTION_GEAR[section]
  return category ? props.config.gear.find(item => item.category === category) : undefined
}

const otherGear = computed(() => {
  const shown = props.config.sections.map(section => SECTION_GEAR[section.key]).filter(Boolean)
  return props.config.gear.filter(item => !shown.includes(item.category))
})
</script>
