/** Splits "This is [deprecated] now." into the parts around the bracketed target. */
export function parseExample(ex: string) {
  const m = /\[([^\]]+)\]/.exec(ex)
  if (!m) return { before: ex, target: '', after: '' }
  return { before: ex.slice(0, m.index), target: m[1], after: ex.slice(m.index + m[0].length) }
}

export const plainExample = (ex: string) => ex.replace(/\[([^\]]+)\]/g, '$1')

export const stripEmoji = (s: string) =>
  s.replace(/\p{Extended_Pictographic}|️/gu, '').replace(/\s+/g, ' ').trim()

export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Ignores spaces, hyphens and dots: "roll back" ≈ "rollback", "engine x" ≈ "enginex". */
export const compact = (s: string) => normalize(s).replace(/[\s\-_.]/g, '')

export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[b.length]
}

export type Verdict = 'correct' | 'close' | 'wrong'

/** Exact match → correct; spacing/hyphen difference or a small typo → close. */
export function checkAnswer(input: string, answers: string[]): Verdict {
  const a = normalize(input)
  if (!a) return 'wrong'
  if (answers.some((t) => normalize(t) === a)) return 'correct'
  if (answers.some((t) => compact(t) === compact(a))) return 'close'
  return answers.some((t) => {
    const n = normalize(t)
    const allowed = n.length <= 3 ? 0 : n.length < 7 ? 1 : 2
    return levenshtein(n, a) <= allowed
  })
    ? 'close'
    : 'wrong'
}

/** Lowercase word tokens without punctuation or emoji, for comparing whole sentences. */
export function tokens(s: string): string[] {
  return normalize(stripEmoji(s))
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** Marks which `target` tokens appear, in order, in `input` (longest common subsequence). */
export function matchTokens(target: string[], input: string[]): boolean[] {
  const n = target.length
  const m = input.length
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = target[i] === input[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const hit = new Array<boolean>(n).fill(false)
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (target[i] === input[j]) {
      hit[i] = true
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return hit
}

/** Splits a sentence into clickable tokens, flagging those that overlap the `bug` substring. */
export function tokenizeBug(sentence: string, bug: string) {
  const start = sentence.indexOf(bug)
  const end = start + bug.length
  return Array.from(sentence.matchAll(/\S+/g), (m) => {
    const from = m.index ?? 0
    return { text: m[0], buggy: start >= 0 && from < end && from + m[0].length > start }
  })
}

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Local-time YYYY-MM-DD key for daily stats. */
export function dayKey(t: number = Date.now()): string {
  const d = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
