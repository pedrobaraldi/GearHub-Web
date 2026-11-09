<template>
  <div class="fixed z-[70] top-[calc(0.75rem+env(safe-area-inset-top))] sm:top-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-96 space-y-2 pointer-events-none" aria-live="assertive">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        role="alert"
        class="pointer-events-auto flex items-center gap-3 p-3 rounded-2xl border border-gear-border bg-gear-sidebar shadow-lg shadow-black/20"
      >
        <span class="w-8 h-8 grid place-items-center rounded-full shrink-0" :class="STYLES[toast.type].badge">
          <AppIcon :name="STYLES[toast.type].icon" class="w-4 h-4" />
        </span>
        <p class="flex-1 min-w-0 text-sm font-medium leading-snug">
          <span class="sr-only">{{ STYLES[toast.type].label }}: </span>{{ toast.message }}
        </p>
        <button
          type="button"
          aria-label="Fechar aviso"
          class="shrink-0 w-8 h-8 -my-1 grid place-items-center rounded-full text-gear-muted hover:text-gear-text transition-colors"
          @click="dismiss(toast.id)"
        >
          <AppIcon name="x" class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Toast } from '~/composables/useToast'

const STYLES: Record<Toast['type'], { icon: string, badge: string, label: string }> = {
  success: { icon: 'check', badge: 'bg-gear-green/15 text-gear-green', label: 'Sucesso' },
  error: { icon: 'x', badge: 'bg-gear-red/15 text-gear-red', label: 'Erro' },
  warning: { icon: 'alert', badge: 'bg-gear-gold/15 text-gear-gold', label: 'Atenção' },
}

const { toasts, dismiss } = useToast()
</script>
