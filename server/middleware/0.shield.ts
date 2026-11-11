// Primeira barreira do site, antes de qualquer página ou chamada à API:
// 1. descobre o IP real e repassa para a API (sem isso, a API vê todo mundo com o IP deste servidor);
// 2. barra scanners de ataque, robôs abusivos e caminhos de ataque conhecidos, sem gastar renderização;
// 3. limita requisições por IP.
// robots.txt orienta os robôs educados; este arquivo é para os que ignoram o robots.txt.

import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'

// Ferramentas de ataque e robôs que só consomem recursos. Google, Bing e as prévias de link passam
const BLOCKED_AGENTS = [
  // Scanners de vulnerabilidade
  'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'nuclei', 'wpscan', 'acunetix', 'netsparker', 'dirbuster',
  'gobuster', 'feroxbuster', 'ffuf', 'wfuzz', 'httpx', 'jaeles', 'openvas', 'nessus', 'burpcollaborator',
  // Robôs de SEO e de IA agressivos
  'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'petalbot', 'bytespider', 'dataforseobot', 'blexbot',
  'megaindex', 'seekport', 'serpstatbot', 'barkrowler', 'gptbot', 'ccbot', 'claudebot', 'anthropic-ai',
  'perplexitybot', 'amazonbot', 'imagesiftbot', 'omgili', 'diffbot', 'timpibot',
]

// Caminhos que só robôs de ataque procuram: responde 404 na hora
const ATTACK_PATHS = /^\/(wp-admin|wp-login|wp-content|wp-includes|xmlrpc\.php|phpmyadmin|pma|cgi-bin|vendor\/phpunit|\.env|\.git|\.svn|\.aws|\.ssh|\.DS_Store|config\.(php|json|yml)|server-status|actuator|admin\.php|boaform|HNAP1)/i

// Arquivos do próprio site: não contam no limite
const STATIC_PATHS = /^\/(_nuxt|__nuxt|_ipx|icons|badges|ranks|logos|game-icons|favicon|manifest\.webmanifest|robots\.txt)/

// Páginas que podem aparecer no Google; todo o resto do site exige conta
const INDEXABLE = /^\/(auth)?$/

// Marca das requisições que já passaram pela barreira. As chamadas internas que o servidor faz ao montar a
// página (SSR) levam os cabeçalhos da original, com esta marca. Gerada ao subir: ninguém de fora adivinha
export const INTERNAL_HEADER = 'x-gearhub-internal'
const INTERNAL_TOKEN = randomUUID()

const WINDOW_MS = 60_000
const hits = new Map<string, { count: number, resetAt: number }>()
let lastSweep = Date.now()

function clientIp(event: H3Event, trustProxy: boolean) {
  if (trustProxy) {
    // Atrás de Cloudflare ou balanceador: o IP real vem do cabeçalho do proxy confiável
    const cloudflare = getRequestHeader(event, 'cf-connecting-ip')
    const forwarded = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    if (cloudflare || forwarded) return (cloudflare || forwarded)!
  }
  // Sem proxy confiável, cabeçalho enviado pelo visitante não vale: usa o endereço da conexão
  return event.node.req.socket.remoteAddress ?? 'desconhecido'
}

function tooMany(ip: string, limit: number) {
  const now = Date.now()
  // Limpa janelas vencidas de tempos em tempos, para a memória não crescer
  if (now - lastSweep > WINDOW_MS) {
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key)
    lastSweep = now
  }
  const entry = hits.get(ip)
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return 0
  }
  entry.count++
  return entry.count > limit ? Math.ceil((entry.resetAt - now) / 1000) : 0
}

// Resposta curta e direta: sem montar página (o que gastaria processamento e passaria pelo login)
function block(event: H3Event, status: number, message: string) {
  setResponseStatus(event, status)
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  return message
}

export default defineEventHandler((event) => {
  // Chamada interna do próprio servidor ao montar a página: já passou pela barreira na requisição original
  if (getRequestHeader(event, INTERNAL_HEADER) === INTERNAL_TOKEN) return

  const { shield } = useRuntimeConfig(event)
  const path = event.path.split('?')[0] ?? '/'

  if (ATTACK_PATHS.test(path)) {
    return block(event, 404, 'Not Found')
  }

  const agent = (getRequestHeader(event, 'user-agent') ?? '').toLowerCase()
  // Navegador de verdade sempre se identifica; ferramenta de ataque conhecida não entra
  if (!agent || BLOCKED_AGENTS.some(bot => agent.includes(bot))) {
    return block(event, 403, 'Forbidden')
  }

  const ip = clientIp(event, Boolean(shield.trustProxy))
  // A API recebe o IP real (e só este): o que o visitante mandou nesses cabeçalhos é descartado
  event.node.req.headers['x-forwarded-for'] = ip
  delete event.node.req.headers['x-real-ip']
  delete event.node.req.headers.forwarded

  if (!STATIC_PATHS.test(path)) {
    const retryAfter = tooMany(ip, Number(shield.requestsPerMinute) || 600)
    if (retryAfter) {
      setResponseHeader(event, 'Retry-After', retryAfter)
      return block(event, 429, 'Muitas requisições. Aguarde um pouco e tente de novo.')
    }
  }

  event.node.req.headers[INTERNAL_HEADER] = INTERNAL_TOKEN

  // Só a tela de entrada pode ir para buscadores; páginas internas e a API, não
  if (!INDEXABLE.test(path) && path !== '/robots.txt') {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})
