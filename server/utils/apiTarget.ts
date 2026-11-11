import type { H3Event } from 'h3'

/**
 * Endereço na API para o pedido, só se continuar dentro de {@code prefix}. Sem isso, "/api/../actuator" ou
 * "/api/%2e%2e/..." chegariam a rotas internas da API que nunca deveriam sair pelo site.
 * O URL resolve os "..", inclusive os codificados, do mesmo jeito que o servidor da API faria.
 */
export function apiTarget(event: H3Event, prefix: '/api/' | '/uploads/'): string {
  const { apiUrl } = useRuntimeConfig(event)
  const url = new URL(event.path, 'http://gearhub.local')
  // %2f e %5c (barra escondida) também ficam de fora: a API recusa, mas aqui nem segue
  if (!url.pathname.startsWith(prefix) || /%2f|%5c/i.test(url.pathname)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
  return `${apiUrl}${url.pathname}${url.search}`
}
