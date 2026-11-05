<template>
  <div class="fixed z-[70] top-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-96 space-y-2 pointer-events-none" aria-live="assertive">
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
        class="glass-card pointer-events-auto flex items-start gap-3 p-4 border-l-4"
        :class="toast.type === 'error' ? '!border-l-gear-red' : '!border-l-gear-green'"
      >
        <p class="flex-1 min-w-0 text-sm font-medium">{{ toast.message }}</p>
        <button
          type="button"
          aria-label="Fechar aviso"
          class="shrink-0 text-gear-muted hover:text-gear-text transition-colors"
          @click="dismiss(toast.id)"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>
