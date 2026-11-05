// Páginas que exigem conta: leva ao login e depois volta para onde a pessoa ia
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  if (!user.value) {
    return navigateTo({ path: '/auth', query: { redirect: to.fullPath } })
  }
})
