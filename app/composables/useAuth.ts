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
  // Contorno escolhido para a foto; nulo é automático
  ringStyle: string | null
  twoFactorEnabled: boolean
  // Falso para quem só entra com Google ou Discord
  hasPassword: boolean
}

export interface RegisterInput {
  displayName: string
  username: string
  email: string
  password: string
  passwordConfirmation: string
  turnstileToken: string
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

  // Com verificação em duas etapas, a senha certa não abre a sessão: devolve true e a tela pede o código
  async function login(email: string, password: string, turnstileToken: string) {
    const result = await $fetch<AuthUser | { twoFactorRequired: true }>('/api/v1/auth/login', { method: 'POST', body: { email, password, turnstileToken } })
    if ('twoFactorRequired' in result) return true
    user.value = result
    return false
  }

  async function verifyTwoFactor(code: string) {
    user.value = await $fetch<AuthUser>('/api/v1/auth/2fa/verify', { method: 'POST', body: { code } })
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

  async function loginWithDiscord() {
    const { url } = await $fetch<{ url: string }>('/api/v1/auth/discord/url')
    window.location.href = url
  }

  async function logout() {
    await $fetch('/api/v1/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, refresh, login, verifyTwoFactor, register, logout, updateProfile, uploadAvatar, uploadBanner, removeAvatar, removeBanner, loginWithGoogle, loginWithDiscord }
}
