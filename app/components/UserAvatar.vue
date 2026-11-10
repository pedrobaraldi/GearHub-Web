<template>
  <div class="flex items-start gap-3">
    <NuxtLink
      :to="profilePath(user)"
      class="relative rounded-full p-0.5 w-11 h-11 shrink-0"
      :class="{ 'founder-ring': ring.founder }"
      :style="ring.founder ? undefined : { background: ring.color }"
      :title="rank.label"
      :aria-label="`Perfil de ${user.name}`"
    >
      <UserPhoto :src="user.avatar" :name="user.name" class="w-10 h-10" />
    </NuxtLink>

    <div class="min-w-0 flex-1 text-sm leading-snug">
      <div class="flex items-center gap-2 flex-wrap">
        <NuxtLink :to="profilePath(user)" class="font-semibold hover:underline underline-offset-2">{{ user.name }}</NuxtLink>
        <RankBadge :user="user" />
      </div>
      <p class="text-[11px] text-gear-muted mt-0.5">{{ meta }}</p>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/composables/useGearData'
import { profilePath, ringAppearance, userRank } from '~/composables/useGearData'

const props = defineProps<{ user: User, meta: string }>()
const rank = computed(() => userRank(props.user))
// Mesmo contorno do perfil: a escolha da pessoa ou o automático (RGB para fundador)
const ring = computed(() => ringAppearance(props.user.ringStyle, rank.value.label, !!props.user.founder))
</script>
