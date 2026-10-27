import { describe, expect, it } from 'vitest'
import { WORDS } from '../data/words'
import { isBuildable, isCorrectOrder, scenarioRounds, scramble, toTiles, wordRound } from './builder'

describe('toTiles', () => {
  it('splits words and keeps the final punctuation aside', () => {
    expect(toTiles("Can you check this bug for me?")).toEqual({ tiles: ['Can', 'you', 'check', 'this', 'bug', 'for', 'me'], end: '?' })
    expect(toTiles('LGTM, ship it! 🚀')).toEqual({ tiles: ['LGTM,', 'ship', 'it'], end: '!' })
  })
})

describe('rounds', () => {
  it('builds rounds from natural-sentence examples and scenario answers', () => {
    const word = WORDS.find(isBuildable)!
    const round = wordRound(word)
    expect(round.answer.length).toBeGreaterThanOrEqual(4)
    expect(round.prompt).toBe(word.exVi)
    expect(scenarioRounds().length).toBeGreaterThan(5)
    expect(WORDS.filter(isBuildable).length).toBeGreaterThan(60)
  })
})

describe('checking', () => {
  it('never hands out an already-solved puzzle and treats duplicate words as interchangeable', () => {
    const tiles = ['the', 'fix', 'is', 'the', 'patch']
    expect(scramble(tiles).join(' ')).not.toBe(tiles.join(' '))
    expect(isCorrectOrder(['the', 'fix', 'is', 'the', 'patch'], tiles)).toBe(true)
    expect(isCorrectOrder(['fix', 'the', 'is', 'the', 'patch'], tiles)).toBe(false)
  })
})
