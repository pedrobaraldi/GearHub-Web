<template>
  <!-- Conexões no estilo do Discord, em linha: logo da rede num quadradinho, o nome e a seta de link externo -->
  <section v-if="links.length" aria-label="Conexões">
    <h3 class="text-xs font-semibold text-gear-text-secondary mb-2">Conexões</h3>
    <ul class="flex flex-wrap gap-x-4 gap-y-2">
      <li v-for="link in links" :key="link.kind">
        <component
          :is="static ? 'span' : 'a'"
          v-bind="static ? {} : { href: link.href, target: '_blank', rel: 'noopener noreferrer nofollow' }"
          class="group inline-flex items-center gap-1.5 max-w-full rounded-md pr-1 transition-colors"
          :class="{ 'hover:bg-gear-text/5': !static }"
        >
          <span class="w-6 h-6 grid place-items-center rounded-md bg-white shrink-0" :style="{ color: COLORS[link.kind] }">
            <SocialIcon :kind="link.kind" class="w-3.5 h-3.5" />
          </span>
          <span class="text-xs font-semibold truncate">{{ link.label }}</span>
          <svg class="w-3 h-3 shrink-0 text-gear-muted transition-colors" :class="{ 'group-hover:text-gear-text': !static }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
          <span v-if="!static" class="sr-only">(abre em nova aba)</span>
        </component>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { SocialKind, SocialLink } from '~/utils/socialLinks'

// static: na prévia do formulário, sem link de verdade
defineProps<{ links: SocialLink[], static?: boolean }>()

const COLORS: Record<SocialKind, string> = {
  website: '#111827',
  twitter: '#000000',
  instagram: '#E4405F',
  youtube: '#FF0000',
}
</script>
