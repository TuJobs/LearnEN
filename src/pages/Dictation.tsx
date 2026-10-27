import { ArrowRight, Lightbulb, Play, RotateCcw, Text, Type, Volume2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { GameIntro, Kbd, RoundHeader, SpeakButton, Summary, TopicPicker, VerdictLine } from '../components/ui'
import { useHotkeys, useScore } from '../lib/hooks'
import { pickWords, type TopicFilter } from '../lib/pick'
import { speak } from '../lib/speech'
import { finishGame, getProgress, practice } from '../lib/store'
import { checkAnswer, matchTokens, plainExample, stripEmoji, tokens, type Verdict } from '../lib/text'
import type { Word } from '../types'

const ROUNDS = 10
type Mode = 'word' | 'sentence'

export function Dictation() {
  const [topic, setTopic] = useState<TopicFilter>('all')
  const [mode, setMode] = useState<Mode>('word')
  const [words, setWords] = useState<Word[] | null>(null)
  const [i, setI] = useState(0)
  const [input, setInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState<{ verdict: Verdict; hits?: boolean[] } | null>(null)
  const [finished, setFinished] = useState(false)
  const { score, hit, miss, reset } = useScore()

  const word = words?.[i]
  const audio = word ? (mode === 'word' ? (word.speak ?? word.word) : stripEmoji(plainExample(word.ex))) : ''
  const answer = word ? (mode === 'word' ? word.word : stripEmoji(plainExample(word.ex))) : ''

  useEffect(() => {
    if (audio && !finished) speak(audio)
  }, [audio, finished])

  function start() {
    setWords(pickWords(getProgress(), topic, ROUNDS))
    setI(0)
    setInput('')
    setShowHint(false)
    setResult(null)
    setFinished(false)
    reset()
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!word || result || !input.trim()) return
    let verdict: Verdict
    let hits: boolean[] | undefined
    if (mode === 'word') {
      verdict = checkAnswer(input, [word.word])
    } else {
      hits = matchTokens(tokens(answer), tokens(input))
      const ratio = hits.filter(Boolean).length / hits.length
      verdict = ratio >= 0.9 ? 'correct' : ratio >= 0.6 ? 'close' : 'wrong'
    }
    if (verdict === 'wrong') {
      miss()
      practice(word.id, false)
    } else {
      const base = mode === 'sentence' ? 15 : 10
      const { gained } = hit(verdict === 'correct' && !showHint ? base : base / 2)
      practice(word.id, true, gained)
    }
    setResult({ verdict, hits })
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
    setShowHint(false)
    setResult(null)
  }

  useHotkeys((e) => {
    if (result && e.key === 'Enter') {
      e.preventDefault()
      next()
    }
  })

  if (!words) {
    return (
      <GameIntro
        route="dictation"
        desc="Nghe và gõ lại chính xác. Luyện cùng lúc tai nghe, chính tả và phát âm — đeo tai nghe để tập trung hơn."
        steps={['Bấm nút loa để nghe (nghe chậm bằng nút con ốc).', 'Gõ lại chính xác những gì nghe được.', 'Chế độ “cả câu” chấm theo từng từ.']}
      >
        <div>
          <div className="field-label">Chế độ</div>
          <div className="segmented">
            <button className={mode === 'word' ? 'active' : ''} onClick={() => setMode('word')}>
              <Type size={15} /> Nghe từ
            </button>
            <button className={mode === 'sentence' ? 'active' : ''} onClick={() => setMode('sentence')}>
              <Text size={15} /> Nghe cả câu
            </button>
          </div>
        </div>
        <TopicPicker value={topic} onChange={setTopic} />
        <div>
          <button className="btn primary big" onClick={start}>
            <Play size={18} fill="currentColor" /> Bắt đầu {ROUNDS} lượt
          </button>
        </div>
      </GameIntro>
    )
  }

  if (finished || !word) {
    const perfect = score.misses === 0
    return (
      <Summary
        icon={perfect ? '🏆' : '🎧'}
        title="Tai bạn đã được “train” thêm một chút!"
        stats={[
          { value: `${words.length - score.misses}/${words.length}`, label: 'lượt đúng' },
          { value: `+${score.xp}`, label: 'XP' },
          { value: `x${score.best}`, label: 'combo cao nhất' },
        ]}
        celebrate={perfect}
      >
        <button className="btn primary" onClick={start}>
          <RotateCcw size={16} /> Chơi lại
        </button>
        <button className="btn" onClick={() => setWords(null)}>
          Đổi chế độ
        </button>
      </Summary>
    )
  }

  const answerTokens = tokens(answer)
  return (
    <div className="card">
      <RoundHeader index={i} total={words.length} score={score} onExit={() => setWords(null)} />
      <div className="listen-box">
        <button className="play-btn" onClick={() => speak(audio)} aria-label="Nghe lại">
          <Volume2 size={36} />
        </button>
        <div className="row center">
          <SpeakButton slow onSpeak={() => speak(audio, 0.55)} />
          {!result && !showHint && (
            <button className="btn ghost" onClick={() => setShowHint(true)}>
              <Lightbulb size={16} /> Gợi ý nghĩa (−50% XP)
            </button>
          )}
        </div>
        {showHint && !result && (
          <p className="wc-exvi">
            <span className="lang">VI</span> {mode === 'word' ? word.vi : word.exVi}
          </p>
        )}
      </div>
      <form className="answer-form" onSubmit={submit}>
        <input
          key={i}
          className={`text-input ${result?.verdict ?? ''}`}
          autoFocus
          disabled={!!result}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'word' ? 'Gõ từ bạn nghe được…' : 'Gõ cả câu bạn nghe được…'}
          aria-label="Những gì bạn nghe được"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </form>
      {result && (
        <div className="after">
          <VerdictLine verdict={result.verdict} />
          {result.hits ? (
            <p className="diff">
              {answerTokens.map((t, k) => (
                <span key={k} className={result.hits![k] ? 'hit' : 'missed'}>
                  {t}
                </span>
              ))}
            </p>
          ) : (
            <p>
              <b className="text">{word.word}</b> <span className="ipa">{word.ipa}</span>
            </p>
          )}
          <p className="wc-exvi small">
            <span className="lang">VI</span> {mode === 'word' ? word.vi : word.exVi}
          </p>
          <button className="btn primary" onClick={next}>
            Tiếp <ArrowRight size={16} /> <Kbd>Enter</Kbd>
          </button>
        </div>
      )}
    </div>
  )
}
