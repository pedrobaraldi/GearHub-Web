// Carrega a sessão na renderização do servidor, para a página já chegar com o usuário certo
export default defineNuxtPlugin(async () => {
  if (import.meta.server) {
    await useAuth().refresh()
  }
})
