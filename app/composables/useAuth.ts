export interface AuthUser {
  username: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  website: string | null
  twitter: string | null
  instagram: string | null
  youtube: string | null
  email: string
  emailVerified: boolean
  role: 'user' | 'admin'
  rankName: string
  level: number
  pro: boolean
  createdAt: string
}

export interface RegisterInput {
  displayName: string
  username: string
  email: string
  password: string
  passwordConfirmation: string
}

export interface ApiFailure {
  message: string
  fields: Record<string, string>
}

// Único texto do frontend: sem conexão, não existe resposta do backend para mostrar
const OFFLINE_MESSAGE = 'Não foi possível falar com o servidor. Tente novamente em instantes.'

// Traduz o erro da API (ProblemDetail) para o que o formulário mostra
export function toApiFailure(error: unknown): ApiFailure {
  const { data } = error as { data?: { detail?: string, errors?: Record<string, string> } }
  return { message: data?.detail ?? OFFLINE_MESSAGE, fields: data?.errors ?? {} }
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const requestFetch = useRequestFetch()

  // No servidor, repassa o cookie do navegador. Sem sessão ou sem API, segue deslogado.
  async function refresh() {
    try {
      user.value = await requestFetch<AuthUser>('/api/v1/auth/me', { timeout: 3000 })
    }
    catch {
      user.value = null
    }
  }

  async function login(email: string, password: string) {
    user.value = await $fetch<AuthUser>('/api/v1/auth/login', { method: 'POST', body: { email, password } })
  }

  async function register(input: RegisterInput) {
    user.value = await $fetch<AuthUser>('/api/v1/auth/register', { method: 'POST', body: input })
  }

  async function updateProfile(input: Partial<AuthUser>) {
    user.value = await $fetch<AuthUser>('/api/v1/users/me', { method: 'PATCH', body: input })
  }

  async function uploadAvatar(file: File) {
    const body = new FormData()
    body.append('file', file)
    user.value = await $fetch<AuthUser>('/api/v1/users/me/avatar', { method: 'POST', body })
  }

  async function uploadBanner(file: File) {
    const body = new FormData()
    body.append('file', file)
    user.value = await $fetch<AuthUser>('/api/v1/users/me/banner', { method: 'POST', body })
  }

  async function removeAvatar() {
    user.value = await $fetch<AuthUser>('/api/v1/users/me/avatar', { method: 'DELETE' })
  }

  async function removeBanner() {
    user.value = await $fetch<AuthUser>('/api/v1/users/me/banner', { method: 'DELETE' })
  }

  async function loginWithGoogle() {
    const { url } = await $fetch<{ url: string }>('/api/v1/auth/google/url')
    window.location.href = url
  }

  async function logout() {
    await $fetch('/api/v1/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, refresh, login, register, logout, updateProfile, uploadAvatar, uploadBanner, removeAvatar, removeBanner, loginWithGoogle }
}
