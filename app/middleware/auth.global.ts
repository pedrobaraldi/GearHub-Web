// Todo o site exige conta, como X e Instagram: sem sessão, vai para o login e depois volta para onde ia.
// Só as páginas com definePageMeta({ public: true }) abrem sem login (entrar, recuperar e redefinir senha).
export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.public) return
  const { user } = useAuth()
  if (!user.value) {
    return navigateTo({ path: '/auth', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } })
  }
})
