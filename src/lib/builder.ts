import { SCENARIOS } from '../data/scenarios'
import type { Ctx, Word } from '../types'
import { plainExample, shuffle, stripEmoji } from './text'

export interface BuildRound {
  /** What to say, in Vietnamese */
  prompt: string
  /** The English sentence, one tile per word */
  answer: string[]
  /** Final punctuation, shown as a fixed suffix */
  end: string
  ctx?: Ctx
  wordId?: string
}

const MIN_TILES = 4
const MAX_TILES = 12
/** Contexts whose examples read as natural sentences (not commit subjects or log lines). */
const SENTENCE_CTX: Ctx[] = ['chat', 'meeting', 'pr', 'doc', 'email']

/** Splits a sentence into word tiles; the final punctuation stays aside as a fixed suffix. */
export function toTiles(sentence: string): { tiles: string[]; end: string } {
  const clean = stripEmoji(sentence).trim()
  const end = /[.?!…]+$/.exec(clean)?.[0] ?? ''
  const tiles = clean.slice(0, clean.length - end.length).split(/\s+/).filter(Boolean)
  return { tiles, end }
}

const fits = (tiles: string[]) => tiles.length >= MIN_TILES && tiles.length <= MAX_TILES

export const isBuildable = (w: Word) => SENTENCE_CTX.includes(w.ctx) && fits(toTiles(plainExample(w.ex)).tiles)

export function wordRound(w: Word): BuildRound {
  const { tiles, end } = toTiles(plainExample(w.ex))
  return { prompt: w.exVi, answer: tiles, end, ctx: w.ctx, wordId: w.id }
}

/** The natural answer of every scenario step, prompted by what the learner wants to say. */
export function scenarioRounds(): BuildRound[] {
  return SCENARIOS.flatMap((s) =>
    s.steps.flatMap((step) => {
      const best = step.options.find((o) => o.score === 2)
      if (!best) return []
      const { tiles, end } = toTiles(best.text)
      return fits(tiles) ? [{ prompt: step.goal, answer: tiles, end }] : []
    }),
  )
}

/** Shuffles tiles, re-shuffling if the result happens to already be in the right order. */
export function scramble(tiles: string[]): string[] {
  for (let i = 0; i < 5; i++) {
    const s = shuffle(tiles)
    if (s.join(' ') !== tiles.join(' ')) return s
  }
  return [...tiles].reverse()
}

/** Compares by text, so duplicate words ("the", "a") are interchangeable. */
export const isCorrectOrder = (built: string[], answer: string[]) => built.join(' ') === answer.join(' ')
