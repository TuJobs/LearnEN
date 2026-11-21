import { WORDS } from '../data/words'
import type { TopicId, Word } from '../types'
import type { Progress } from './store'
import { shuffle } from './text'

export type TopicFilter = TopicId | 'all'

export const inTopic = (topic: TopicFilter) => (w: Word) => topic === 'all' || w.topic === topic

/**
 * Picks words for a game round: due words first (they need practice most), then
 * already-learned words, then new ones; within each group the weakest words (lowest
 * ease) come first. Meanings are kept unique so matching games never have two
 * identical answers.
 */
export function pickWords(
  p: Progress,
  topic: TopicFilter,
  n: number,
  { now = Date.now(), where }: { now?: number; where?: (w: Word) => boolean } = {},
): Word[] {
  const rank = (w: Word) => {
    const c = p.cards[w.id]
    if (!c) return 20
    return (c.due <= now ? 0 : 10) + c.ease
  }
  const seen = new Set<string>()
  const picked = shuffle(WORDS.filter((w) => inTopic(topic)(w) && (!where || where(w))))
    .sort((a, b) => rank(a) - rank(b))
    .filter((w) => !seen.has(w.vi) && seen.add(w.vi))
    .slice(0, n)
  return shuffle(picked)
}

/** Wrong answer options, preferring the same topic so they are plausible. */
export function distractors(word: Word, n: number): Word[] {
  const pool = [
    ...shuffle(WORDS.filter((w) => w.topic === word.topic)),
    ...shuffle(WORDS.filter((w) => w.topic !== word.topic)),
  ]
  const seen = new Set([word.vi])
  return pool.filter((w) => !seen.has(w.vi) && seen.add(w.vi)).slice(0, n)
}

const HOUR = 60 * 60 * 1000

/**
 * Learned cards that are not due yet, weakest first: extra practice once the reviews are done.
 * Words seen in the last hour are left out — drilling them again right away is massed practice.
 */
export function extraIds(p: Progress, n: number, now: number = Date.now()): string[] {
  return Object.entries(p.cards)
    .filter(([, c]) => c.due > now && now - c.last > HOUR)
    .sort(([, a], [, b]) => a.ease - b.ease || b.lapses - a.lapses || a.due - b.due)
    .slice(0, n)
    .map(([id]) => id)
}

export function dueIds(p: Progress, now: number = Date.now()): string[] {
  return Object.entries(p.cards)
    .filter(([, c]) => c.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id)
}
