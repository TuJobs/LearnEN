import { useSyncExternalStore } from 'react'

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
}

let installEvent: InstallPromptEvent | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Registers the offline service worker and remembers the browser's "install app" prompt. */
export function registerPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    installEvent = e as InstallPromptEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    installEvent = null
    emit()
  })
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => void navigator.serviceWorker.register('./sw.js'))
  }
}

export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches

export function useCanInstall(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => installEvent !== null,
  )
}

export async function promptInstall() {
  await installEvent?.prompt()
  installEvent = null
  emit()
}
