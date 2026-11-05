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

// Sempre refaz o caminho real; o Feed só entra para quem abriu a página direto
export function useGoBack() {
  const router = useRouter()

  return () => {
    if (router.options.history.state.back) router.back()
    else navigateTo('/')
  }
}
