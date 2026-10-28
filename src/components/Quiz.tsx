import { ArrowRight, Check, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useHotkeys, useReveal, useScrollTopOn } from '../lib/hooks'
import { distractors } from '../lib/pick'
import { sfx } from '../lib/sfx'
import { checkAnswer, parseExample, shuffle, type Verdict } from '../lib/text'
import type { Word } from '../types'
import { ContextView, Example, ExitButton, Kbd, ProgressBar, SpeakButton, VerdictLine, sayWord } from './ui'

interface Task {
  kind: 'choice' | 'type'
  word: Word
}

/**
 * Two-stage check right after studying new words:
 * recognition (EN → VI, multiple choice) then production (VI → EN, typing).
 * Missed tasks come back at the end of the queue until answered correctly.
 */
export function Quiz({ words, onDone, onExit }: { words: Word[]; onDone: (firstTry: Record<string, boolean>) => void; onExit: () => void }) {
  const [queue, setQueue] = useState<Task[]>(() => [
    ...shuffle(words).map((word): Task => ({ kind: 'choice', word })),
    ...shuffle(words).map((word): Task => ({ kind: 'type', word })),
  ])
  const [pos, setPos] = useState(0)
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(words.map((w) => [w.id, true])),
  )
  const [answer, setAnswer] = useState<{ verdict: Verdict; picked?: string } | null>(null)
  const [input, setInput] = useState('')

  const task = queue[pos]
  const options = useMemo(() => shuffle([task.word, ...distractors(task.word, 3)]), [task])
  const { target } = parseExample(task.word.ex)

  function resolve(verdict: Verdict, picked?: string) {
    if (verdict === 'wrong') {
      setFirstTry((f) => ({ ...f, [task.word.id]: false }))
      setQueue((q) => [...q, task])
      sfx.wrong()
    } else sfx.correct()
    setAnswer({ verdict, picked })
    sayWord(task.word)
  }

  function next() {
    if (pos + 1 >= queue.length) return onDone(firstTry)
    setPos(pos + 1)
    setAnswer(null)
    setInput('')
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || answer) return
    resolve(checkAnswer(input, [target, task.word.word]))
  }

  const revealRef = useReveal<HTMLDivElement>(answer)
  useScrollTopOn(pos)

  useHotkeys((e) => {
    if (answer && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      next()
    } else if (!answer && task.kind === 'choice' && /^[1-4]$/.test(e.key)) {
      const opt = options[Number(e.key) - 1]
      if (opt) resolve(opt.id === task.word.id ? 'correct' : 'wrong', opt.id)
    }
  })

  return (
    <div className="card">
      <div className="round-head">
        <ProgressBar value={pos / queue.length} tone="green" label="Tiến độ kiểm tra" />
        <span className="muted mono small">
          {pos + 1}/{queue.length}
        </span>
        <ExitButton onExit={onExit} label="Dừng kiểm tra" />
      </div>

      {task.kind === 'choice' ? (
        <>
          <p className="prompt center">Nghĩa của từ này là gì?</p>
          <div className="big-word">
            {task.word.word} <SpeakButton solid onSpeak={() => sayWord(task.word)} />
          </div>
          <div className="ipa center">{task.word.ipa}</div>
          <div className="options">
            {options.map((o, i) => {
              const isAnswer = o.id === task.word.id
              const state = !answer ? '' : isAnswer ? 'ok' : o.id === answer.picked ? 'bad' : 'dim'
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`option ${state}`}
                  disabled={!!answer}
                  onClick={(e) => {
                    e.currentTarget.blur()
                    resolve(isAnswer ? 'correct' : 'wrong', o.id)
                  }}
                >
                  <Kbd>{i + 1}</Kbd>
                  {o.vi}
                  {state === 'ok' && <Check size={18} />}
                  {state === 'bad' && <X size={18} />}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <p className="prompt">
            Gõ từ tiếng Anh có nghĩa: <b className="text">{task.word.vi}</b>
          </p>
          <ContextView ctx={task.word.ctx}>
            <Example
              text={task.word.ex}
              blank={<span className={`blank ${answer ? 'filled' : ''}`}>{answer ? target : '____'}</span>}
            />
          </ContextView>
          <form className="answer-form" onSubmit={submit}>
            <input
              key={pos}
              className={`text-input ${answer?.verdict ?? ''}`}
              autoFocus
              disabled={!!answer}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Gõ đáp án rồi nhấn Enter…"
              aria-label="Đáp án"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </form>
        </>
      )}

      {answer && (
        <div className="after" ref={revealRef}>
          <VerdictLine verdict={answer.verdict}>
            {answer.verdict !== 'correct' && (
              <>
                Đáp án: <b>{task.kind === 'choice' ? task.word.vi : target}</b>
                {answer.verdict === 'wrong' && ' — câu này sẽ quay lại ở cuối lượt.'}
              </>
            )}
          </VerdictLine>
          <button type="button" className="btn primary" onClick={next}>
            Tiếp tục <ArrowRight size={16} /> <Kbd>Enter</Kbd>
          </button>
        </div>
      )}
    </div>
  )
}
