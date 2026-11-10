<template>
  <AuthPanel title="Crie uma senha nova" subtitle="Depois de salvar, todas as sessões abertas serão encerradas.">
    <form class="space-y-3" novalidate @submit.prevent="submit">
      <FormField id="password" v-model="form.password" label="Senha nova" type="password" autocomplete="new-password" :error="fields.password" />
      <PasswordRules :password="form.password" />
      <FormField
        id="passwordConfirmation"
        v-model="form.passwordConfirmation"
        label="Confirmar senha"
        type="password"
        autocomplete="new-password"
        :error="fields.passwordConfirmation || fields.passwordConfirmed"
      />
      <button type="submit" class="btn-primary w-full !py-2.5" :disabled="sending" :class="{ 'opacity-60': sending }">
        {{ sending ? 'Salvando...' : 'Salvar senha' }}
      </button>
    </form>
  </AuthPanel>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

definePageMeta({ layout: false, public: true })
// O token está na URL: não pode vazar para sites externos pelo Referer
useHead({ title: 'Redefinir senha · GearHub', meta: [{ name: 'referrer', content: 'no-referrer' }] })

const route = useRoute()
const toast = useToast()
const { refresh } = useAuth()

const form = reactive({ password: '', passwordConfirmation: '' })
const fields = ref<Record<string, string>>({})
const sending = ref(false)

async function submit() {
  fields.value = {}
  sending.value = true
  try {
    await $fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      body: { ...form, token: typeof route.query.token === 'string' ? route.query.token : '' },
    })
    await refresh()
    toast.success('Senha alterada. Entre com a senha nova.')
    await navigateTo('/auth')
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
  }
  finally {
    sending.value = false
  }
}
</script>
