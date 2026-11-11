// Fotos enviadas pelas pessoas: vêm da API (que exige login), passando pela barreira do shield
export default defineEventHandler((event) => {
  const target = apiTarget(event, '/uploads/')
  // A marca interna do shield fica só neste servidor
  delete event.node.req.headers['x-gearhub-internal']
  return proxyRequest(event, target)
})
