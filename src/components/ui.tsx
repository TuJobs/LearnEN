import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Flame,
  Lightbulb,
  Mic,
  Rainbow,
  Snail,
  Volume2,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { TOPICS, topicById } from '../data/topics'
import { dailyPlan, planNext } from '../lib/gamify'
import { AUTO_NEXT_MS, useAutoAdvance, useRoute, useScrollTopOn, type Score } from '../lib/hooks'
import { dueIds, type TopicFilter } from '../lib/pick'
import { sfx } from '../lib/sfx'
import { speak } from '../lib/speech'
import { useProgress } from '../lib/store'
import { parseExample, plainExample, stripEmoji, type Verdict } from '../lib/text'
import { navOf, type Route } from '../routes'
import type { Ctx, Pos, Word } from '../types'
import { CTX_META, TOPIC_ICON } from './icons'

export const POS_LABEL: Record<Pos, string> = {
  n: 'danh từ',
  v: 'động từ',
  adj: 'tính từ',
  phr: 'cụm từ',
  abbr: 'viết tắt',
}

export const sayWord = (w: Word) => speak(w.speak ?? w.word)
export const sayExample = (w: Word, rate?: number) => speak(stripEmoji(plainExample(w.ex)), rate)

export function SpeakButton({ onSpeak, slow, solid, title }: { onSpeak: () => void; slow?: boolean; solid?: boolean; title?: string }) {
  const label = title ?? (slow ? 'Nghe chậm' : 'Nghe phát âm')
  const Icon = slow ? Snail : Volume2
  return (
    <button
      type="button"
      className={`icon-btn ${solid ? 'solid' : ''}`}
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.currentTarget.blur()
        onSpeak()
      }}
    >
      <Icon size={18} />
    </button>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>
}

export function ProgressBar({ value, tone = 'accent', label = 'Tiến độ' }: { value: number; tone?: 'accent' | 'green'; label?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div className="bar" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`bar-fill ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function StatTile({ icon: Icon, tone, value, label }: { icon: LucideIcon; tone: string; value: ReactNode; label: string }) {
  return (
    <div className="card stat">
      <span className={`icon-tile tone-${tone}`}>
        <Icon size={20} />
      </span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="muted small">{label}</div>
      </div>
    </div>
  )
}

export function SectionTitle({ icon: Icon, children, aside }: { icon: LucideIcon; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="section-title">
      <Icon size={18} />
      <h3>{children}</h3>
      {aside && <span className="aside">{aside}</span>}
    </div>
  )
}

export function Note({ warn, icon: Icon = warn ? Mic : Lightbulb, children }: { warn?: boolean; icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className={`note ${warn ? 'warn' : ''}`}>
      <Icon size={16} />
      <div>{children}</div>
    </div>
  )
}

/** Renders an example sentence with its target word highlighted, or replaced by `blank`. */
export function Example({ text, blank }: { text: string; blank?: ReactNode }) {
  const { before, target, after } = parseExample(text)
  return (
    <>
      {before}
      {blank ?? <mark>{target}</mark>}
      {after}
    </>
  )
}

/** Shows a sentence where it would really appear: a code comment, a commit, a Slack message... */
export function ContextView({ ctx, children }: { ctx: Ctx; children: ReactNode }) {
  const { icon: Icon, label } = CTX_META[ctx]
  return (
    <div className={`ctx ctx-${ctx}`}>
      <div className="ctx-label">
        <span className="dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <Icon size={13} />
        {label}
      </div>
      <div className="ctx-body">{renderCtx(ctx, children)}</div>
    </div>
  )
}

function renderCtx(ctx: Ctx, children: ReactNode) {
  switch (ctx) {
    case 'code':
      return (
        <code>
          <span className="ln" aria-hidden>
            42
          </span>
          <span className="tok-comment">// {children}</span>
        </code>
      )
    case 'commit':
      return (
        <code>
          <span className="tok-prompt">$</span> git commit -m "<span className="tok-str">{children}</span>"
        </code>
      )
    case 'terminal':
      return <code>{children}</code>
    case 'error':
      return (
        <code>
          <span className="tok-err">✖</span> {children}
        </code>
      )
    case 'pr':
      return (
        <div className="bubble">
          <span className="avatar alt">TL</span>
          <div>
            <b>techlead</b> <span className="muted small">commented on line 42</span>
            <p>{children}</p>
          </div>
        </div>
      )
    case 'chat':
      return (
        <div className="bubble">
          <span className="avatar">NM</span>
          <div>
            <b>nam.dev</b> <span className="muted small">10:24 AM</span>
            <p>{children}</p>
          </div>
        </div>
      )
    case 'meeting':
      return <p>“{children}”</p>
    case 'doc':
      return <p>{children}</p>
    case 'email':
      return (
        <>
          <div className="mail-head">
            <span>
              <b>To:</b> client-team@acme.com
            </span>
            <span>
              <b>Cc:</b> pm@learnen.dev
            </span>
          </div>
          <p>{children}</p>
        </>
      )
  }
}

export function WordCard({ word }: { word: Word }) {
  const topic = topicById[word.topic]
  const TopicIcon = TOPIC_ICON[word.topic]
  return (
    <article className="word-card">
      <div className="wc-head">
        <div>
          <div className="wc-word">
            {word.word}
            <SpeakButton solid onSpeak={() => sayWord(word)} />
            <SpeakButton slow onSpeak={() => speak(word.speak ?? word.word, 0.5)} />
          </div>
          <div className="wc-meta">
            <span className="ipa">{word.ipa}</span>
            <span className="tag">{POS_LABEL[word.pos]}</span>
          </div>
        </div>
        <span className="tag">
          <TopicIcon size={13} /> {topic.name}
        </span>
      </div>
      <div className="wc-vi">{word.vi}</div>
      <ContextView ctx={word.ctx}>
        <Example text={word.ex} />
      </ContextView>
      <div className="wc-exvi">
        <span className="lang">VI</span>
        <span>{word.exVi}</span>
        <SpeakButton title="Nghe cả câu" onSpeak={() => sayExample(word)} />
      </div>
      {word.wrong && (
        <Note warn>
          Hay đọc sai: <s>{word.wrong}</s> → đọc gần đúng: <b>{word.sound}</b>
        </Note>
      )}
      {word.tip && <Note>{word.tip}</Note>}
    </article>
  )
}

export function TopicPicker({ value, onChange, count }: { value: TopicFilter; onChange: (t: TopicFilter) => void; count?: (t: TopicFilter) => number }) {
  const options: { id: TopicFilter; label: string; icon: LucideIcon }[] = [
    { id: 'all', label: 'Tất cả', icon: Rainbow },
    ...TOPICS.map((t) => ({ id: t.id, label: t.name, icon: TOPIC_ICON[t.id] })),
  ]
  return (
    <div>
      <div className="field-label">Chủ đề</div>
      <div className="chips topic-chips">
        {options.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={`chip ${value === id ? 'active' : ''}`} onClick={() => onChange(id)} aria-pressed={value === id}>
            <Icon size={15} />
            {label}
            {count && <span className="chip-count">{count(id)}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export function XpPill({ score }: { score: Score }) {
  return (
    <span className="pill xp-pill">
      <Zap size={14} /> {score.xp} XP
      {score.last > 0 && (
        <span key={score.xp} className="xp-float">
          +{score.last}
        </span>
      )}
    </span>
  )
}

export function ComboPill({ combo }: { combo: number }) {
  if (combo < 2) return null
  return (
    <span key={combo} className="pill combo">
      <Flame size={14} /> ×{combo}
    </span>
  )
}

/**
 * Typed answer with a visible "Kiểm tra" button. A correct answer is accepted the moment it is
 * typed (no Enter needed); anything else is checked with Enter or the button.
 */
/** The "how auto-check works" hint is shown on the first few answers only, then it's noise. */
let hintsLeft = 3

export function AnswerInput({
  value,
  onChange,
  onSubmit,
  accepts,
  done,
  verdict,
  placeholder = 'Gõ đáp án…',
  label = 'Đáp án',
  multiline = false,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (v: string) => void
  /** True when the text is exactly right: it is then checked without pressing Enter */
  accepts: (v: string) => boolean
  done: boolean
  verdict?: Verdict | null
  placeholder?: string
  label?: string
  /** A two-line box for whole sentences (Enter still checks, Shift+Enter is ignored) */
  multiline?: boolean
}) {
  const [showHint] = useState(() => hintsLeft-- > 0)
  const field = {
    className: `text-input ${verdict ?? ''}`,
    autoFocus: true,
    disabled: done,
    value,
    onChange: (e: { target: { value: string } }) => {
      const v = e.target.value
      onChange(v)
      if (!done && accepts(v)) onSubmit(v)
    },
    placeholder,
    'aria-label': label,
    autoComplete: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
    enterKeyHint: 'go' as const,
  }
  return (
    <form
      className="answer-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (!done) onSubmit(value)
      }}
    >
      <div className={`answer-row ${multiline ? 'multi' : ''}`}>
        {multiline ? (
          <textarea
            {...field}
            rows={2}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              if (!e.shiftKey && !done && value.trim()) onSubmit(value)
            }}
          />
        ) : (
          <input {...field} />
        )}
        {!done && (
          <button type="submit" className="btn primary" disabled={!value.trim()}>
            <Check size={16} /> Kiểm tra
          </button>
        )}
      </div>
      {!done && showHint && <p className="answer-hint">Gõ đúng là tự chấm luôn — chưa chắc thì bấm Kiểm tra.</p>}
    </form>
  )
}

/**
 * "Next" button; with `auto` (after a correct answer) it fills up and moves on by itself.
 * After a wrong answer it turns neutral, so green keeps meaning "correct".
 */
export function NextButton({
  onNext,
  auto,
  wrong,
  children = 'Tiếp',
}: {
  onNext: () => void
  auto?: boolean
  wrong?: boolean
  children?: ReactNode
}) {
  useAutoAdvance(!!auto, onNext)
  return (
    <button
      type="button"
      className={`btn primary next-btn ${auto ? 'auto' : ''} ${wrong ? 'neutral' : ''}`}
      style={auto ? ({ '--auto-next': `${AUTO_NEXT_MS}ms` } as CSSProperties) : undefined}
      onClick={onNext}
    >
      {children} <ArrowRight size={16} /> <Kbd>Enter</Kbd>
    </button>
  )
}

export function ExitButton({ onExit, label = 'Thoát ván chơi' }: { onExit: () => void; label?: string }) {
  return (
    <button type="button" className="icon-btn exit-btn" onClick={onExit} aria-label={label} title={label}>
      <X size={18} />
    </button>
  )
}

export function RoundHeader({ index, total, score, onExit }: { index: number; total: number; score: Score; onExit?: () => void }) {
  useScrollTopOn(index)
  return (
    <div className="round-head">
      <ProgressBar value={index / total} label="Tiến độ lượt chơi" />
      <span className="muted mono small">
        {Math.min(index + 1, total)}/{total}
      </span>
      <XpPill score={score} />
      <ComboPill combo={score.combo} />
      {onExit && <ExitButton onExit={onExit} />}
    </div>
  )
}

const VERDICT = {
  correct: { icon: CircleCheck, label: 'Chính xác!' },
  close: { icon: CircleAlert, label: 'Gần đúng!' },
  wrong: { icon: CircleX, label: 'Chưa đúng' },
} as const

export function VerdictLine({ verdict, label, children }: { verdict: Verdict; label?: string; children?: ReactNode }) {
  const { icon: Icon, label: defaultLabel } = VERDICT[verdict]
  return (
    <div className={`verdict ${verdict}`} role="status">
      <Icon size={18} />
      <div className="verdict-text">
        <b className="verdict-label">{label ?? defaultLabel}</b>
        {children}
      </div>
    </div>
  )
}

const CONFETTI_COLORS = ['#4f9cff', '#a78bfa', '#3fb950', '#d29922', '#f85149', '#f0883e']

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        animationDelay: `${Math.random() * 0.4}s`,
        '--dx': `${(Math.random() - 0.5) * 160}px`,
        '--rot': `${Math.random() * 720 - 360}deg`,
      })),
    [],
  )
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </div>
  )
}

export interface SummaryStat {
  value: ReactNode
  label: string
}

export function Summary({
  icon,
  title,
  text,
  stats = [],
  celebrate,
  children,
}: {
  icon: string
  title: string
  text?: ReactNode
  stats?: SummaryStat[]
  celebrate?: boolean
  children?: ReactNode
}) {
  useEffect(() => {
    if (celebrate) sfx.fanfare()
  }, [celebrate])
  return (
    <div className="card summary">
      {celebrate && <Confetti />}
      <div className="summary-icon" aria-hidden>
        {icon}
      </div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {stats.length > 0 && (
        <div className="summary-stats">
          {stats.map((s) => (
            <div key={s.label} className="sstat">
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="row center">
        <PlanNext />
        {children}
      </div>
    </div>
  )
}

/**
 * The daily plan's next step, so every summary leads on instead of only offering "play again".
 * When it shows, it is the one primary action (the page's own buttons are demoted in CSS).
 */
function PlanNext() {
  const p = useProgress()
  const [route, go] = useRoute()
  const steps = dailyPlan(p, dueIds(p).length)
  const next = planNext(steps)
  if (!next) {
    return (
      <p className="summary-goal">
        <Check size={16} strokeWidth={3} /> Xong việc hôm nay — hẹn gặp lại ngày mai!
      </p>
    )
  }
  if (next.route === route) return null
  const Icon = navOf(next.route).icon
  return (
    <button className="btn primary plan-next" onClick={() => go(next.route)}>
      <Icon size={16} /> Tiếp theo: {next.label}
    </button>
  )
}

export function GameIntro({ route, desc, steps, children }: { route: Route; desc: ReactNode; steps?: string[]; children: ReactNode }) {
  const { icon: Icon, label, tone } = navOf(route)
  return (
    <div className="card intro">
      <div className="intro-head">
        <span className={`icon-tile lg tone-${tone ?? 'blue'}`}>
          <Icon size={28} />
        </span>
        <div>
          <h2 className="title">{label}</h2>
          <p className="muted">{desc}</p>
        </div>
      </div>
      {steps && (
        <ol className="howto">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
      {children}
    </div>
  )
}
