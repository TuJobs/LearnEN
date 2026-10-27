import { ArrowRight, Eye, Play, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BUGS } from '../data/bugs'
import { ContextView, GameIntro, Kbd, Note, RoundHeader, SpeakButton, Summary, VerdictLine } from '../components/ui'
import { useHotkeys, useScore } from '../lib/hooks'
import { speak } from '../lib/speech'
import { addXP, bumpStat, finishGame } from '../lib/store'
import { shuffle, tokenizeBug } from '../lib/text'
import type { VietglishBug } from '../types'

const ROUNDS = 10
const MAX_TRIES = 2

export function Bugs() {
  const [items, setItems] = useState<VietglishBug[] | null>(null)
  const [i, setI] = useState(0)
  const [misses, setMisses] = useState<number[]>([])
  const [state, setState] = useState<'hunt' | 'found' | 'revealed'>('hunt')
  const [finished, setFinished] = useState(false)
  const { score, hit, miss, reset } = useScore()

  const bug = items?.[i]
  const toks = useMemo(() => (bug ? tokenizeBug(bug.wrong, bug.bug) : []), [bug])

  function start() {
    setItems(shuffle(BUGS).slice(0, ROUNDS))
    setI(0)
    setMisses([])
    setState('hunt')
    setFinished(false)
    reset()
  }

  function click(k: number) {
    if (!bug || state !== 'hunt' || misses.includes(k)) return
    if (toks[k].buggy) {
      const { gained } = hit(misses.length ? 5 : 15)
      addXP(gained)
      bumpStat('bugsFound')
      setState('found')
      speak(bug.fix)
      return
    }
    const tried = [...misses, k]
    setMisses(tried)
    if (tried.length === 1) miss()
    if (tried.length >= MAX_TRIES) reveal()
  }

  function reveal() {
    if (!bug) return
    if (!misses.length) miss()
    setState('revealed')
    speak(bug.fix)
  }

  function next() {
    if (!items) return
    if (i + 1 >= items.length) {
      finishGame(score.misses === 0, score.best)
      setFinished(true)
      return
    }
    setI(i + 1)
    setMisses([])
    setState('hunt')
  }

  useHotkeys((e) => {
    if (state !== 'hunt' && e.key === 'Enter') {
      e.preventDefault()
      next()
    }
  })

  if (!items) {
    return (
      <GameIntro
        route="bugs"
        desc="Mỗi câu có đúng một bug — những lỗi tiếng Anh người Việt rất hay mắc khi chat, viết PR hay họp với khách."
        steps={[`Click vào từ bị lỗi (có ${MAX_TRIES} lần thử).`, 'Xem bản sửa dạng diff và nghe câu đúng.', 'Đọc giải thích để không mắc lại lần sau.']}
      >
        <div>
          <button className="btn primary big" onClick={start}>
            <Play size={18} fill="currentColor" /> Bắt đầu debug
          </button>
        </div>
      </GameIntro>
    )
  }

  if (finished || !bug) {
    const perfect = score.misses === 0
    return (
      <Summary
        icon={perfect ? '🏆' : '🐞'}
        title={perfect ? 'Zero bugs in production!' : 'Đã debug xong!'}
        stats={[
          { value: `${items.length - score.misses}/${items.length}`, label: 'bug tìm ra ngay' },
          { value: `+${score.xp}`, label: 'XP' },
          { value: `x${score.best}`, label: 'combo cao nhất' },
        ]}
        celebrate={perfect}
      >
        <button className="btn primary" onClick={start}>
          <RotateCcw size={16} /> Debug tiếp
        </button>
      </Summary>
    )
  }

  return (
    <div className="card">
      <RoundHeader index={i} total={items.length} score={score} onExit={() => setItems(null)} />
      <p className="prompt">Câu dưới đây có một lỗi — click vào chỗ sai:</p>
      <ContextView ctx={bug.ctx}>
        <span className="bug-line">
          {toks.map((t, k) => (
            <button
              key={k}
              className={`tok ${misses.includes(k) ? 'miss' : ''} ${state !== 'hunt' && t.buggy ? 'buggy' : ''}`}
              onClick={() => click(k)}
              disabled={state !== 'hunt'}
            >
              {t.text}
            </button>
          ))}
        </span>
      </ContextView>

      {state === 'hunt' ? (
        <div className="row spread">
          <span className="muted small">Còn {MAX_TRIES - misses.length} lần thử</span>
          <button className="btn ghost" onClick={reveal}>
            <Eye size={16} /> Xem đáp án
          </button>
        </div>
      ) : (
        <div className="after">
          <VerdictLine verdict={state === 'found' ? 'correct' : 'wrong'} label={state === 'found' ? 'Bắt được bug!' : 'Bug đã trốn thoát'} />
          <div className="fix">
            <div className="fix-line del">
              <span className="sign">-</span>
              <span>{bug.wrong}</span>
            </div>
            <div className="fix-line add">
              <span className="sign">+</span>
              <span>{bug.fix}</span>
              <SpeakButton onSpeak={() => speak(bug.fix)} title="Nghe câu đúng" />
            </div>
          </div>
          <Note>{bug.why}</Note>
          <button className="btn primary" onClick={next}>
            Tiếp <ArrowRight size={16} /> <Kbd>Enter</Kbd>
          </button>
        </div>
      )}
    </div>
  )
}
