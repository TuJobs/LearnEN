import type { CardState } from '../types'
import { DAY, mastery, type Mastery } from './srs'
import type { DayStat } from './store'
import { dayKey } from './text'

const noonOf = (t: number) => {
  const d = new Date(t)
  d.setHours(12, 0, 0, 0)
  return d.getTime()
}

/** Cards coming due on each of the next `n` days (today first); overdue cards count toward today. */
export function forecast(cards: CardState[], n: number, now: number = Date.now()): number[] {
  const keys = Array.from({ length: n }, (_, i) => dayKey(noonOf(now) + i * DAY))
  const index = new Map(keys.map((k, i) => [k, i]))
  const counts = new Array<number>(n).fill(0)
  for (const c of cards) {
    const key = dayKey(c.due)
    const i = key < keys[0] ? 0 : index.get(key)
    if (i !== undefined) counts[i]++
  }
  return counts
}

export interface DayPoint {
  key: string
  date: Date
  stat?: DayStat
}

/** The last `n` days, oldest first. */
export function recentDays(days: Record<string, DayStat>, n: number, now: number = Date.now()): DayPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(noonOf(now) - (n - 1 - i) * DAY)
    const key = dayKey(date.getTime())
    return { key, date, stat: days[key] }
  })
}

export function longestStreak(days: Record<string, DayStat>): number {
  const active = Object.keys(days)
    .filter((k) => days[k].xp > 0)
    .sort()
  let best = 0
  let run = 0
  let prev = ''
  for (const key of active) {
    const [y, m, d] = prev.split('-').map(Number)
    const followsPrev = prev !== '' && dayKey(new Date(y, m - 1, d + 1, 12).getTime()) === key
    run = followsPrev ? run + 1 : 1
    best = Math.max(best, run)
    prev = key
  }
  return best
}

export function masteryCounts(cards: CardState[], totalWords: number): Record<Mastery, number> {
  const counts: Record<Mastery, number> = { new: Math.max(0, totalWords - cards.length), learning: 0, young: 0, mature: 0 }
  for (const c of cards) counts[mastery(c)]++
  return counts
}
