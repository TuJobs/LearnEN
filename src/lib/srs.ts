import type { CardState } from '../types'

/**
 * Spaced repetition scheduler — a simplified SM-2 (the algorithm behind Anki).
 * Each successful recall pushes the next review further out (1d → 3d → ~8d → ~20d...),
 * catching each word right before you would forget it.
 */

export const DAY = 24 * 60 * 60 * 1000
const MIN_EASE = 1.3

/** 0 = Again (forgot), 1 = Hard, 2 = Good, 3 = Easy */
export type Grade = 0 | 1 | 2 | 3

export function newCard(now: number): CardState {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: 0 }
}

function startOfDay(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Days until the next review if the card is answered with `grade`. */
export function nextInterval(card: CardState, grade: Grade): number {
  if (grade === 0) return 0
  if (card.reps === 0) return [0, 1, 1, 4][grade]
  if (card.reps === 1) return [0, 2, 3, 6][grade]
  const base = Math.max(card.interval, 1)
  const factor = grade === 1 ? 1.2 : grade === 2 ? card.ease : card.ease * 1.3
  return Math.max(base + 1, Math.round(base * factor))
}

export function review(card: CardState, grade: Grade, now: number): CardState {
  if (grade === 0) {
    return {
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      interval: 0,
      reps: 0,
      lapses: card.lapses + 1,
      due: now + 60_000,
      last: now,
    }
  }
  const interval = nextInterval(card, grade)
  const ease =
    grade === 1 ? Math.max(MIN_EASE, card.ease - 0.15) : grade === 3 ? card.ease + 0.15 : card.ease
  return {
    ease,
    interval,
    reps: card.reps + 1,
    lapses: card.lapses,
    due: startOfDay(now) + interval * DAY,
    last: now,
  }
}

export type Mastery = 'new' | 'learning' | 'young' | 'mature'

export function mastery(card: CardState | undefined): Mastery {
  if (!card) return 'new'
  if (card.reps === 0) return 'learning'
  return card.interval >= 21 ? 'mature' : 'young'
}

export const MASTERY_LABEL: Record<Mastery, string> = {
  new: 'Chưa học',
  learning: 'Đang học',
  young: 'Đã nhớ',
  mature: 'Thành thạo',
}

export function formatInterval(days: number): string {
  if (days <= 0) return '<1 phút'
  if (days < 30) return `${days} ngày`
  if (days < 365) return `${Math.round(days / 30)} tháng`
  return `${(days / 365).toFixed(1)} năm`
}
