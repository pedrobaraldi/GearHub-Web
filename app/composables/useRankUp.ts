export interface RankUp {
  id: number
  // rank: subiu de patente; founder: desbloqueou o Fundador (100 primeiros)
  kind: 'rank' | 'founder'
  fromRank: string | null
  toRank: string
  level: number
  founderNumber: number | null
}

// Intervalo mínimo entre consultas automáticas (troca de página, voltar para a aba)
const MIN_INTERVAL_MS = 15_000

/**
 * Subida de rank pendente. A API guarda cada subida até a pessoa ver a animação,
 * então ela aparece uma única vez, mesmo que a subida tenha acontecido com a pessoa fora do site.
 */
export function useRankUp() {
  const { user } = useAuth()
  const pending = useState<RankUp | null>('rank-up', () => null)
  const lastCheck = useState('rank-up-last-check', () => 0)

  // force: logo depois de uma ação que dá XP (post, review, comentário)
  async function check(force = false) {
    if (!user.value || pending.value) return
    if (!force && Date.now() - lastCheck.value < MIN_INTERVAL_MS) return
    lastCheck.value = Date.now()
    try {
      // 204 quando não há subida: o $fetch devolve vazio
      const found = await $fetch<RankUp | ''>('/api/v1/me/rank-up')
      if (found) pending.value = found
    }
    catch {
      // Sem resposta, tenta de novo na próxima oportunidade; não atrapalha a tela
    }
  }

  async function dismiss() {
    const current = pending.value
    pending.value = null
    if (!current) return
    try {
      await $fetch(`/api/v1/me/rank-up/${current.id}/seen`, { method: 'POST' })
    }
    catch {
      // Se não marcar agora, a animação volta na próxima visita: melhor do que perder a subida
    }
  }

  return { pending, check, dismiss }
}
