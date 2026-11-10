/**
 * Coreografia das telas de progressão (subida de rank e desbloqueio do Fundador), feita com GSAP.
 * Adaptado do pacote "Hardware Tier Ranks" (rank-up.js): mesma sequência, como módulo do projeto.
 *
 * Os emblemas entram como SVG direto na página (não <img>), para que cada faceta, anel e símbolo
 * seja animado individualmente. As animações de entrada embutidas no SVG são desligadas ao montar;
 * as de loop (brilho, cores, partículas, flutuação) continuam.
 *
 *   playRankUp(stage, svgAntigo, svgNovo, opções)   → subida de rank
 *       opções: title, subtitle, color, level (0 = tiers 1-3, 1 = tier 4, 2 = tier 5, 3 = tier 6)
 *   playFounderUnlock(stage, svgFundador, opções)   → desbloqueio do Fundador
 *       opções: number (1-100), title
 *
 * As duas devolvem a timeline do GSAP (dá para usar await, .pause() ou .timeScale()).
 * O rótulo "title" marca quando o título entra, para quem chama encaixar o que vem depois.
 * Com prefers-reduced-motion, fazem só uma troca suave.
 */
import gsap from 'gsap'

const C = 128
const R = gsap.utils.random as (min: number, max: number) => number
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

interface Texts { eyebrow?: string, title?: string, subtitle?: string }
export interface RankUpOptions extends Texts { color?: string, level?: number }
export interface FounderOptions { number?: number | null, title?: string }

type El = Element | null

// ---------------------------------------------------------------- utilidades
function clear(stage: HTMLElement) {
  gsap.killTweensOf(stage)
  stage.classList.add('rank-up-stage')
  stage.querySelectorAll('.rank-up-emblem, .rank-up-fx, .rank-up-title, .ru-back').forEach(n => n.remove())
  gsap.set(stage, { clearProps: 'transform' })
}

function mount(stage: HTMLElement, svgString: string, hidden = false) {
  const wrap = document.createElement('div')
  wrap.className = 'rank-up-emblem'
  // Só recebe SVGs do próprio site (public/ranks e public/badges)
  wrap.innerHTML = svgString.trim()
  const svg = wrap.querySelector('svg') as SVGSVGElement
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.style.width = svg.style.height = '100%'
  svg.style.overflow = 'visible'
  if (hidden) wrap.style.visibility = 'hidden'
  stage.appendChild(wrap)
  return { wrap, svg }
}

// Desliga as animações CSS de entrada embutidas no SVG (o GSAP assume a coreografia)
function takeOver(svg: SVGSVGElement) {
  svg.getAnimations({ subtree: true }).forEach((animation) => {
    const end = animation.effect?.getComputedTiming().endTime
    if (end !== Infinity) animation.cancel()
  })
}

function centerOf(el: Element) {
  try {
    const box = (el as SVGGraphicsElement).getBBox()
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }
  catch {
    return { x: C, y: C }
  }
}

// Deslocamento para fora a partir do centro do emblema
function outward(el: Element, dist: number, spread = 0.35) {
  const c = centerOf(el)
  const angle = Math.atan2(c.y - C, c.x - C) + R(-spread, spread)
  const d = dist * R(0.75, 1.2)
  return { x: Math.cos(angle) * d, y: Math.sin(angle) * d }
}

function parts(svg: SVGSVGElement) {
  const gemGroup = svg.querySelector('.rank-gem')
  const direct = gemGroup ? [...gemGroup.querySelectorAll(':scope > polygon')] : []
  return {
    gemGroup,
    facets: direct.filter(p => !p.hasAttribute('transform') && !/table|edge/.test(p.getAttribute('class') || '') && p.getAttribute('fill') !== 'none'),
    table: svg.querySelector('[class$=\'-table\']'),
    edges: gemGroup ? [...gemGroup.querySelectorAll(':scope > polygon[fill=\'none\'], :scope > polygon[transform]')] : [],
    symbol: svg.querySelector('.rank-symbol'),
    plate: svg.querySelector('.rank-plate'),
    ring: svg.querySelector('.rank-ring'),
    ticks: [...svg.querySelectorAll('.rank-tier > polygon')],
    aura: svg.querySelector('[class$=\'-aura-in\']'),
    shards: [...svg.querySelectorAll('[class$=\'-shard\']')],
    shine: svg.querySelector('.rank-shine'),
  }
}

const present = (list: El[]) => list.filter(Boolean) as Element[]

// Camada de efeitos: clarão, ondas, faíscas e raios
function fxLayer(stage: HTMLElement, { sparks = 18, rings = 2, rays = false, rainbow = false }) {
  const fx = document.createElement('div')
  fx.className = 'rank-up-fx'
  fx.innerHTML = '<div class="ru-flash"></div>' + '<div class="ru-ring"></div>'.repeat(rings) + '<div class="ru-sparks"></div>'
  stage.appendChild(fx)
  const box = fx.querySelector('.ru-sparks') as HTMLElement
  for (let i = 0; i < sparks; i++) {
    const spark = document.createElement('i')
    if (rainbow) spark.style.background = `hsl(${(i * 360) / sparks} 90% 65%)`
    box.appendChild(spark)
  }
  let raysEl: HTMLElement | null = null
  if (rays) {
    raysEl = document.createElement('div')
    raysEl.className = 'ru-back ru-rays' + (rainbow ? ' ru-rays--rainbow' : '')
    stage.insertBefore(raysEl, stage.firstChild)
  }
  return {
    fx,
    flash: fx.querySelector('.ru-flash') as HTMLElement,
    rings: [...fx.querySelectorAll('.ru-ring')],
    sparks: [...box.children],
    rays: raysEl,
  }
}

type Fx = ReturnType<typeof fxLayer>

function burstTl(f: Fx, power: number) {
  const tl = gsap.timeline()
  tl.fromTo(f.flash, { opacity: 0, scale: 0.3 }, { opacity: Math.min(1, 0.6 + power * 0.15), scale: 0.9, duration: 0.12, ease: 'power1.out', immediateRender: false })
    .to(f.flash, { opacity: 0, scale: 1.2 + power * 0.25, duration: 0.5 + power * 0.12, ease: 'power2.out' })
  f.rings.forEach((ring, i) => {
    tl.fromTo(ring, { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.3 + power * 0.25 + i * 0.15, duration: 0.8 + i * 0.22, ease: 'power3.out', immediateRender: false }, i * 0.1)
  })
  if (power >= 1) {
    f.sparks.forEach((spark, i) => {
      const angle = (i / f.sparks.length) * Math.PI * 2 + R(-0.15, 0.15)
      const d = R(80, 130 + power * 25)
      tl.fromTo(spark, { opacity: 1, x: 0, y: 0, scale: 1 },
        { opacity: 0, x: Math.cos(angle) * d, y: Math.sin(angle) * d, scale: 0.3, duration: R(0.6, 1 + power * 0.15), ease: 'expo.out', immediateRender: false }, 0)
    })
  }
  return tl
}

function shakeTl(el: Element, power: number) {
  const a = 2 + power * 2
  return gsap.timeline()
    .to(el, { x: -a, y: a / 2, duration: 0.05 }).to(el, { x: a, y: -a / 2, duration: 0.06 })
    .to(el, { x: -a / 2, y: -a / 2, duration: 0.06 }).to(el, { x: a / 2, y: a / 2, duration: 0.06 })
    .to(el, { x: 0, y: 0, duration: 0.12, ease: 'power2.out' })
}

// Título montado com texto puro: o nome do rank vem da API
function titleTl(stage: HTMLElement, texts: Texts, rainbow = false) {
  const title = document.createElement('div')
  title.className = 'rank-up-title' + (rainbow ? ' ru-title--rainbow' : '')
  const line = (className: string, text: string) => {
    const span = document.createElement('span')
    span.className = className
    span.textContent = text
    title.appendChild(span)
  }
  line('ru-eyebrow', texts.eyebrow || 'Rank up')
  line('ru-name', texts.title || '')
  if (texts.subtitle) line('ru-sub', texts.subtitle)
  stage.appendChild(title)
  gsap.set(title.children, { opacity: 0, y: 14 })
  return gsap.timeline().to(title.children, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' })
}

function reducedSwap(stage: HTMLElement, oldSvg: string | null, newSvg: string, texts: Texts, rainbow = false) {
  const tl = gsap.timeline()
  let old: ReturnType<typeof mount> | undefined
  if (oldSvg) {
    old = mount(stage, oldSvg)
    tl.to(old.wrap, { opacity: 0, duration: 0.3 })
  }
  const neu = mount(stage, newSvg)
  gsap.set(neu.wrap, { opacity: 0 })
  tl.to(neu.wrap, { opacity: 1, duration: 0.3 }).add(titleTl(stage, texts, rainbow))
  if (old) tl.add(() => old!.wrap.remove())
  return tl
}

// ---------------------------------------------------------------- blocos de coreografia
function chargeTl(wrap: HTMLElement, dur: number, power: number) {
  const a = 1 + power
  return gsap.timeline()
    .to(wrap, { scale: 1.08, filter: 'brightness(2.1)', duration: dur, ease: 'power2.in' }, 0)
    .to(wrap, { x: a, duration: 0.05, repeat: Math.round(dur / 0.05), yoyo: true, ease: 'none' }, 0)
    .set(wrap, { x: 0 })
}

function shatterTl(svg: SVGSVGElement, strength: number) {
  const p = parts(svg)
  const tl = gsap.timeline()
  const fly = (els: El[], dist: number, dur: number, stagger = 0) => {
    els.forEach((el, i) => {
      if (!el) return
      const d = outward(el, dist)
      tl.to(el, { x: d.x, y: d.y, rotation: R(-220, 220), scale: R(0.4, 0.8), opacity: 0, transformOrigin: '50% 50%', duration: dur, ease: 'power3.out' }, i * stagger)
    })
  }
  fly([...p.facets, p.table], 140 * strength, 0.9, 0.008)
  fly([p.symbol], 40, 0.7)
  fly([p.plate], 60, 0.8)
  tl.to(present([...p.edges, p.ring, ...p.ticks, p.aura, ...p.shards, p.shine]), { opacity: 0, duration: 0.25 }, 0)
  return tl
}

// Montagem do novo emblema; level 0 = simples, 1 a 3 = cada vez mais elaborada
function assembleTl(svg: SVGSVGElement, level: number) {
  const p = parts(svg)
  const tl = gsap.timeline()
  const dist = 140 + level * 30
  if (p.ring) gsap.set(p.ring, { strokeDasharray: 100 })
  gsap.set(present([...p.ticks, ...p.shards, p.aura]), { opacity: 0 })

  if (p.plate) tl.from(p.plate, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.5, ease: 'power3.out' }, 0)
  if (level === 3 && p.gemGroup) tl.from(p.gemGroup, { rotation: -60, scale: 0.8, svgOrigin: '128 128', duration: 1.6, ease: 'power3.out' }, 0.1)
  const span = level >= 2 ? 1.0 : 0.55
  p.facets.forEach((facet, i) => {
    const d = outward(facet, dist)
    tl.from(facet, { x: d.x, y: d.y, rotation: R(-160, 160), scale: 0.5, opacity: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'power3.out' },
      0.12 + (i / Math.max(p.facets.length - 1, 1)) * span)
  })
  if (p.edges.length) tl.from(p.edges, { opacity: 0, duration: 0.3 }, 0.12 + span + 0.3)
  if (p.ring) tl.fromTo(p.ring, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.8 + level * 0.1, ease: 'power2.inOut' }, 0.25)
  const tEnd = 0.12 + span + 0.6
  if (p.table) tl.from(p.table, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%', duration: 0.4, ease: 'power2.out' }, tEnd - 0.25)
  if (p.symbol) tl.from(p.symbol, { opacity: 0, scale: 0, rotation: level === 3 ? -120 : 0, svgOrigin: '128 128', duration: 0.55, ease: 'back.out(2.2)' }, tEnd - 0.1)
  tl.addLabel('impact', tEnd + 0.35)
  if (p.aura) tl.to(p.aura, { opacity: 1, duration: 0.8 }, 'impact')
  if (p.shards.length) tl.fromTo(p.shards, { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(2)' }, 'impact+=.1')
  if (p.ticks.length) tl.fromTo(p.ticks, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.3, ease: 'back.out(2.4)' }, 'impact+=.35')
  return tl
}

// ---------------------------------------------------------------- subida de rank
export function playRankUp(stage: HTMLElement, oldSvg: string, newSvg: string, opts: RankUpOptions = {}) {
  clear(stage)
  const level = Math.max(0, Math.min(3, opts.level || 0))
  stage.style.setProperty('--ru-accent', opts.color || '#ffffff')
  const texts: Texts = { eyebrow: level === 3 ? 'Rank máximo' : 'Rank up', ...opts }
  if (reduced()) return reducedSwap(stage, oldSvg, newSvg, texts)

  const old = mount(stage, oldSvg)
  takeOver(old.svg)
  const op = parts(old.svg) // o emblema atual aparece completo, já montado
  gsap.set(present([...op.ticks, ...op.shards, op.aura]), { opacity: 1 })
  const neu = mount(stage, newSvg, true)
  takeOver(neu.svg)
  const f = fxLayer(stage, { sparks: 18 + level * 8, rings: 2 + (level >= 2 ? 1 : 0), rays: level === 3 })

  const tl = gsap.timeline()
  tl.add(chargeTl(old.wrap, 0.75 + level * 0.15, level))
    .addLabel('shatter')
    .add(burstTl(f, 0), 'shatter')
    .add(shatterTl(old.svg, 1 + level * 0.15), 'shatter')
    .set(old.wrap, { filter: 'brightness(1.4)' }, 'shatter')
  if (level >= 2) tl.add(shakeTl(stage, level - 1), 'shatter')

  const build = assembleTl(neu.svg, level)
  tl.set(neu.wrap, { visibility: 'visible' }, 'shatter+=.5').add(build, 'shatter+=.5')
  const impactAt = build.labels.impact ?? 0
  const impact = `shatter+=${0.5 + impactAt}`
  if (f.rays) {
    tl.fromTo(f.rays, { opacity: 0, scale: 0.6, rotation: 0 }, { opacity: 0.9, scale: 1, rotation: 40, duration: impactAt, ease: 'power2.out' }, 'shatter+=.5')
    tl.to(f.rays, { opacity: 0.55, scale: 1.1, rotation: 400, duration: 9, ease: 'none' }, impact)
  }
  tl.add(burstTl(f, 1 + level), impact)
    .fromTo(neu.wrap, { scale: 1 }, { scale: 1.08 + level * 0.03, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 }, impact)
    .addLabel('title', impact)
    .add(titleTl(stage, texts), impact)
  if (level >= 1) tl.add(shakeTl(stage, level), impact)
  tl.add(() => old.wrap.remove()).add(() => f.fx.remove(), '+=1')
  return tl
}

// ---------------------------------------------------------------- desbloqueio do Fundador
// Feixes arco-íris convergem, um núcleo de luz carrega enquanto as facetas se encaixam,
// o núcleo explode, revela a mesa central e a coroa desce logo em seguida
function beamsSvg(n: number) {
  let lines = ''
  for (let i = 0; i < n; i++) {
    const angle = (-90 + i * (360 / n)) * Math.PI / 180
    const x1 = C + 230 * Math.cos(angle)
    const y1 = C + 230 * Math.sin(angle)
    lines += `<line class="ru-beam" pathLength="100" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${C}" y2="${C}" stroke="hsl(${i * (360 / n)} 90% 65%)"/>`
  }
  return `<svg class="ru-beams" viewBox="0 0 256 256"><g stroke-width="3" stroke-linecap="butt">${lines}</g></svg><div class="ru-core"></div>`
}

export function playFounderUnlock(stage: HTMLElement, founderSvg: string, opts: FounderOptions = {}) {
  clear(stage)
  stage.style.setProperty('--ru-accent', '#c9a8ff')
  const texts: Texts = {
    eyebrow: 'Rank exclusivo desbloqueado',
    title: opts.title || 'Fundador',
    subtitle: opts.number ? `Você é o fundador nº ${opts.number} de 100` : 'Um dos 100 primeiros',
  }
  // A plaquinha do SVG traz "100": troca pelo número da pessoa
  const svgText = opts.number ? founderSvg.replace('>100</text>', `>#${opts.number}</text>`) : founderSvg
  if (reduced()) return reducedSwap(stage, null, svgText, texts, true)

  const emb = mount(stage, svgText, true)
  const svg = emb.svg
  takeOver(svg)
  const $ = (s: string) => svg.querySelector(s)
  const $$ = (s: string) => [...svg.querySelectorAll(s)]
  const facets = $$('.fd-hue')
  const covers = $$('.fd-cover')
  const ring = $('.fd-ring')
  const crown = $('.fd-crown')
  const plaque = $('.fd-plaque')
  const aura = $('.fd-aura-in')
  const shock = $('.fd-shock')
  const body = $('.fd-body')
  const plate = body?.querySelector(':scope > polygon') ?? null
  const table = svg.querySelector('.rank-gem > polygon[fill^=\'url\']')
  const edgeEls = $$('.rank-gem > polygon[fill=\'none\'], .rank-gem > polygon[transform]')
  const glints = $('.rank-gem > g')

  const fx = document.createElement('div')
  fx.className = 'rank-up-fx ru-beams-wrap'
  fx.innerHTML = beamsSvg(10)
  stage.appendChild(fx)
  const beamsSvgEl = fx.querySelector('.ru-beams')
  const beams = [...fx.querySelectorAll('.ru-beam')]
  const core = fx.querySelector('.ru-core')
  const f = fxLayer(stage, { sparks: 40, rings: 3, rays: true, rainbow: true })

  gsap.set(beams, { strokeDasharray: '24 300', strokeDashoffset: 24 })
  gsap.set(core, { xPercent: -50, yPercent: -50, scale: 0, opacity: 1 })
  gsap.set(ring, { strokeDasharray: 100, strokeDashoffset: 100 })
  gsap.set(present([aura, plaque, crown, shock, glints]), { opacity: 0 })
  gsap.set(covers, { fill: '#ffffff', opacity: 0 })

  const tl = gsap.timeline()
  // 1. feixes arco-íris disparam de fora para o centro e somem ao chegar
  tl.to(beams, { strokeDashoffset: -100, duration: 0.7, stagger: { each: 0.07, from: 'random' }, ease: 'power2.in' })
    // 2. o núcleo cresce conforme os feixes entram nele
    .fromTo(core, { scale: 0 }, { scale: 0.85, duration: 0.75, ease: 'power1.in', immediateRender: false }, 0.6)
    .to(core, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
    .set(beamsSvgEl, { opacity: 0 })
    .addLabel('build')
    .set(emb.wrap, { visibility: 'visible' }, 'build')
    // 3. placa gira para o lugar, anel arco-íris se desenha
    .from(plate, { scale: 0.4, rotation: -90, opacity: 0, svgOrigin: '128 128', duration: 0.7, ease: 'power3.out' }, 'build')
    .to(ring, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 'build+=.1')
    .from(edgeEls, { opacity: 0, duration: 0.4 }, 'build+=.9')
    // o núcleo respira enquanto as facetas se encaixam
    .to(core, { scale: 0.82, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 'build')
  // 4. facetas coloridas chegam de longe e travam com um lampejo branco
  facets.forEach((el, i) => {
    const d = outward(el, 190, 0.15)
    const t0 = 0.15 + i * 0.09
    tl.from(el, { x: d.x, y: d.y, rotation: R(-90, 90), scale: 0.3, opacity: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'power3.out' }, `build+=${t0}`)
    if (covers[i]) tl.fromTo(covers[i], { opacity: 0.9 }, { opacity: 0, duration: 0.35, ease: 'power1.out', immediateRender: false }, `build+=${t0 + 0.55}`)
  })
  // 5. carga: o núcleo encolhe e treme... e explode
  tl.addLabel('charge', 'build+=1.55')
    .to(core, { scale: 0.55, duration: 0.2, ease: 'power2.in' }, 'charge')
    .to(core, { x: 1.5, duration: 0.04, repeat: 4, yoyo: true, ease: 'none' }, 'charge')
    .addLabel('pop', 'charge+=.2')
    .to(core, { scale: 4, opacity: 0, x: 0, duration: 0.5, ease: 'power3.out' }, 'pop')
    .add(burstTl(f, 0), 'pop')
    .from(table, { scale: 0.3, opacity: 0, svgOrigin: '128 128', duration: 0.45, ease: 'back.out(2.2)' }, 'pop')
    // 6. a coroa desce logo depois da explosão
    .fromTo(crown, { opacity: 0, y: -110, scale: 1.3, svgOrigin: '128 150' },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.in', immediateRender: false }, 'pop+=.12')
    .addLabel('impact', 'pop+=.62')
    .to(crown, { scaleX: 1.14, scaleY: 0.84, svgOrigin: '128 150', duration: 0.1, ease: 'power1.out' }, 'impact')
    .to(crown, { scaleX: 1, scaleY: 1, svgOrigin: '128 150', duration: 0.7, ease: 'elastic.out(1.1, .4)' }, 'impact+=.1')
    // 7. impacto: clarão, onda arco-íris, raios, faíscas, aura e título
    .add(burstTl(f, 3), 'impact')
    .add(shakeTl(stage, 3), 'impact')
    .fromTo(shock, { opacity: 1, scale: 0.6, svgOrigin: '128 128' }, { opacity: 0, scale: 1.35, duration: 1.1, ease: 'power3.out', immediateRender: false }, 'impact')
    .fromTo(f.rays, { opacity: 0, scale: 0.5, rotation: 0 }, { opacity: 0.95, scale: 1, rotation: 60, duration: 0.8, ease: 'power3.out', immediateRender: false }, 'impact')
    .to(f.rays, { opacity: 0.5, scale: 1.12, rotation: 420, duration: 10, ease: 'none' }, 'impact+=.8')
    .to(present([aura, glints]), { opacity: 1, duration: 0.8 }, 'impact')
    .fromTo(emb.wrap, { scale: 1 }, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, 'impact')
    .fromTo(plaque, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, 'impact+=.35')
    .addLabel('title', 'impact+=.2')
    .add(titleTl(stage, texts, true), 'impact+=.2')
    .add(() => fx.remove(), 'impact+=.1')
    .add(() => f.fx.remove(), 'impact+=2')
  return tl
}
