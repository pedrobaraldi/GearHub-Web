<template>
  <AuthPanel title="Esqueceu a senha?" subtitle="Informe seu e-mail e enviaremos um link para criar uma senha nova.">
    <div v-if="confirmation" class="glass-card p-5 text-sm leading-relaxed" role="status">
      <p class="font-semibold mb-1">Confira seu e-mail</p>
      <p class="text-gear-muted">{{ confirmation }} O link vale por 30 minutos.</p>
    </div>

    <form v-else class="space-y-3" novalidate @submit.prevent="submit">
      <FormField id="email" v-model="email" label="E-mail" type="email" autocomplete="email" :error="fields.email" />
      <TurnstileWidget ref="turnstile" v-model="turnstileToken" />
      <button type="submit" class="btn-primary w-full !py-2.5" :disabled="sending" :class="{ 'opacity-60': sending }">
        {{ sending ? 'Enviando...' : 'Enviar link' }}
      </button>
    </form>
  </AuthPanel>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

definePageMeta({ layout: false })
useHead({ title: 'Recuperar senha · GearHub' })

const toast = useToast()

const email = ref('')
const fields = ref<Record<string, string>>({})
const sending = ref(false)
const confirmation = ref('')
const turnstile = ref<{ reset: () => void } | null>(null)
const turnstileToken = ref('')

async function submit() {
  fields.value = {}
  sending.value = true
  try {
    const { detail } = await $fetch<{ detail: string }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value, turnstileToken: turnstileToken.value },
    })
    confirmation.value = detail
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
    turnstile.value?.reset()
  }
  finally {
    sending.value = false
  }
}
</script>
