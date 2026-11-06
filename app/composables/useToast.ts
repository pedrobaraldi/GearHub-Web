export interface Toast {
  id: number
  type: 'error' | 'success' | 'warning'
  message: string
}

const DURATION_MS = 6000

let nextId = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  function show(type: Toast['type'], message: string) {
    // A mesma mensagem não se repete empilhada
    if (toasts.value.some(toast => toast.message === message)) return
    const id = ++nextId
    // Depois de um sucesso, os avisos anteriores já não valem
    const kept = type === 'success' ? [] : toasts.value
    toasts.value = [...kept, { id, type, message }]
    setTimeout(() => dismiss(id), DURATION_MS)
  }

  return {
    toasts,
    dismiss,
    error: (message: string) => show('error', message),
    success: (message: string) => show('success', message),
    warning: (message: string) => show('warning', message),
    /** Campo a corrigir é atenção; o que a pessoa não resolve sozinha é erro. */
    failure: (failure: { message: string, fields: Record<string, string> }) =>
      show(Object.keys(failure.fields).length ? 'warning' : 'error', failure.message),
  }
}
