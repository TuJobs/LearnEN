export type TopicId =
  | 'basics'
  | 'git'
  | 'web'
  | 'db'
  | 'devops'
  | 'testing'
  | 'agile'
  | 'review'
  | 'security'
  | 'ai'
  | 'slang'
  | 'frontend'
  | 'email'

/** Where an example sentence "lives" — drives how it is rendered (code comment, Slack, PR review...). */
export type Ctx = 'code' | 'commit' | 'terminal' | 'error' | 'pr' | 'chat' | 'meeting' | 'doc' | 'email'

export type Pos = 'n' | 'v' | 'adj' | 'phr' | 'abbr'

export interface Word {
  id: string
  topic: TopicId
  word: string
  ipa: string
  pos: Pos
  /** Short Vietnamese meaning */
  vi: string
  /** Example sentence; the target form is wrapped in [brackets] */
  ex: string
  exVi: string
  ctx: Ctx
  /** Memory hook or usage note (Vietnamese) */
  tip?: string
  /** How Vietnamese devs commonly mispronounce it */
  wrong?: string
  /** Vietnamese-letter approximation of the correct sound */
  sound?: string
  /** Extra transcripts the speech recognizer may return for a correct pronunciation */
  alt?: string[]
  /** Text for text-to-speech when it differs from `word` (e.g. abbreviations) */
  speak?: string
}

export interface Topic {
  id: TopicId
  name: string
  en: string
}

export interface CardState {
  ease: number
  /** Days until the next review */
  interval: number
  /** Consecutive successful reviews */
  reps: number
  lapses: number
  due: number
  last: number
}

/** A typical "Vietglish" mistake: `bug` is the faulty substring of `wrong`. */
export interface VietglishBug {
  wrong: string
  bug: string
  fix: string
  why: string
  ctx: Ctx
}

export interface ScenarioOption {
  text: string
  /** 2 = natural & correct, 1 = understandable but awkward, 0 = wrong or inappropriate */
  score: 0 | 1 | 2
  note: string
}

export interface ScenarioStep {
  speaker: string
  line: string
  /** What you want to say, in Vietnamese */
  goal: string
  options: ScenarioOption[]
}

export interface Scenario {
  id: string
  icon: string
  title: string
  desc: string
  steps: ScenarioStep[]
}
