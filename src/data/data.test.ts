import { describe, expect, it } from 'vitest'
import { BUGS } from './bugs'
import { SCENARIOS } from './scenarios'
import { TOPICS } from './topics'
import { WORDS } from './words'

describe('vocabulary', () => {
  it('has unique ids', () => {
    const ids = WORDS.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(WORDS.map((w) => [w.word, w] as const))('%s has exactly one bracketed target', (_, w) => {
    expect(w.ex.match(/\[[^\]]+\]/g)).toHaveLength(1)
  })

  it('gives every mispronounced word a correct-sound hint', () => {
    expect(WORDS.filter((w) => w.wrong && !w.sound)).toEqual([])
  })

  it('has enough words per topic for a game round', () => {
    for (const t of TOPICS) expect(WORDS.filter((w) => w.topic === t.id).length).toBeGreaterThanOrEqual(6)
  })
})

describe('Vietglish bugs', () => {
  it.each(BUGS.map((b) => [b.wrong, b] as const))('"%s" contains its bug', (_, b) => {
    expect(b.wrong).toContain(b.bug)
    expect(b.fix).not.toBe(b.wrong)
  })
})

describe('scenarios', () => {
  it('has exactly one best answer per step', () => {
    for (const s of SCENARIOS) {
      for (const step of s.steps) expect(step.options.filter((o) => o.score === 2)).toHaveLength(1)
    }
  })
})
