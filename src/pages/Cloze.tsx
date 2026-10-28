import { ArrowRight, Lightbulb, Play, RotateCcw } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ContextView, Example, GameIntro, Kbd, RoundHeader, Summary, TopicPicker, VerdictLine, sayExample } from '../components/ui'
import { useHotkeys, useReveal, useScore } from '../lib/hooks'
import { pickWords, type TopicFilter } from '../lib/pick'
import { finishGame, getProgress, practice } from '../lib/store'
import { checkAnswer, normalize, parseExample, type Verdict } from '../lib/text'
import type { Word } from '../types'

const ROUNDS = 10

/** "deprecated" → "d _ _ _ _ _ _ _ _ _" (keeps spaces and hyphens) */
const hintOf = (target: string) => target.replace(/[A-Za-z]/g, (c, i: number) => (i === 0 ? c : '_')).split('').join(' ')

export function Cloze() {
  const [topic, setTopic] = useState<TopicFilter>('all')
  const [words, setWords] = useState<Word[] | null>(null)
  const [i, setI] = useState(0)
  const [input, setInput] = useState('')
  const [hint, setHint] = useState(false)
  const [result, setResult] = useState<{ verdict: Verdict; note?: string } | null>(null)
  const [finished, setFinished] = useState(false)
  const { score, hit, miss, reset } = useScore()

  function start() {
    setWords(pickWords(getProgress(), topic, ROUNDS))
    setI(0)
    setInput('')
    setHint(false)
    setResult(null)
    setFinished(false)
    reset()
  }

  const word = words?.[i]

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!word || result) return
    const { target } = parseExample(word.ex)
    let verdict = input.trim() ? checkAnswer(input, [target]) : 'wrong'
    let note: string | undefined
    if (verdict !== 'correct' && normalize(input) === normalize(word.word)) {
      verdict = 'close'
      note = `Đúng từ rồi! Nhưng câu này cần dạng “${target}”.`
    }
    if (verdict === 'wrong') {
      miss()
      practice(word.id, false)
    } else {
      const { gained } = hit(verdict === 'correct' && !hint ? 10 : 5)
      practice(word.id, true, gained)
    }
    setResult({ verdict, note })
    sayExample(word)
  }

  function next() {
    if (!words) return
    if (i + 1 >= words.length) {
      finishGame(score.misses === 0, score.best)
      setFinished(true)
      return
    }
    setI(i + 1)
    setInput('')
    setHint(false)
    setResult(null)
  }

  const revealRef = useReveal<HTMLDivElement>(result)

  useHotkeys((e) => {
    if (result && e.key === 'Enter') {
      e.preventDefault()
      next()
    }
  })

  if (!words) {
    return (
      <GameIntro
        route="cloze"
        desc="Điền từ còn thiếu vào code comment, commit message, PR review, Slack… — đúng nơi bạn sẽ gặp từ đó khi đi làm."
        steps={[
          'Đọc câu trong ngữ cảnh và bản dịch tiếng Việt.',
          'Tự gõ ra từ còn thiếu — đúng dạng (số nhiều, quá khứ…).',
          'Bí thì xin gợi ý chữ cái đầu, đổi lại ít XP hơn.',
        ]}
      >
        <TopicPicker value={topic} onChange={setTopic} />
        <div>
          <button className="btn primary big" onClick={start}>
            <Play size={18} fill="currentColor" /> Bắt đầu {ROUNDS} câu
          </button>
        </div>
      </GameIntro>
    )
  }

  if (finished || !word) {
    const perfect = score.misses === 0
    return (
      <Summary
        icon={perfect ? '🏆' : '🧩'}
        title={perfect ? 'All tests passed!' : 'Build xong!'}
        stats={[
          { value: `${words.length - score.misses}/${words.length}`, label: 'câu đúng' },
          { value: `+${score.xp}`, label: 'XP' },
          { value: `x${score.best}`, label: 'combo cao nhất' },
        ]}
        celebrate={perfect}
      >
        <button className="btn primary" onClick={start}>
          <RotateCcw size={16} /> Chơi lại
        </button>
        <button className="btn" onClick={() => setWords(null)}>
          Đổi chủ đề
        </button>
      </Summary>
    )
  }

  const { target } = parseExample(word.ex)
  return (
    <div className="card">
      <RoundHeader index={i} total={words.length} score={score} onExit={() => setWords(null)} />
      <p className="prompt">Điền từ còn thiếu:</p>
      <ContextView ctx={word.ctx}>
        <Example
          text={word.ex}
          blank={<span className={`blank ${result ? 'filled' : ''}`}>{result ? target : hint ? hintOf(target) : '_____'}</span>}
        />
      </ContextView>
      <div className="wc-exvi">
        <span className="lang">VI</span>
        <span>{word.exVi}</span>
      </div>
      <form className="answer-form" onSubmit={submit}>
        <input
          key={i}
          className={`text-input ${result?.verdict ?? ''}`}
          autoFocus
          disabled={!!result}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Gõ từ còn thiếu rồi nhấn Enter…"
          aria-label="Từ còn thiếu"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </form>
      {!result && (
        <button className="btn ghost" onClick={() => setHint(true)} disabled={hint}>
          <Lightbulb size={16} /> Gợi ý chữ cái đầu (−5 XP)
        </button>
      )}
      {result && (
        <div className="after" ref={revealRef}>
          <VerdictLine verdict={result.verdict}>
            {result.note ??
              (result.verdict !== 'correct' && (
                <>
                  Đáp án: <b>{target}</b>
                </>
              ))}
          </VerdictLine>
          <div className="muted small">
            <b className="text">{word.word}</b> <span className="ipa">{word.ipa}</span> — {word.vi}
          </div>
          <button className="btn primary" onClick={next}>
            Tiếp <ArrowRight size={16} /> <Kbd>Enter</Kbd>
          </button>
        </div>
      )}
    </div>
  )
}
