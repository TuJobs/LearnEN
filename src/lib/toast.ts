import { useSyncExternalStore } from 'react'

export interface Toast {
  id: number
  text: string
}

let toasts: Toast[] = []
let seq = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function toast(text: string) {
  const t = { id: ++seq, text }
  toasts = [...toasts, t]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id)
    emit()
  }, 4000)
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => toasts,
  )
}
