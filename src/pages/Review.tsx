import { BookOpen, Eye, GitMerge, House, RotateCcw } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { wordById } from '../data/words'
import { ContextView, Example, ExitButton, Kbd, ProgressBar, SpeakButton, Summary, VerdictLine, WordCard, sayWord } from '../components/ui'
import { useHotkeys } from '../lib/hooks'
import { dueIds } from '../lib/pick'
import { sfx } from '../lib/sfx'
import { formatInterval, newCard, nextInterval, type Grade } from '../lib/srs'
import { getProgress, gradeCard, useProgress } from '../lib/store'
import { checkAnswer, parseExample, type Verdict } from '../lib/text'
import type { Route } from '../routes'

const GRADES: { grade: Grade; label: string; cls: string }[] = [
  { grade: 0, label: 'Quên', cls: 'again' },
  { grade: 1, label: 'Khó', cls: 'hard' },
  { grade: 2, label: 'Nhớ', cls: 'good' },
  { grade: 3, label: 'Dễ', cls: 'easy' },
]

const SUGGESTED: Record<Verdict, Grade> = { correct: 2, close: 1, wrong: 0 }

export function Review({ go }: { go: (r: Route) => void }) {
  const p = useProgress()
  const [queue, setQueue] = useState(() => dueIds(getProgress()))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [input, setInput] = useState('')
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [tally, setTally] = useState({ done: 0, again: 0 })

  const id = queue[pos]
  const word = id ? wordById.get(id) : undefined
  const card = id ? (p.cards[id] ?? newCard(Date.now())) : undefined
  // Alternate between recognising the word (EN → VI) and producing it (VI → EN).
  const mode: 'recall' | 'produce' = (pos + (card?.reps ?? 0)) % 2 === 0 ? 'recall' : 'produce'
  const suggested: Grade = mode === 'produce' && verdict ? SUGGESTED[verdict] : 2

  useEffect(() => {
    if (word && mode === 'recall') sayWord(word)
  }, [word, mode])

  function grade(g: Grade) {
    if (!id) return
    gradeCard(id, g)
    setTally((t) => ({ done: t.done + 1, again: t.again + (g === 0 ? 1 : 0) }))
    if (g === 0) setQueue((q) => [...q, id])
    setPos(pos + 1)
    setFlipped(false)
    setInput('')
    setVerdict(null)
  }

  function reveal(v: Verdict) {
    if (!word) return
    if (v === 'wrong') sfx.wrong()
    else sfx.correct()
    setVerdict(v)
    setFlipped(true)
    sayWord(word)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (word) reveal(input.trim() ? checkAnswer(input, [parseExample(word.ex).target, word.word]) : 'wrong')
  }

  useHotkeys((e) => {
    if (!word) return
    if (!flipped) {
      if (mode === 'recall' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        setFlipped(true)
      }
      return
    }
    if (/^[1-4]$/.test(e.key)) grade((Number(e.key) - 1) as Grade)
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      grade(suggested)
    }
  })

  if (!queue.length) {
    const upcoming = Object.values(p.cards).map((c) => c.due)
    const nextDue = upcoming.length ? new Date(Math.min(...upcoming)) : null
    return (
      <Summary
        icon="☕"
        title="Không có thẻ nào đến hạn"
        text="Ôn đúng lúc quan trọng hơn ôn nhiều — trong lúc chờ, hãy học thêm từ mới hoặc chơi một game."
        stats={nextDue ? [{ value: nextDue.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), label: 'lượt ôn tiếp theo' }] : []}
      >
        <button className="btn primary" onClick={() => go('learn')}>
          <BookOpen size={16} /> Học từ mới
        </button>
        <button className="btn" onClick={() => go('match')}>
          <GitMerge size={16} /> Merge Pairs
        </button>
      </Summary>
    )
  }

  if (!word || !card) {
    return (
      <Summary
        icon={tally.again ? '✅' : '🏆'}
        title="Hoàn thành lượt ôn tập!"
        text={tally.again ? 'Quên rồi nhớ lại chính là cách bộ não ghi nhớ — những thẻ đó sẽ quay lại sớm hơn.' : 'Không quên thẻ nào. Trí nhớ của bạn đang lên level!'}
        stats={[
          { value: tally.done, label: 'lượt ôn' },
          { value: tally.again, label: 'lần “Quên”' },
        ]}
        celebrate={tally.again === 0}
      >
        <button className="btn primary" onClick={() => go('home')}>
          <House size={16} /> Về Dashboard
        </button>
        <button className="btn" onClick={() => go('learn')}>
          <BookOpen size={16} /> Học từ mới
        </button>
      </Summary>
    )
  }

  const { target } = parseExample(word.ex)

  return (
    <div className="stack">
      <div className="round-head">
        <ProgressBar value={pos / queue.length} tone="green" label="Tiến độ ôn tập" />
        <span className="muted mono small">
          {pos + 1}/{queue.length}
        </span>
        <span className="pill">{mode === 'recall' ? 'Anh → Việt' : 'Việt → Anh'}</span>
        <ExitButton onExit={() => go('home')} label="Dừng ôn tập" />
      </div>

      {!flipped && mode === 'recall' && (
        <div className="card flash" onClick={() => setFlipped(true)}>
          <p className="prompt">Từ này nghĩa là gì?</p>
          <div className="big-word">
            {word.word} <SpeakButton solid onSpeak={() => sayWord(word)} />
          </div>
          <div className="ipa">{word.ipa}</div>
          <p className="muted small hint">Nghĩ ra câu trả lời trong đầu, rồi lật thẻ để kiểm tra.</p>
          <button className="btn primary" onClick={() => setFlipped(true)}>
            <RotateCcw size={16} /> Lật thẻ <Kbd>Space</Kbd>
          </button>
        </div>
      )}

      {mode === 'produce' && (
        <div className="card">
          <p className="prompt">
            Từ tiếng Anh nào nghĩa là: <b className="text">{word.vi}</b>
          </p>
          <ContextView ctx={word.ctx}>
            <Example text={word.ex} blank={<span className={`blank ${flipped ? 'filled' : ''}`}>{flipped ? target : '____'}</span>} />
          </ContextView>
          <form className="answer-form" onSubmit={submit}>
            <input
              key={pos}
              className={`text-input ${verdict ?? ''}`}
              autoFocus
              disabled={flipped}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Gõ từ tiếng Anh rồi nhấn Enter…"
              aria-label="Đáp án"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </form>
          {!flipped && (
            <button className="btn ghost" onClick={() => reveal('wrong')}>
              <Eye size={16} /> Không nhớ, xem đáp án
            </button>
          )}
          {verdict && (
            <VerdictLine verdict={verdict}>
              {verdict !== 'correct' && (
                <>
                  Đáp án: <b>{target}</b>
                </>
              )}
            </VerdictLine>
          )}
        </div>
      )}

      {flipped && (
        <>
          <WordCard word={word} />
          <div>
            <div className="field-label">Bạn nhớ từ này thế nào?</div>
            <div className="grades">
              {GRADES.map((g) => (
                <button
                  key={g.grade}
                  className={`grade ${g.cls} ${g.grade === suggested ? 'suggested' : ''}`}
                  onClick={() => grade(g.grade)}
                >
                  <b>{g.label}</b>
                  <span className="small">ôn lại sau {formatInterval(nextInterval(card, g.grade))}</span>
                  <Kbd>{g.grade + 1}</Kbd>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
