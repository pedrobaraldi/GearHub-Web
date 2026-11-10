<template>
  <!-- Incentivo ao 2FA: some assim que a pessoa ativa -->
  <div v-if="user && !user.twoFactorEnabled" class="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gear-gold/40 bg-gear-gold/10 p-4">
    <img src="/badges/static/protected.svg" alt="" class="w-14 h-14 shrink-0" />
    <div class="min-w-0 flex-1">
      <p class="text-sm font-semibold">Sua conta não está protegida</p>
      <p class="text-xs text-gear-text-secondary mt-0.5 leading-relaxed">
        Ative a verificação em duas etapas: mesmo quem descobrir sua senha não entra. Você ganha a insígnia <strong>Conta protegida</strong> e +25 XP.
      </p>
    </div>
    <NuxtLink :to="{ path: '/configuracoes', hash: '#seguranca' }" class="btn-publish !py-0 min-h-[2.5rem] shrink-0" @click="$emit('open')">
      <AppIcon name="shield" class="w-4 h-4" />
      Ativar agora
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ open: [] }>()

const { user } = useAuth()
</script>
