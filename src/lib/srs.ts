import type { CardState } from '../types'

/**
 * Spaced repetition scheduler — a simplified SM-2 (the algorithm behind Anki).
 * Each successful recall pushes the next review further out (1d → 3d → ~8d → ~20d...),
 * catching each word right before you would forget it.
 */

export const DAY = 24 * 60 * 60 * 1000
const MINUTE = 60 * 1000
const MIN_EASE = 1.3
/** Like Anki, a "day" of reviews starts at 4 AM, so a late-night review isn't due again at midnight. */
const DAY_STARTS_AT_HOUR = 4
/** Learning steps (in days) for new or just-forgotten cards: Again → 1 minute, Hard → 10 minutes. */
const AGAIN_STEP = 1 / 1440
const HARD_STEP = 10 / 1440

/** 0 = Again (forgot), 1 = Hard, 2 = Good, 3 = Easy */
export type Grade = 0 | 1 | 2 | 3

export function newCard(now: number): CardState {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: 0 }
}

/** Start of the review day containing `t` (4 AM local time). */
function startOfReviewDay(t: number): number {
  const d = new Date(t - DAY_STARTS_AT_HOUR * 60 * MINUTE)
  d.setHours(DAY_STARTS_AT_HOUR, 0, 0, 0)
  return d.getTime()
}

/**
 * Days until the next review if the card is answered with `grade` (fractions are minutes).
 * Hard < Good < Easy always differ, so every button means something.
 */
export function nextInterval(card: CardState, grade: Grade): number {
  if (grade === 0) return AGAIN_STEP
  if (card.reps === 0) return [AGAIN_STEP, HARD_STEP, 1, 4][grade]
  const base = Math.max(card.interval, 1)
  const hard = Math.max(base + 1, Math.round(base * 1.2))
  if (grade === 1) return hard
  const good = Math.max(hard + 1, Math.round(base * card.ease))
  if (grade === 2) return good
  return Math.max(good + 1, Math.round(base * card.ease * 1.3))
}

export function review(card: CardState, grade: Grade, now: number): CardState {
  if (grade === 0) {
    return {
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      interval: 0,
      reps: 0,
      lapses: card.lapses + 1,
      due: now + MINUTE,
      last: now,
    }
  }
  const interval = nextInterval(card, grade)
  // Hard on a card still being learned: repeat it in a few minutes, it hasn't graduated yet.
  if (interval < 1) return { ...card, due: now + interval * DAY, last: now }
  const ease =
    grade === 1 ? Math.max(MIN_EASE, card.ease - 0.15) : grade === 3 ? card.ease + 0.15 : card.ease
  return {
    ease,
    interval,
    reps: card.reps + 1,
    lapses: card.lapses,
    due: startOfReviewDay(now) + interval * DAY,
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

/** When a review comes due, in words: "sau 8 phút", "ngày mai lúc 04:00"… */
export function formatDue(due: number, now: number): string {
  const minutes = Math.ceil((due - now) / MINUTE)
  if (minutes <= 0) return 'ngay bây giờ'
  if (minutes < 60) return `sau ${minutes} phút`
  const at = new Date(due)
  const hm = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const days = Math.floor((due - today.getTime()) / DAY)
  if (days === 0) return `hôm nay lúc ${hm}`
  if (days === 1) return `ngày mai lúc ${hm}`
  return `${at.getDate()}/${at.getMonth() + 1} lúc ${hm}`
}

export function formatInterval(days: number): string {
  if (days < 1) return `${Math.max(1, Math.round(days * 1440))} phút`
  if (days < 30) return `${days} ngày`
  if (days < 365) return `${Math.round(days / 30)} tháng`
  return `${(days / 365).toFixed(1)} năm`
}
