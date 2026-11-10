// Abre a escolha entre Review e Post de qualquer tela
export function useNewPost() {
  const { user } = useAuth()
  const isOpen = useState('new-post-open', () => false)

  function start() {
    if (user.value) isOpen.value = true
    else navigateTo({ path: '/auth', query: { redirect: '/new' } })
  }

  return { isOpen, start }
}

// Telas de formulário: depois de sair delas, o Voltar não deve levar de novo para lá
const FORM_ROUTES = [/^\/new/, /^\/edit\//, /^\/setup$/, /^\/account$/, /^\/games\/config\/[^/]+$/, /^\/auth/, /^\/recuperar-senha/, /^\/redefinir-senha/]

// Página "mãe" de cada tela, usada quando não há histórico útil (link aberto direto, ou veio de um formulário)
function parentOf(path: string, username?: string): string {
  const levels = path.match(/^\/niveis\/([^/]+)/)
  if (levels) return `/profile/${levels[1]}`
  if (/^\/games\/config\/.+/.test(path)) return '/games/config'
  if (/^\/games\/.+/.test(path)) return '/games'
  if (/^\/product\/.+/.test(path)) return '/explore'
  if ((/^\/(setup|account)$/.test(path) || path === '/games/config') && username) return `/profile/${username}`
  return '/'
}

/**
 * Voltar: refaz o caminho real quando a página anterior é do site e não é um formulário;
 * senão, vai para a página-mãe da tela atual.
 */
export function useGoBack(fallback?: string) {
  const router = useRouter()
  const route = useRoute()
  const { user } = useAuth()

  return () => {
    const back = router.options.history.state.back
    const backPath = typeof back === 'string' ? back.split('?')[0]! : null
    if (backPath && !FORM_ROUTES.some(pattern => pattern.test(backPath))) {
      router.back()
      return
    }
    navigateTo(fallback ?? parentOf(route.path, user.value?.username))
  }
}
