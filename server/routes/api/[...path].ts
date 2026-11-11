// Repassa /api/** para a API Java, depois da barreira do shield (bloqueio de robôs, limite e IP real).
// Repasse por routeRules rodaria antes dos middlewares e pularia essa proteção.
// manual: o retorno do Google e do Discord é um 302 com o cookie de sessão, que precisa chegar ao navegador
export default defineEventHandler((event) => {
  const { apiUrl } = useRuntimeConfig(event)
  // A marca interna do shield fica só neste servidor
  delete event.node.req.headers['x-gearhub-internal']
  return proxyRequest(event, `${apiUrl}${event.path}`, { fetchOptions: { redirect: 'manual' } })
})
