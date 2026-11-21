import { BookOpen, Dumbbell, Eye, Gamepad2, House, Repeat, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { wordById } from '../data/words'
import { AnswerInput, ContextView, Example, ExitButton, Kbd, ProgressBar, SpeakButton, Summary, VerdictLine, WordCard, sayWord } from '../components/ui'
import { useHotkeys, useNow, useScrollTopOn } from '../lib/hooks'
import { dailyPlan, planNext } from '../lib/gamify'
import { dueIds, extraIds } from '../lib/pick'
import { sfx } from '../lib/sfx'
import { formatDue, formatInterval, newCard, nextInterval, type Grade } from '../lib/srs'
import { getProgress, gradeCard, practice, useProgress } from '../lib/store'
import { checkAnswer, parseExample, type Verdict } from '../lib/text'
import { GAMES, type Route } from '../routes'

const GRADES: { grade: Grade; label: string; cls: string }[] = [
  { grade: 0, label: 'Quên', cls: 'again' },
  { grade: 1, label: 'Khó', cls: 'hard' },
  { grade: 2, label: 'Nhớ', cls: 'good' },
  { grade: 3, label: 'Dễ', cls: 'easy' },
]

const SUGGESTED: Record<Verdict, Grade> = { correct: 2, close: 1, wrong: 0 }

/** Cards per "Ôn thêm" round. */
const EXTRA_SIZE = 10

export function Review({ go }: { go: (r: Route) => void }) {
  const p = useProgress()
  // Re-evaluate what is due while the page stays open (e.g. a card forgotten a minute ago).
  const now = useNow(15_000)
  const [queue, setQueue] = useState(() => dueIds(getProgress()))
  /** Extra practice on cards that aren't due: it never pushes their schedule further out. */
  const [extra, setExtra] = useState(false)
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

  function start(ids: string[], asExtra: boolean) {
    setQueue(ids)
    setExtra(asExtra)
    setPos(0)
    setFlipped(false)
    setInput('')
    setVerdict(null)
    setTally({ done: 0, again: 0 })
  }

  function advance(forgot: boolean) {
    if (!id) return
    setTally((t) => ({ done: t.done + 1, again: t.again + (forgot ? 1 : 0) }))
    setPos(pos + 1)
    setFlipped(false)
    setInput('')
    setVerdict(null)
  }

  function grade(g: Grade) {
    if (!id || !card) return
    // Cards due again within minutes (Again, or Hard while still learning) come back this session.
    const comesBackToday = nextInterval(card, g) < 1
    gradeCard(id, g)
    if (comesBackToday) setQueue((q) => [...q, id])
    advance(g === 0)
  }

  /** Extra practice: forgetting is a real lapse; remembering keeps the schedule as it is. */
  function gradeExtra(remembered: boolean) {
    if (!id) return
    if (remembered) practice(id, true, 5)
    else {
      gradeCard(id, 0)
      setQueue((q) => [...q, id])
    }
    advance(!remembered)
  }

  function reveal(v: Verdict) {
    if (!word) return
    if (v === 'wrong') sfx.wrong()
    else sfx.correct()
    setVerdict(v)
    setFlipped(true)
    sayWord(word)
  }

  const answers = word ? [parseExample(word.ex).target, word.word] : []

  function check(value: string) {
    if (!flipped) reveal(value.trim() ? checkAnswer(value, answers) : 'wrong')
  }

  useScrollTopOn(pos)

  useHotkeys((e) => {
    if (!word) return
    if (!flipped) {
      if (mode === 'recall' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        setFlipped(true)
      }
      return
    }
    // Every handled key is swallowed: otherwise the digit lands in the next card's answer box.
    if (extra) {
      if (e.key === '1' || e.key === '2') {
        e.preventDefault()
        gradeExtra(e.key === '2')
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        gradeExtra(verdict !== 'wrong')
      }
    } else if (/^[1-4]$/.test(e.key)) {
      e.preventDefault()
      grade((Number(e.key) - 1) as Grade)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      grade(suggested)
    }
  })

  if (!word || !card) {
    const due = dueIds(p, now)
    const more = extraIds(p, EXTRA_SIZE, now)
    const upcoming = Object.values(p.cards)
      .map((c) => c.due)
      .filter((t) => t > now)
    const nextDue = upcoming.length ? Math.min(...upcoming) : null
    // Words just missed come back within minutes: worth waiting for, with a game meanwhile.
    const soon = !due.length && nextDue !== null && nextDue - now < 10 * 60_000
    // The summary already offers the plan's game as the next step: no second game button then.
    const planRoute = planNext(dailyPlan(p, due.length, now))?.route
    const planGame = GAMES.some((g) => g.route === planRoute)
    const finished = tally.done > 0
    return (
      <Summary
        icon={due.length ? '🔔' : finished ? (tally.again ? '✅' : '🏆') : '☕'}
        title={
          due.length
            ? `Có ${due.length} từ cần ôn`
            : finished
              ? extra
                ? `Đã ôn thêm ${tally.done} từ!`
                : 'Hoàn thành lượt ôn tập!'
              : 'Chưa có từ nào đến hạn ôn'
        }
        text={
          due.length
            ? 'Ôn ngay lúc này là đúng thời điểm nhất để nhớ lâu.'
            : soon
              ? 'Từ vừa trả lời sai sẽ quay lại rất sớm — trong lúc chờ, chơi một game cho nóng máy nhé.'
              : more.length
                ? 'Các từ khác chưa tới hạn. Muốn luyện tiếp thì “Ôn thêm” — chọn từ bạn hay quên nhất và không làm xáo trộn lịch ôn.'
                : Object.keys(p.cards).length
                  ? 'Bạn đã ôn hết rồi — học thêm vài từ mới nhé.'
                  : 'Bạn chưa có từ nào để ôn — học vài từ mới trước nhé.'
        }
        stats={[
          ...(finished
            ? [
                { value: tally.done, label: 'từ đã ôn' },
                { value: tally.again, label: 'lần “Quên”' },
              ]
            : []),
          ...(nextDue && !due.length ? [{ value: formatDue(nextDue, now), label: 'từ tiếp theo đến hạn' }] : []),
        ]}
        celebrate={finished && !extra && tally.again === 0 && !due.length}
      >
        {due.length > 0 ? (
          <button className="btn primary" onClick={() => start(due, false)}>
            <Repeat size={16} /> Ôn tiếp {due.length} từ
          </button>
        ) : soon && !planGame ? (
          <button className="btn primary" onClick={() => go('arcade')}>
            <Gamepad2 size={16} /> Chơi game trong lúc chờ
          </button>
        ) : more.length > 0 ? (
          <button className="btn primary" onClick={() => start(more, true)}>
            <Dumbbell size={16} /> Ôn thêm {more.length} từ
          </button>
        ) : null}
        {planRoute !== 'learn' && (
          <button className={`btn ${due.length || more.length ? '' : 'primary'}`} onClick={() => go('learn')}>
            <BookOpen size={16} /> Học từ mới
          </button>
        )}
        {finished && (
          <button className="btn ghost" onClick={() => go('home')}>
            <House size={16} /> Trang chủ
          </button>
        )}
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
        <span className="pill">{extra ? 'Ôn thêm' : mode === 'recall' ? 'Anh → Việt' : 'Việt → Anh'}</span>
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
        </div>
      )}
      {!flipped && mode === 'recall' && (
        <div className="dock">
          <button className="btn primary big block" onClick={() => setFlipped(true)}>
            <RotateCcw size={16} /> Lật thẻ <Kbd>Space</Kbd>
          </button>
        </div>
      )}

      {mode === 'produce' && (
        <div className="card">
          <p className="prompt">
            Gõ từ tiếng Anh có nghĩa: <b className="text">{word.vi}</b>
          </p>
          <ContextView ctx={word.ctx}>
            <Example text={word.ex} blank={<span className={`blank ${flipped ? 'filled' : ''}`}>{flipped ? target : '\u00a0'}</span>} />
          </ContextView>
          <AnswerInput
            key={pos}
            value={input}
            onChange={setInput}
            onSubmit={check}
            accepts={(v) => checkAnswer(v, answers) === 'correct'}
            done={flipped}
            verdict={verdict}
            placeholder="Gõ từ tiếng Anh…"
          />
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
          {extra ? (
            <div className="dock">
              <div className="field-label">Bạn còn nhớ từ này không?</div>
              <div className="grades two">
                <button className={`grade again ${verdict === 'wrong' ? 'suggested' : ''}`} onClick={() => gradeExtra(false)}>
                  <b>Quên</b>
                  <span className="small">ôn lại sau 1 phút</span>
                  <Kbd>1</Kbd>
                </button>
                <button className={`grade good ${verdict !== 'wrong' ? 'suggested' : ''}`} onClick={() => gradeExtra(true)}>
                  <b>Nhớ</b>
                  <span className="small">giữ nguyên lịch ôn</span>
                  <Kbd>2</Kbd>
                </button>
              </div>
            </div>
          ) : (
            <div className="dock">
              <div className="field-label">
                Bạn nhớ từ này thế nào? <span className="muted">· ôn lại sau…</span>
              </div>
              <div className="grades">
                {GRADES.map((g) => (
                  <button
                    key={g.grade}
                    className={`grade ${g.cls} ${g.grade === suggested ? 'suggested' : ''}`}
                    onClick={() => grade(g.grade)}
                  >
                    <b>{g.label}</b>
                    <span className="small interval">{formatInterval(nextInterval(card, g.grade))}</span>
                    <Kbd>{g.grade + 1}</Kbd>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
