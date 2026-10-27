import { describe, expect, it } from 'vitest'
import { dailyPlan, levelOf, streak } from './gamify'
import { pickWords } from './pick'
import { pickVoice } from './speech'
import { DAY, newCard } from './srs'
import { getProgress, gradeCard, initialProgress, practice, type DayStat } from './store'
import { dayKey } from './text'

const NOW = new Date(2026, 9, 26, 10, 0).getTime()
const day = (patch: Partial<DayStat>): DayStat => ({ xp: 0, reviews: 0, correct: 0, wrong: 0, learned: 0, games: 0, ...patch })

describe('pickVoice', () => {
  const v = (name: string, lang = 'en-US') => ({ name, lang, voiceURI: name })

  it('skips macOS joke voices and prefers natural ones', () => {
    expect(pickVoice([v('Albert'), v('Bubbles'), v('Fred'), v('Samantha')])?.name).toBe('Samantha')
    expect(pickVoice([v('Daniel', 'en-GB'), v('Google US English')])?.name).toBe('Google US English')
  })

  it('keeps the saved voice while it is still installed', () => {
    expect(pickVoice([v('Samantha'), v('Daniel', 'en-GB')], 'Daniel')?.name).toBe('Daniel')
    expect(pickVoice([v('Samantha')], 'Daniel')?.name).toBe('Samantha')
  })

  it('never returns a non-English voice', () => {
    expect(pickVoice([v('Thomas', 'fr-FR'), v('Zarvox')])).toBeUndefined()
  })
})

describe('dailyPlan', () => {
  it('walks a new learner through learn → game when nothing is due', () => {
    const steps = dailyPlan(initialProgress(), 0, NOW)
    expect(steps.map((s) => s.done)).toEqual([true, false, false])
    expect(['cloze', 'bugs', 'match', 'dictation', 'scenario']).toContain(steps[2].route)
  })

  it('asks to clear due reviews first and is complete once every step is done', () => {
    const p = initialProgress()
    expect(dailyPlan(p, 3, NOW)[0]).toMatchObject({ done: false, detail: 'còn 3 thẻ' })
    p.days[dayKey(NOW)] = day({ learned: 5, games: 1 })
    expect(dailyPlan(p, 0, NOW).every((s) => s.done)).toBe(true)
  })

  it('rotates the game of the day', () => {
    const p = initialProgress()
    expect(dailyPlan(p, 0, NOW)[2].route).not.toBe(dailyPlan(p, 0, NOW + DAY)[2].route)
  })
})

describe('streak & levels', () => {
  it('counts consecutive active days, tolerating an empty today', () => {
    const days = { [dayKey(NOW - DAY)]: day({ xp: 10 }), [dayKey(NOW - 2 * DAY)]: day({ xp: 5 }) }
    expect(streak(days, NOW)).toBe(2)
    expect(streak({ ...days, [dayKey(NOW)]: day({ xp: 1 }) }, NOW)).toBe(3)
    expect(streak({ [dayKey(NOW - 3 * DAY)]: day({ xp: 5 }) }, NOW)).toBe(0)
  })

  it('maps XP to the dev career ladder', () => {
    expect(levelOf(0).current.title).toBe('Intern')
    expect(levelOf(500)).toMatchObject({ current: { title: 'Junior Dev' }, progress: 0 })
    expect(levelOf(99999).next).toBeUndefined()
  })
})

describe('pickWords', () => {
  it('puts due, weak words first', () => {
    const p = initialProgress()
    p.cards.cache = { ...newCard(NOW - DAY), ease: 1.5 }
    p.cards.queue = { ...newCard(NOW - DAY), ease: 2.5 }
    p.cards.array = { ...newCard(NOW), due: NOW + 5 * DAY, ease: 1.3 }
    expect(pickWords(p, 'all', 3, { now: NOW }).map((w) => w.id).sort()).toEqual(['array', 'cache', 'queue'])
    expect(pickWords(p, 'all', 1, { now: NOW }).map((w) => w.id)).toEqual(['cache'])
  })
})

describe('store', () => {
  it('lets games award XP without adding unstudied words to the review queue', () => {
    const before = getProgress().xp
    practice('cache', true, 12)
    expect(getProgress().cards.cache).toBeUndefined()
    expect(getProgress().xp).toBe(before + 12)
  })

  it('schedules studied words and makes a missed one due again', () => {
    gradeCard('queue', 2)
    const learned = getProgress().cards.queue
    expect(learned.interval).toBe(1)
    expect(getProgress().days[dayKey()].learned).toBe(1)

    practice('queue', false)
    expect(getProgress().cards.queue.due).toBeLessThanOrEqual(Date.now())
    expect(getProgress().cards.queue.ease).toBeLessThan(learned.ease)
  })
})
