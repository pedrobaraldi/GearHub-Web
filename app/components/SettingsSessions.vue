<template>
  <!-- Aparelhos com a conta aberta: encerrar um ou todos os outros -->
  <div class="glass-card p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold">Aparelhos conectados</h3>
        <p class="text-xs text-gear-muted mt-1">Não reconhece algum? Encerre a sessão e troque a senha.</p>
      </div>
      <button v-if="others > 0" type="button" class="btn-outline !px-3 !py-1.5 text-xs" :disabled="busy" @click="signOutOthers">
        Sair de todos os outros
      </button>
    </div>
    <ul class="mt-4 divide-y divide-gear-border">
      <li v-for="session in sessions" :key="session.id" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
        <span class="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-gear-surface text-gear-muted">
          <AppIcon :name="isPhone(session.device) ? 'smartphone' : 'monitor'" class="w-4 h-4" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="flex items-center gap-2">
            <span class="text-sm font-medium truncate">{{ session.device }}</span>
            <span v-if="session.current" class="shrink-0 rounded-full bg-gear-green/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gear-green">Este aparelho</span>
          </span>
          <span class="block text-[11px] text-gear-muted truncate">{{ [session.ip, `entrou em ${formatDateTime(session.createdAt)}`].filter(Boolean).join(' · ') }}</span>
        </span>
        <button v-if="!session.current" type="button" class="btn-outline !px-3 !py-1.5 text-xs shrink-0" :disabled="busy" @click="signOut(session.id)">Encerrar</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

interface SessionInfo { id: string, device: string, ip: string | null, createdAt: string, current: boolean }

const toast = useToast()
const { data, refresh } = await useFetch<SessionInfo[]>('/api/v1/me/sessions', { key: 'me-sessions' })
const sessions = computed(() => data.value ?? [])
const others = computed(() => sessions.value.filter(session => !session.current).length)
const busy = ref(false)

const isPhone = (device: string) => /iPhone|Android|iPad/.test(device)
const formatDateTime = (value: string) => new Date(value).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

async function run(action: () => Promise<void>, message: string) {
  busy.value = true
  try {
    await action()
    await refresh()
    toast.success(message)
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
  finally {
    busy.value = false
  }
}

const signOut = (id: string) => run(() => $fetch(`/api/v1/me/sessions/${id}`, { method: 'DELETE' }), 'Sessão encerrada.')
const signOutOthers = () => run(() => $fetch('/api/v1/me/sessions/sign-out-others', { method: 'POST' }), 'Sessões dos outros aparelhos encerradas.')
</script>
