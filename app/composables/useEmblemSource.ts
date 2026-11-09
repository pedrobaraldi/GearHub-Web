// Fonte do emblema (rank ou insígnia) com os estados de hover e bloqueado.
// O SVG fica dentro de uma <img>, então não dá para reiniciar a animação por CSS:
// no hover a imagem troca para a versão animada com um parâmetro novo, e o navegador
// recria o SVG do zero, tocando a entrada de novo. O arquivo já está em cache.
export function useEmblemSource(
  folder: string,
  slug: () => string,
  options: () => { animated?: boolean, locked?: boolean, noHover?: boolean },
) {
  const replay = ref(0)

  const src = computed(() => {
    const { animated, locked } = options()
    // Bloqueado nunca anima: fica parado e em cinza
    const moving = !locked && (animated || replay.value > 0)
    const path = moving ? `/${folder}/${slug()}.svg` : `/${folder}/static/${slug()}.svg`
    return replay.value > 0 && !locked ? `${path}?r=${replay.value}` : path
  })

  function onEnter() {
    const { locked, noHover } = options()
    if (!locked && !noHover) replay.value = Date.now()
  }

  // Ao sair, os emblemas parados voltam a ficar parados; os animados seguem como estão
  function onLeave() {
    if (!options().animated) replay.value = 0
  }

  const stateClass = computed(() => (options().locked ? 'grayscale opacity-40' : ''))

  return { src, onEnter, onLeave, stateClass }
}
