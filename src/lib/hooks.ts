import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { NAV, type Route } from '../routes'
import { sfx } from './sfx'

/** Live result of a CSS media query (e.g. the OS dark-mode preference). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (l) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', l)
      return () => mq.removeEventListener('change', l)
    },
    () => window.matchMedia(query).matches,
  )
}

function readRoute(): Route {
  const r = window.location.hash.replace(/^#\/?/, '')
  return NAV.some((n) => n.route === r) ? (r as Route) : 'home'
}

export function useRoute(): [Route, (r: Route) => void] {
  const route = useSyncExternalStore((l) => {
    window.addEventListener('hashchange', l)
    return () => window.removeEventListener('hashchange', l)
  }, readRoute)
  const go = (r: Route) => {
    window.location.hash = `/${r}`
    window.scrollTo(0, 0)
  }
  return [route, go]
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')

/**
 * Global keyboard shortcuts. Keystrokes inside text fields are ignored so typing never
 * triggers an action; Enter/Space are handled by forms there instead.
 */
export function useHotkeys(handler: (e: KeyboardEvent) => void) {
  const ref = useRef(handler)
  useLayoutEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      ref.current(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Scrolls the element into view whenever `trigger` turns truthy, e.g. the feedback after an answer. */
export function useReveal<T extends HTMLElement>(trigger: unknown) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (trigger) ref.current?.scrollIntoView({ block: 'nearest', behavior: motionOK() ? 'smooth' : 'auto' })
  }, [trigger])
  return ref
}

/** Jumps back to the top when a new question starts, so it never opens half-scrolled on a phone. */
export function useScrollTopOn(key: unknown) {
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [key])
}

export interface Score {
  xp: number
  combo: number
  best: number
  misses: number
  /** XP earned by the latest answer (drives the "+N XP" animation) */
  last: number
}

const ZERO: Score = { xp: 0, combo: 0, best: 0, misses: 0, last: 0 }

/** Points for a correct answer: each consecutive hit adds +2 XP, capped at +10. */
export function comboXP(base: number, combo: number): number {
  return base + Math.min(combo - 1, 5) * 2
}

/** Combo-based scoring shared by the mini-games. */
export function useScore() {
  const [score, setScore] = useState(ZERO)
  return {
    score,
    hit(base: number) {
      const combo = score.combo + 1
      const gained = comboXP(base, combo)
      const next = { ...score, xp: score.xp + gained, combo, best: Math.max(score.best, combo), last: gained }
      setScore(next)
      sfx.correct()
      return { gained, next }
    },
    miss() {
      const next = { ...score, combo: 0, misses: score.misses + 1, last: 0 }
      setScore(next)
      sfx.wrong()
      return next
    },
    reset: () => setScore(ZERO),
  }
}
