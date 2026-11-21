import { describe, expect, it } from 'vitest'
import { formatDue, formatInterval, mastery, newCard, nextInterval, review } from './srs'

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

  it('makes a card due from 4 AM of the target day, not at midnight', () => {
    const card = review(newCard(NOW), 2, NOW)
    expect(card.due).toBe(new Date(2026, 0, 11, 4).getTime())
    // Reviewing at 23:30 must not bring the card back 30 minutes later.
    const late = new Date(2026, 0, 10, 23, 30).getTime()
    expect(review(newCard(late), 2, late).due).toBe(new Date(2026, 0, 11, 4).getTime())
  })

  it('keeps a new card in learning for 10 minutes on Hard', () => {
    const card = review(newCard(NOW), 1, NOW)
    expect(card).toMatchObject({ reps: 0, due: NOW + 10 * 60_000 })
    expect(mastery(card)).toBe('learning')
    expect(formatInterval(nextInterval(newCard(NOW), 1))).toBe('10 phút')
  })

  it('gives Hard, Good and Easy different intervals at every stage', () => {
    const stages = [newCard(NOW), { ...newCard(NOW), reps: 1, interval: 1 }, { ...newCard(NOW), reps: 2, interval: 1, ease: 2.3 }, { ...newCard(NOW), reps: 4, interval: 12, ease: 1.3 }]
    for (const card of stages) {
      const [hard, good, easy] = ([1, 2, 3] as const).map((g) => nextInterval(card, g))
      expect(hard).toBeLessThan(good)
      expect(good).toBeLessThan(easy)
    }
  })

  it('resets a forgotten card and lowers its ease', () => {
    const learned = review(review(newCard(NOW), 2, NOW), 2, NOW)
    const forgot = review(learned, 0, NOW)
    expect(forgot).toMatchObject({ reps: 0, interval: 0, lapses: 1, due: NOW + 60_000 })
    expect(forgot.ease).toBeCloseTo(2.3)
    expect(mastery(forgot)).toBe('learning')
  })

  it('does not count a miss while still learning as a lapse', () => {
    const missed = review(newCard(NOW), 0, NOW)
    expect(missed.lapses).toBe(0)
    expect(review(missed, 0, NOW).lapses).toBe(0)
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

describe('formatInterval', () => {
  it('keeps Nhớ and Dễ apart even for long intervals', () => {
    expect(formatInterval(8)).toBe('8 ngày')
    expect(formatInterval(50)).toBe('50 ngày')
    expect(formatInterval(65)).toBe('65 ngày')
    expect(formatInterval(100)).toBe('3,3 tháng')
    expect(formatInterval(120)).toBe('4 tháng')
    expect(formatInterval(438)).toBe('1,2 năm')
  })
})

describe('formatDue', () => {
  it('says when the next review is, in plain words', () => {
    expect(formatDue(NOW + 8 * 60_000, NOW)).toBe('sau 8 phút')
    expect(formatDue(NOW - 1, NOW)).toBe('ngay bây giờ')
    expect(formatDue(new Date(2026, 0, 10, 20, 5).getTime(), NOW)).toBe('hôm nay lúc 20:05')
    expect(formatDue(new Date(2026, 0, 11, 4).getTime(), NOW)).toBe('ngày mai')
    expect(formatDue(new Date(2026, 0, 14, 4).getTime(), NOW)).toBe('sau 4 ngày (T4, 14/1)')
    expect(formatDue(new Date(2026, 0, 11, 9, 30).getTime(), NOW)).toBe('ngày mai lúc 09:30')
  })
})
