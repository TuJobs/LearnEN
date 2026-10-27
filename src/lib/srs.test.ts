import { describe, expect, it } from 'vitest'
import { DAY, mastery, newCard, nextInterval, review } from './srs'

const NOW = new Date(2026, 0, 10, 15, 0).getTime()

describe('srs', () => {
  it('grows the interval with each successful review', () => {
    let card = newCard(NOW)
    const intervals: number[] = []
    for (let i = 0; i < 5; i++) {
      card = review(card, 2, NOW)
      intervals.push(card.interval)
    }
    expect(intervals).toEqual([1, 3, 8, 20, 50])
    expect(mastery(card)).toBe('mature')
  })

  it('schedules reviews at the start of the target day', () => {
    const card = review(newCard(NOW), 2, NOW)
    expect(card.due).toBe(new Date(2026, 0, 10).getTime() + DAY)
  })

  it('resets a forgotten card and lowers its ease', () => {
    const learned = review(review(newCard(NOW), 2, NOW), 2, NOW)
    const forgot = review(learned, 0, NOW)
    expect(forgot).toMatchObject({ reps: 0, interval: 0, lapses: 1, due: NOW + 60_000 })
    expect(forgot.ease).toBeCloseTo(2.3)
    expect(mastery(forgot)).toBe('learning')
  })

  it('never lets ease drop below 1.3', () => {
    let card = newCard(NOW)
    for (let i = 0; i < 20; i++) card = review(card, 0, NOW)
    expect(card.ease).toBe(1.3)
  })

  it('orders intervals Hard < Good < Easy', () => {
    const card = { ...newCard(NOW), reps: 3, interval: 10 }
    expect(nextInterval(card, 1)).toBeLessThan(nextInterval(card, 2))
    expect(nextInterval(card, 2)).toBeLessThan(nextInterval(card, 3))
  })
})
