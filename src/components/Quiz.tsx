import { Check, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useHotkeys, useReveal, useScrollTopOn } from '../lib/hooks'
import { distractors } from '../lib/pick'
import { sfx } from '../lib/sfx'
import { checkAnswer, parseExample, shuffle, type Verdict } from '../lib/text'
import type { Word } from '../types'
import { AnswerInput, ContextView, Example, ExitButton, Kbd, NextButton, ProgressBar, SpeakButton, VerdictLine, sayWord } from './ui'

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

  const answers = [target, task.word.word]

  function check(value: string) {
    if (value.trim() && !answer) resolve(checkAnswer(value, answers))
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
          <AnswerInput
            key={pos}
            value={input}
            onChange={setInput}
            onSubmit={check}
            accepts={(v) => checkAnswer(v, answers) === 'correct'}
            done={!!answer}
            verdict={answer?.verdict}
          />
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
          <NextButton onNext={next} auto={answer.verdict === 'correct'}>
            Tiếp tục
          </NextButton>
        </div>
      )}
    </div>
  )
}
