import { Check, Play, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ComboPill, ExitButton, GameIntro, Summary, TopicPicker, XpPill, sayWord } from '../components/ui'
import { useScore } from '../lib/hooks'
import { pickWords, type TopicFilter } from '../lib/pick'
import { finishGame, getProgress, practice } from '../lib/store'
import { shuffle } from '../lib/text'
import type { Word } from '../types'

const PAIRS = 6

type Side = 'left' | 'right'

export function Match() {
  const [topic, setTopic] = useState<TopicFilter>('all')
  const [left, setLeft] = useState<Word[] | null>(null)
  const [right, setRight] = useState<Word[]>([])
  const [sel, setSel] = useState<Partial<Record<Side, string>>>({})
  const [matched, setMatched] = useState<string[]>([])
  const [wrong, setWrong] = useState<Partial<Record<Side, string>>>({})
  const [startedAt, setStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const { score, hit, miss, reset } = useScore()

  const playing = !!left && !finished
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(t)
  }, [playing, startedAt])

  function start() {
    const words = pickWords(getProgress(), topic, PAIRS)
    setLeft(words)
    setRight(shuffle(words))
    setSel({})
    setMatched([])
    setWrong({})
    setFinished(false)
    setStartedAt(Date.now())
    setElapsed(0)
    reset()
  }

  function choose(side: Side, id: string) {
    if (!left || matched.includes(id) || wrong.left) return
    const next = { ...sel, [side]: id }
    if (side === 'left') sayWord(left.find((w) => w.id === id)!)
    if (!next.left || !next.right) return setSel(next)

    if (next.left === next.right) {
      const { gained, next: s } = hit(10)
      practice(next.left, true, gained)
      const done = [...matched, next.left]
      setMatched(done)
      setSel({})
      if (done.length === left.length) {
        finishGame(s.misses === 0, s.best)
        setElapsed(Math.floor((Date.now() - startedAt) / 1000))
        setFinished(true)
      }
    } else {
      miss()
      practice(next.left, false)
      setWrong(next)
      setSel(next)
      setTimeout(() => {
        setWrong({})
        setSel({})
      }, 600)
    }
  }

  if (!left) {
    return (
      <GameIntro
        route="match"
        desc="Resolve the merge conflict! Ghép mỗi thuật ngữ tiếng Anh với nghĩa tiếng Việt càng nhanh càng tốt."
        steps={['Chọn một từ ở cột English (nghe phát âm luôn).', 'Chọn nghĩa đúng ở cột Tiếng Việt.', 'Ghép đúng liên tiếp để ăn combo XP.']}
      >
        <TopicPicker value={topic} onChange={setTopic} />
        <div>
          <button className="btn primary big" onClick={start}>
            <Play size={18} fill="currentColor" /> Bắt đầu
          </button>
        </div>
      </GameIntro>
    )
  }

  if (finished) {
    const perfect = score.misses === 0
    return (
      <Summary
        icon={perfect ? '🏆' : '✅'}
        title={perfect ? 'Merge thành công, không conflict nào!' : 'Đã resolve xong conflict!'}
        stats={[
          { value: `${elapsed}s`, label: 'thời gian' },
          { value: `+${score.xp}`, label: 'XP' },
          { value: score.misses, label: 'lần ghép sai' },
          { value: `x${score.best}`, label: 'combo cao nhất' },
        ]}
        celebrate={perfect}
      >
        <button className="btn primary" onClick={start}>
          <RotateCcw size={16} /> Ván mới
        </button>
        <button className="btn" onClick={() => setLeft(null)}>
          Đổi chủ đề
        </button>
      </Summary>
    )
  }

  const cls = (side: Side, id: string) =>
    matched.includes(id) ? 'done' : wrong[side] === id ? 'bad' : sel[side] === id ? 'selected' : ''

  return (
    <div className="stack">
      <div className="round-head">
        <span className="pill">
          <Timer size={14} /> {elapsed}s
        </span>
        <span className="pill">
          <Check size={14} /> {matched.length}/{left.length}
        </span>
        <XpPill score={score} />
        <ComboPill combo={score.combo} />
        <ExitButton onExit={() => setLeft(null)} />
      </div>
      <div className="match-grid">
        <div className="match-col">
          <div className="col-head ours">{'<<<<<<< EN'}</div>
          {left.map((w) => (
            <button key={w.id} className={`tile ${cls('left', w.id)}`} onClick={() => choose('left', w.id)} disabled={matched.includes(w.id)}>
              {matched.includes(w.id) && <Check size={16} />}
              {w.word}
            </button>
          ))}
        </div>
        <div className="match-col">
          <div className="col-head theirs">{'>>>>>>> VI'}</div>
          {right.map((w) => (
            <button key={w.id} className={`tile ${cls('right', w.id)}`} onClick={() => choose('right', w.id)} disabled={matched.includes(w.id)}>
              {matched.includes(w.id) && <Check size={16} />}
              {w.vi}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
