<template>
  <!-- Seus dados: baixar uma cópia e apagar a conta (LGPD, art. 18) -->
  <div class="space-y-4">
    <div class="glass-card p-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold">Baixar meus dados</h3>
        <p class="text-xs text-gear-muted mt-1">Perfil, setup, jogos, posts, reviews, comentários, seguidores e insígnias, num arquivo JSON.</p>
      </div>
      <button type="button" class="btn-outline !px-3 !py-1.5 text-xs" :disabled="downloading" @click="download">
        <AppIcon name="download" class="w-4 h-4" />
        {{ downloading ? 'Preparando...' : 'Baixar' }}
      </button>
    </div>

    <div class="glass-card p-5 border-gear-red/30">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="max-w-md">
          <h3 class="text-sm font-semibold text-gear-red">Apagar conta</h3>
          <p class="text-xs text-gear-muted mt-1 leading-relaxed">
            Sua conta e o que você publicou somem do site na hora. Depois de 30 dias a conta fica encerrada em definitivo.
            Mudou de ideia? É só entrar de novo dentro desse prazo.
          </p>
        </div>
        <button v-if="!confirming" type="button" class="btn-outline !px-3 !py-1.5 text-xs !text-gear-red !border-gear-red/50" @click="confirming = true">Apagar conta</button>
      </div>
      <form v-if="confirming" class="mt-4 space-y-3" novalidate @submit.prevent="remove">
        <FormField id="delete-confirmation" v-model="form.confirmation" :label="`Digite ${user?.username} para confirmar`" autocomplete="off" :error="fields.confirmation" />
        <FormField v-if="user?.hasPassword" id="delete-password" v-model="form.password" label="Sua senha" type="password" autocomplete="current-password" :error="fields.password" />
        <FormField v-if="user?.twoFactorEnabled" id="delete-code" v-model="form.code" label="Código do app" autocomplete="one-time-code" :error="fields.code" />
        <div class="flex gap-2">
          <button type="submit" class="btn-outline !text-gear-red !border-gear-red/60" :disabled="busy || form.confirmation.trim() !== user?.username">
            {{ busy ? 'Apagando...' : 'Apagar minha conta' }}
          </button>
          <button type="button" class="btn-outline" @click="cancel">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

const { user } = useAuth()
const toast = useToast()

const downloading = ref(false)
const confirming = ref(false)
const busy = ref(false)
const fields = ref<Record<string, string>>({})
const form = reactive({ confirmation: '', password: '', code: '' })

async function download() {
  downloading.value = true
  try {
    const data = await $fetch<unknown>('/api/v1/me/export')
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'gearhub-meus-dados.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
  finally {
    downloading.value = false
  }
}

function cancel() {
  confirming.value = false
  fields.value = {}
  Object.assign(form, { confirmation: '', password: '', code: '' })
}

async function remove() {
  fields.value = {}
  busy.value = true
  try {
    await $fetch('/api/v1/me/account/delete', {
      method: 'POST',
      body: { confirmation: form.confirmation, password: form.password || null, code: form.code || null },
    })
    // A API já encerrou a sessão: sai do site e avisa como desfazer
    user.value = null
    toast.success('Conta apagada. Se mudar de ideia, entre de novo em até 30 dias.')
    await navigateTo('/auth', { replace: true })
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
  }
  finally {
    busy.value = false
  }
}
</script>
