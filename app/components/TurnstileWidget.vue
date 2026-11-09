<template>
  <div v-if="siteKey" ref="box" class="min-h-[65px]" />
</template>

<script setup lang="ts">
interface TurnstileApi {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const emit = defineEmits<{ 'update:modelValue': [token: string] }>()
defineProps<{ modelValue?: string }>()

const siteKey = useRuntimeConfig().public.turnstileSiteKey
const colorMode = useColorMode()
const box = ref<HTMLElement | null>(null)
let widgetId: string | undefined

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`)
    const script = existing ?? document.createElement('script')
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('Turnstile indisponível')))
    if (!existing) {
      script.src = SCRIPT_URL
      script.async = true
      document.head.append(script)
    }
  })
}

onMounted(async () => {
  if (!siteKey || !box.value) return
  // Se o script falhar, o envio segue sem token e a API responde com o erro
  await loadScript().catch(() => {})
  if (!window.turnstile || !box.value) return
  widgetId = window.turnstile.render(box.value, {
    'sitekey': siteKey,
    'theme': colorMode.value === 'light' ? 'light' : 'dark',
    'language': 'pt-br',
    // O formato normal exige 300px: em telas de 320px ele vazaria da página
    'size': box.value.clientWidth < 300 ? 'compact' : 'flexible',
    'callback': (token: string) => emit('update:modelValue', token),
    'expired-callback': () => emit('update:modelValue', ''),
    'error-callback': () => emit('update:modelValue', ''),
  })
})

onBeforeUnmount(() => {
  if (widgetId) window.turnstile?.remove(widgetId)
})

// O token só vale uma vez: cada nova tentativa precisa de outro
function reset() {
  emit('update:modelValue', '')
  if (widgetId) window.turnstile?.reset(widgetId)
}

defineExpose({ reset })
</script>
