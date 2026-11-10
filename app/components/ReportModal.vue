<template>
  <!-- Denúncia: motivo e detalhes opcionais. Vai para a moderação, que decide o que fazer -->
  <AppModal :open="open" :title="`Denunciar ${what}`" subtitle="Sua denúncia é anônima para quem foi denunciado." @close="close">
    <form v-if="!sent" class="space-y-4" novalidate @submit.prevent="submit">
      <fieldset>
        <legend class="form-label">Qual é o problema?</legend>
        <div class="space-y-1.5">
          <label
            v-for="option in reasons"
            :key="option.key"
            class="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors"
            :class="reason === option.key ? 'border-gear-accent bg-gear-accent/10' : 'border-gear-border hover:border-gear-text/30'"
          >
            <input v-model="reason" type="radio" name="report-reason" :value="option.key" class="accent-[var(--gear-accent)]" />
            {{ option.label }}
          </label>
        </div>
        <p v-if="fields.reason" class="text-xs text-gear-red mt-1.5">{{ fields.reason }}</p>
      </fieldset>
      <div>
        <label for="report-details" class="form-label">Detalhes (opcional)</label>
        <textarea id="report-details" v-model="details" rows="3" maxlength="500" placeholder="Conte o que aconteceu, se quiser." class="field-input" />
        <p class="text-[11px] text-gear-muted text-right mt-1 tabular-nums">{{ details.length }}/500</p>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-outline" @click="close">Cancelar</button>
        <button type="submit" class="btn-publish !py-0 min-h-[2.5rem]" :disabled="!reason || sending">
          <AppIcon name="flag" class="w-4 h-4" />
          {{ sending ? 'Enviando...' : 'Enviar denúncia' }}
        </button>
      </div>
    </form>

    <div v-else class="text-center py-4">
      <span class="w-12 h-12 mx-auto grid place-items-center rounded-full bg-gear-green/15 text-gear-green"><AppIcon name="check" class="w-6 h-6" /></span>
      <p class="text-sm font-semibold mt-3">Denúncia enviada</p>
      <p class="text-xs text-gear-muted mt-1">Obrigado por ajudar a manter a GearHub segura. A equipe vai analisar.</p>
      <button type="button" class="btn-outline mt-5" @click="close">Fechar</button>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

const props = defineProps<{
  open: boolean
  kind: 'post' | 'review' | 'comment' | 'user'
  id?: string
  username?: string
}>()
const emit = defineEmits<{ close: [] }>()

const WHAT: Record<typeof props.kind, string> = { post: 'post', review: 'review', comment: 'comentário', user: 'perfil' }
const what = computed(() => WHAT[props.kind])

const toast = useToast()
const reasons = ref<{ key: string, label: string }[]>([])
const reason = ref('')
const details = ref('')
const sending = ref(false)
const sent = ref(false)
const fields = ref<Record<string, string>>({})

// Os motivos vêm da API na primeira vez que alguém abre
watch(() => props.open, async (open) => {
  if (!open || reasons.value.length) return
  try {
    reasons.value = await $fetch<{ key: string, label: string }[]>('/api/v1/report-reasons')
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
})

function close() {
  emit('close')
  // Limpa depois da animação de saída
  setTimeout(() => {
    reason.value = ''
    details.value = ''
    sent.value = false
    fields.value = {}
  }, 300)
}

async function submit() {
  fields.value = {}
  sending.value = true
  try {
    await $fetch('/api/v1/reports', {
      method: 'POST',
      body: { kind: props.kind, id: props.id ?? null, username: props.username ?? null, reason: reason.value, details: details.value || null },
    })
    sent.value = true
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    // Já denunciado: avisa e fecha, sem tratar como erro
    if ((error as { statusCode?: number }).statusCode === 409) {
      toast.success(failure.message)
      close()
    }
    else {
      toast.failure(failure)
    }
  }
  finally {
    sending.value = false
  }
}
</script>
