import { toApiFailure } from '~/composables/useAuth'

export type ContentKind = 'post' | 'review'

export interface CommentItem {
  id: string
  author: { username: string, displayName: string, avatarUrl: string | null }
  body: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
  mine: boolean
  parentId: string | null
  replyTo: string | null
}

const pathOf = (kind: ContentKind, id: string) => `/api/v1/${kind === 'post' ? 'posts' : 'reviews'}/${id}`

export function useInteractions() {
  const { user } = useAuth()
  const toast = useToast()
  const route = useRoute()
  const rankUp = useRankUp()

  // Sem conta, leva ao login e volta para a mesma tela depois
  function ensureUser() {
    if (user.value) return true
    navigateTo({ path: '/auth', query: { redirect: route.fullPath } })
    return false
  }

  // Devolve null quando falha: quem chamou desfaz a alteração otimista
  async function run<T>(request: () => Promise<T>): Promise<T | null> {
    try {
      return await request()
    }
    catch (error) {
      toast.error(toApiFailure(error).message)
      return null
    }
  }

  const method = (active: boolean) => (active ? 'PUT' : 'DELETE')

  return {
    ensureUser,
    setLike: (kind: ContentKind, id: string, liked: boolean) =>
      run(() => $fetch<{ liked: boolean, likeCount: number }>(`${pathOf(kind, id)}/like`, { method: method(liked) })),
    setSaved: (kind: ContentKind, id: string, saved: boolean) =>
      run(() => $fetch(`${pathOf(kind, id)}/save`, { method: method(saved) })),
    remove: (kind: ContentKind, id: string) =>
      run(() => $fetch(pathOf(kind, id), { method: 'DELETE' }).then(() => true)),
    loadComments: (kind: ContentKind, id: string) =>
      run(() => $fetch<CommentItem[]>(`${pathOf(kind, id)}/comments`)),
    addComment: (kind: ContentKind, id: string, body: string, parentId?: string) =>
      $fetch<{ id: string }>(`${pathOf(kind, id)}/comments`, { method: 'POST', body: { body, parentId } })
        // Comentar dá XP: confere se a pessoa subiu de patente
        .then((created) => { rankUp.check(true); return created }),
    deleteComment: (id: string) =>
      run(() => $fetch(`/api/v1/comments/${id}`, { method: 'DELETE' }).then(() => true)),
    setCommentLike: (id: string, liked: boolean) =>
      run(() => $fetch<{ liked: boolean, likeCount: number }>(`/api/v1/comments/${id}/like`, { method: method(liked) })),
    setFollowing: (username: string, following: boolean) =>
      run(() => $fetch<{ followers: number, following: number, followedByMe: boolean }>(`/api/v1/users/${username}/follow`, { method: method(following) })),
  }
}
