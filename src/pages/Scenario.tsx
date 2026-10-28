import { ArrowLeft, ArrowRight, ChevronRight, MessageSquareQuote, RotateCcw, Star, Target } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SCENARIOS } from '../data/scenarios'
import { ExitButton, GameIntro, Kbd, Note, ProgressBar, SpeakButton, Summary, VerdictLine } from '../components/ui'
import { useHotkeys, useReveal } from '../lib/hooks'
import { sfx } from '../lib/sfx'
import { speak } from '../lib/speech'
import { addXP, finishGame, saveScenario, useProgress } from '../lib/store'
import { shuffle } from '../lib/text'
import type { Scenario as ScenarioT, ScenarioOption } from '../types'

const MOOD = ['bad', 'meh', 'good'] as const
const VERDICT_OF = ['wrong', 'close', 'correct'] as const
const VERDICT_LABEL = ['Chưa ổn', 'Tạm được', 'Rất tự nhiên!']

const initials = (name: string) => name.replace(/\(.*\)/, '').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

function Stars({ value, max }: { value: number; max: number }) {
  const n = value === max ? 3 : value >= max * 0.6 ? 2 : 1
  return (
    <span className="row" style={{ gap: 2 }} aria-label={`${n}/3 sao`}>
      {[0, 1, 2].map((k) => (
        <Star key={k} size={14} fill={k < n ? 'var(--yellow)' : 'none'} color={k < n ? 'var(--yellow)' : 'var(--muted)'} />
      ))}
    </span>
  )
}

export function Scenario() {
  const p = useProgress()
  const [current, setCurrent] = useState<ScenarioT | null>(null)
  const [step, setStep] = useState(0)
  const [picks, setPicks] = useState<ScenarioOption[]>([])
  const [finished, setFinished] = useState(false)

  const s = current?.steps[step]
  const options = useMemo(() => (s ? shuffle(s.options) : []), [s])
  const picked = picks[step]
  const total = picks.reduce((sum, o) => sum + o.score, 0)

  useEffect(() => {
    if (s && !finished) speak(s.line)
  }, [s, finished])

  function play(sc: ScenarioT) {
    setCurrent(sc)
    setStep(0)
    setPicks([])
    setFinished(false)
  }

  function choose(o: ScenarioOption) {
    if (picked) return
    if (o.score === 2) sfx.correct()
    else if (o.score === 0) sfx.wrong()
    setPicks([...picks, o])
    speak(o.text)
  }

  function next() {
    if (!current || !picked) return
    if (step + 1 < current.steps.length) return setStep(step + 1)
    addXP(total * 5)
    saveScenario(current.id, total)
    finishGame(total === current.steps.length * 2, 0)
    setFinished(true)
  }

  const revealRef = useReveal<HTMLDivElement>(picked)
  const goalRef = useReveal<HTMLDivElement>(s && !picked ? step + 1 : 0)

  useHotkeys((e) => {
    if (picked && !finished && e.key === 'Enter') {
      e.preventDefault()
      next()
    } else if (!picked && /^[1-3]$/.test(e.key) && options[Number(e.key) - 1]) {
      choose(options[Number(e.key) - 1])
    }
  })

  if (!current) {
    return (
      <div className="stack">
        <GameIntro
          route="scenario"
          desc="Nhập vai vào những cuộc hội thoại bạn sẽ gặp khi đi làm. Chọn câu trả lời tự nhiên nhất — mỗi lựa chọn đều có giải thích."
        >
          <div className="scenario-list">
            {SCENARIOS.map((sc) => {
              const best = p.scenarios[sc.id]
              const max = sc.steps.length * 2
              return (
                <button key={sc.id} className="card scenario-card" onClick={() => play(sc)}>
                  <span className="scenario-icon">{sc.icon}</span>
                  <h3>{sc.title}</h3>
                  <span className="muted small">{sc.desc}</span>
                  <span className="card-foot">
                    {best === undefined ? 'Chưa chơi' : <Stars value={best} max={max} />}
                    <ChevronRight size={16} />
                  </span>
                </button>
              )
            })}
          </div>
        </GameIntro>
      </div>
    )
  }

  const max = current.steps.length * 2
  if (finished) {
    return (
      <Summary
        icon={current.icon}
        title={total === max ? 'Giao tiếp chuẩn như người bản xứ!' : `Hoàn thành: ${current.title}`}
        text={total === max ? undefined : 'Chơi lại để thử những câu trả lời tự nhiên hơn nhé.'}
        stats={[
          { value: <Stars value={total} max={max} />, label: 'đánh giá' },
          { value: `${total}/${max}`, label: 'điểm' },
          { value: `+${total * 5}`, label: 'XP' },
        ]}
        celebrate={total === max}
      >
        <button className="btn primary" onClick={() => play(current)}>
          <RotateCcw size={16} /> Chơi lại
        </button>
        <button className="btn" onClick={() => setCurrent(null)}>
          <ArrowLeft size={16} /> Tình huống khác
        </button>
      </Summary>
    )
  }

  return (
    <div className="card chat">
      <div className="chat-head">
        <span className="scenario-icon">{current.icon}</span>
        <div style={{ flex: 1 }}>
          <h3>{current.title}</h3>
          <ProgressBar value={step / current.steps.length} label="Tiến độ hội thoại" />
        </div>
        <span className="muted mono small">
          {step + 1}/{current.steps.length}
        </span>
        <ExitButton onExit={() => setCurrent(null)} label="Thoát tình huống" />
      </div>

      {current.steps.slice(0, step + 1).map((st, k) => (
        <div key={k} className="chat-turn">
          <div className="msg-row them">
            <span className="avatar alt">{initials(st.speaker)}</span>
            <div className="msg">
              <div className="who">{st.speaker}</div>
              {st.line} <SpeakButton onSpeak={() => speak(st.line)} />
            </div>
          </div>
          {picks[k] && (
            <div className={`msg-row me ${MOOD[picks[k].score]}`}>
              <span className="avatar">Bạn</span>
              <div className="msg">{picks[k].text}</div>
            </div>
          )}
        </div>
      ))}

      {s && !picked && (
        <>
          <div className="goal" ref={goalRef}>
            <Target size={18} />
            <div>
              <b>Bạn muốn nói:</b> {s.goal}
            </div>
          </div>
          <div className="options">
            {options.map((o, k) => (
              <button key={o.text} className="option" onClick={() => choose(o)}>
                <Kbd>{k + 1}</Kbd> {o.text}
              </button>
            ))}
          </div>
        </>
      )}

      {s && picked && (
        <div className="after" ref={revealRef}>
          <VerdictLine verdict={VERDICT_OF[picked.score]} label={VERDICT_LABEL[picked.score]}>
            {picked.note}
          </VerdictLine>
          {picked.score < 2 && (
            <Note icon={MessageSquareQuote}>
              Câu hay hơn: <b>{s.options.find((o) => o.score === 2)?.text}</b>
            </Note>
          )}
          <button className="btn primary" onClick={next}>
            {step + 1 < current.steps.length ? 'Tiếp tục' : 'Xem kết quả'} <ArrowRight size={16} /> <Kbd>Enter</Kbd>
          </button>
        </div>
      )}
    </div>
  )
}
