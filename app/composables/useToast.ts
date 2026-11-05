export interface Toast {
  id: number
  type: 'error' | 'success'
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
    toasts.value = [...toasts.value, { id, type, message }]
    setTimeout(() => dismiss(id), DURATION_MS)
  }

  return {
    toasts,
    dismiss,
    error: (message: string) => show('error', message),
    success: (message: string) => show('success', message),
  }
}
