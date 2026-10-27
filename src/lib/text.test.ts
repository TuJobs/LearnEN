import { describe, expect, it } from 'vitest'
import { checkAnswer, levenshtein, matchTokens, parseExample, tokenizeBug, tokens } from './text'

describe('parseExample', () => {
  it('splits around the bracketed target', () => {
    expect(parseExample('This is [deprecated] now.')).toEqual({ before: 'This is ', target: 'deprecated', after: ' now.' })
  })
})

describe('checkAnswer', () => {
  it('accepts exact answers regardless of case and spacing', () => {
    expect(checkAnswer('  Deprecated ', ['deprecated'])).toBe('correct')
  })
  it('treats spacing/hyphen differences and small typos as close', () => {
    expect(checkAnswer('roll back', ['rollback'])).toBe('close')
    expect(checkAnswer('depracated', ['deprecated'])).toBe('close')
  })
  it('is strict on very short words', () => {
    expect(checkAnswer('dog', ['log'])).toBe('wrong')
  })
  it('rejects empty and unrelated answers', () => {
    expect(checkAnswer('', ['cache'])).toBe('wrong')
    expect(checkAnswer('queue', ['cache'])).toBe('wrong')
  })
})

describe('levenshtein', () => {
  it('counts edits', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3)
    expect(levenshtein('', 'abc')).toBe(3)
  })
})

describe('sentence matching', () => {
  it('ignores punctuation and emoji', () => {
    expect(tokens("LGTM, ship it! 🚀 Don't wait.")).toEqual(['lgtm', 'ship', 'it', "don't", 'wait'])
  })
  it('marks target words found in order', () => {
    expect(matchTokens(['clear', 'the', 'cache', 'now'], ['clear', 'cache', 'now'])).toEqual([true, false, true, true])
  })
})

describe('tokenizeBug', () => {
  it('flags every token overlapping the bug', () => {
    const toks = tokenizeBug('Can you check for me this bug?', 'for me')
    expect(toks.filter((t) => t.buggy).map((t) => t.text)).toEqual(['for', 'me'])
  })
})
