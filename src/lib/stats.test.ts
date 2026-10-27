import { describe, expect, it } from 'vitest'
import { niceMax } from '../components/charts'
import { DAY, newCard } from './srs'
import { forecast, longestStreak, masteryCounts, recentDays } from './stats'
import type { DayStat } from './store'
import { dayKey } from './text'

const NOW = new Date(2026, 9, 26, 15, 0).getTime()
const day = (xp: number): DayStat => ({ xp, reviews: 0, correct: 0, wrong: 0, learned: 0, games: 0 })

describe('forecast', () => {
  it('buckets cards by due day and folds overdue cards into today', () => {
    const due = (offsetDays: number) => ({ ...newCard(NOW), due: NOW + offsetDays * DAY })
    const counts = forecast([due(-3), due(0), due(1), due(1), due(6), due(30)], 7, NOW)
    expect(counts).toEqual([2, 2, 0, 0, 0, 0, 1])
  })
})

describe('recentDays', () => {
  it('lists the last n days oldest first, ending today', () => {
    const days = { [dayKey(NOW)]: day(10) }
    const points = recentDays(days, 3, NOW)
    expect(points.map((p) => p.key)).toEqual([dayKey(NOW - 2 * DAY), dayKey(NOW - DAY), dayKey(NOW)])
    expect(points[2].stat?.xp).toBe(10)
  })
})

describe('longestStreak', () => {
  it('finds the longest run of consecutive active days, across month boundaries', () => {
    const days = {
      '2026-09-29': day(5),
      '2026-09-30': day(5),
      '2026-10-01': day(5),
      '2026-10-02': day(0),
      '2026-10-05': day(5),
      '2026-10-06': day(5),
    }
    expect(longestStreak(days)).toBe(3)
    expect(longestStreak({})).toBe(0)
  })
})

describe('masteryCounts', () => {
  it('splits words into new, learning, young and mature', () => {
    const cards = [
      { ...newCard(NOW), reps: 0 },
      { ...newCard(NOW), reps: 2, interval: 5 },
      { ...newCard(NOW), reps: 5, interval: 40 },
    ]
    expect(masteryCounts(cards, 10)).toEqual({ new: 7, learning: 1, young: 1, mature: 1 })
  })
})

describe('niceMax', () => {
  it('rounds axis tops to clean numbers without wasting much space', () => {
    expect(niceMax(3)).toBe(4)
    expect(niceMax(6)).toBe(6)
    expect(niceMax(117)).toBe(150)
    expect(niceMax(50)).toBe(50)
    expect(niceMax(1234)).toBe(1500)
  })
})
