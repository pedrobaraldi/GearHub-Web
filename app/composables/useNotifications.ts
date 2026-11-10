// Contador do sino: busca ao entrar e a cada minuto, só no navegador e só com sessão
const POLL_MS = 60_000

export interface NotificationItem {
  id: number
  type: 'like' | 'comment' | 'reply' | 'follow' | 'rank_up'
  actor: { username: string, displayName: string, avatarUrl: string | null } | null
  message: string
  snippet: string
  link: string
  createdAt: string
  read: boolean
}

export interface NotificationPage {
  items: NotificationItem[]
  nextCursor: string | null
  unread: number
}

let timer: ReturnType<typeof setInterval> | null = null

export function useNotifications() {
  const unread = useState('notifications-unread', () => 0)
  const { user } = useAuth()

  async function refreshUnread() {
    if (!user.value) {
      unread.value = 0
      return
    }
    try {
      const { unread: count } = await $fetch<{ unread: number }>('/api/v1/me/notifications/unread-count')
      unread.value = count
    }
    catch {
      // Sem conexão: mantém o último número
    }
  }

  async function markAllRead() {
    if (!unread.value) return
    unread.value = 0
    await $fetch('/api/v1/me/notifications/read', { method: 'POST' }).catch(() => {})
  }

  // Liga uma vez só, mesmo com vários componentes usando o contador
  function startPolling() {
    if (import.meta.server || timer) return
    refreshUnread()
    timer = setInterval(refreshUnread, POLL_MS)
    watch(user, refreshUnread)
  }

  return { unread, refreshUnread, markAllRead, startPolling }
}
