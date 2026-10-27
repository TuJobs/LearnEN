import { useSyncExternalStore } from 'react'
import type { CardState } from '../types'
import { BADGES, levelOf } from './gamify'
import { newCard, review, type Grade } from './srs'
import { dayKey } from './text'
import { toast } from './toast'

export interface Settings {
  /** XP needed per day to hit the daily goal */
  dailyGoal: number
  newPerSession: number
  /** Speech rate for text-to-speech */
  rate: number
  voiceURI: string
  /** 'system' follows the OS light/dark preference */
  theme: 'dark' | 'light' | 'system'
  /** Sound effects and vibration */
  sound: boolean
  /** The welcome card has been dismissed */
  onboarded: boolean
}

export interface DayStat {
  xp: number
  reviews: number
  correct: number
  wrong: number
  learned: number
  games: number
}

export interface Stats {
  learned: number
  reviews: number
  correct: number
  wrong: number
  games: number
  perfect: number
  bestCombo: number
  bugsFound: number
  spoken: number
}

export interface Progress {
  version: 1
  xp: number
  cards: Record<string, CardState>
  days: Record<string, DayStat>
  stats: Stats
  /** Best score per scenario id */
  scenarios: Record<string, number>
  /** Unlock time per badge id */
  badges: Record<string, number>
  settings: Settings
}

const KEY = 'learnen:progress:v1'
const EMPTY_DAY: DayStat = { xp: 0, reviews: 0, correct: 0, wrong: 0, learned: 0, games: 0 }
const XP_FOR_GRADE: Record<Grade, number> = { 0: 2, 1: 6, 2: 10, 3: 10 }

export function initialProgress(): Progress {
  return {
    version: 1,
    xp: 0,
    cards: {},
    days: {},
    stats: { learned: 0, reviews: 0, correct: 0, wrong: 0, games: 0, perfect: 0, bestCombo: 0, bugsFound: 0, spoken: 0 },
    scenarios: {},
    badges: {},
    settings: { dailyGoal: 50, newPerSession: 5, rate: 0.9, voiceURI: '', theme: 'system', sound: true, onboarded: false },
  }
}

function hydrate(saved: Partial<Progress>): Progress {
  const base = initialProgress()
  return {
    ...base,
    ...saved,
    stats: { ...base.stats, ...saved.stats },
    settings: { ...base.settings, ...saved.settings },
  }
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return hydrate(JSON.parse(raw))
  } catch {
    // Corrupted or unavailable storage: start fresh.
  }
  return initialProgress()
}

let state = load()
const listeners = new Set<() => void>()

function commit(next: Progress) {
  const unlocked = BADGES.filter((b) => !next.badges[b.id] && b.test(next))
  if (unlocked.length) {
    const now = Date.now()
    next = { ...next, badges: { ...next.badges, ...Object.fromEntries(unlocked.map((b) => [b.id, now])) } }
    unlocked.forEach((b) => toast(`${b.icon} Mở khoá huy hiệu: ${b.name}`))
  }

  const before = levelOf(state.xp)
  const after = levelOf(next.xp)
  if (after.index > before.index) toast(`🎉 Lên cấp: ${after.current.icon} ${after.current.title}!`)

  const goal = next.settings.dailyGoal
  const today = dayKey()
  if ((state.days[today]?.xp ?? 0) < goal && (next.days[today]?.xp ?? 0) >= goal) {
    toast('🎯 Hoàn thành mục tiêu hôm nay! Giữ streak nhé 🔥')
  }

  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: progress stays in memory for this session.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getProgress = () => state
export const useProgress = () => useSyncExternalStore(subscribe, getProgress)

function addToday(s: Progress, delta: Partial<DayStat>): Record<string, DayStat> {
  const key = dayKey()
  const d = { ...EMPTY_DAY, ...s.days[key] }
  for (const k of Object.keys(delta) as (keyof DayStat)[]) d[k] += delta[k] ?? 0
  return { ...s.days, [key]: d }
}

/** Applies one answer: XP, accuracy stats and, when given, the word's new SRS state. */
function answered(s: Progress, ok: boolean, xp: number, update?: { id: string; card: CardState; review: boolean }): Progress {
  const isNew = !!update && !s.cards[update.id]
  const reviews = update?.review ? 1 : 0
  const correct = ok ? 1 : 0
  const wrong = ok ? 0 : 1
  return {
    ...s,
    xp: s.xp + xp,
    cards: update ? { ...s.cards, [update.id]: update.card } : s.cards,
    days: addToday(s, { xp, reviews, correct, wrong, learned: isNew ? 1 : 0 }),
    stats: {
      ...s.stats,
      learned: s.stats.learned + (isNew ? 1 : 0),
      reviews: s.stats.reviews + reviews,
      correct: s.stats.correct + correct,
      wrong: s.stats.wrong + wrong,
    },
  }
}

/** A real spaced-repetition review (review screen, or the end of a learning session). */
export function gradeCard(id: string, grade: Grade) {
  const now = Date.now()
  const card = review(state.cards[id] ?? newCard(now), grade, now)
  commit(answered(state, grade > 0, XP_FOR_GRADE[grade], { id, card, review: true }))
}

/**
 * An answer given inside a mini-game. Only studied words are rescheduled: a mistake makes the
 * word due again right away, and a correct answer counts as a review only if the word is already
 * due (otherwise intervals would inflate). Unstudied words just earn XP — they join the review
 * schedule through "Học từ mới", so games never flood the review queue.
 */
export function practice(id: string, ok: boolean, xp = 0) {
  const now = Date.now()
  const prev = state.cards[id]
  if (!prev) return commit(answered(state, ok, xp))
  const card = !ok
    ? { ...prev, due: Math.min(prev.due, now), ease: Math.max(1.3, prev.ease - 0.1) }
    : prev.due <= now
      ? review(prev, 2, now)
      : prev
  commit(answered(state, ok, xp, { id, card, review: false }))
}

export function addXP(xp: number) {
  commit({ ...state, xp: state.xp + xp, days: addToday(state, { xp }) })
}

export function finishGame(perfect: boolean, bestCombo: number) {
  commit({
    ...state,
    days: addToday(state, { games: 1 }),
    stats: {
      ...state.stats,
      games: state.stats.games + 1,
      perfect: state.stats.perfect + (perfect ? 1 : 0),
      bestCombo: Math.max(state.stats.bestCombo, bestCombo),
    },
  })
}

export function bumpStat(key: 'bugsFound' | 'spoken') {
  commit({ ...state, stats: { ...state.stats, [key]: state.stats[key] + 1 } })
}

export function saveScenario(id: string, score: number) {
  commit({ ...state, scenarios: { ...state.scenarios, [id]: Math.max(state.scenarios[id] ?? 0, score) } })
}

export function updateSettings(patch: Partial<Settings>) {
  commit({ ...state, settings: { ...state.settings, ...patch } })
}

export function resetProgress() {
  commit({ ...initialProgress(), settings: state.settings })
}

export const exportProgress = () => JSON.stringify(state, null, 2)

export function importProgress(json: string) {
  const data = JSON.parse(json) as Partial<Progress>
  if (data.version !== 1 || typeof data.xp !== 'number' || typeof data.cards !== 'object') {
    throw new Error('File không đúng định dạng tiến độ LearnEN.')
  }
  commit(hydrate(data))
}
