import { ArrowRight, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { GameIntro, Kbd, RoundHeader, SpeakButton, Summary, TopicPicker, VerdictLine } from '../components/ui'
import { isBuildable, isCorrectOrder, scenarioRounds, scramble, wordRound, type BuildRound } from '../lib/builder'
import { useHotkeys, useScore } from '../lib/hooks'
import { pickWords, type TopicFilter } from '../lib/pick'
import { speak } from '../lib/speech'
import { addXP, finishGame, getProgress, practice } from '../lib/store'
import { shuffle } from '../lib/text'

const ROUNDS = 8
const SCENARIO_ROUNDS = 2

interface Tile {
  id: number
  text: string
}

const sentenceOf = (r: BuildRound) => r.answer.join(' ') + r.end

export function Builder() {
  const [topic, setTopic] = useState<TopicFilter>('all')
  const [rounds, setRounds] = useState<BuildRound[] | null>(null)
  const [i, setI] = useState(0)
  const [bank, setBank] = useState<Tile[]>([])
  const [built, setBuilt] = useState<number[]>([])
  const [result, setResult] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)
  const { score, hit, miss, reset } = useScore()

  const round = rounds?.[i]
  const textOf = (id: number) => bank.find((t) => t.id === id)?.text ?? ''

  function load(r: BuildRound) {
    setBank(scramble(r.answer).map((text, id) => ({ id, text })))
    setBuilt([])
    setResult(null)
  }

  function start() {
    // Scenario answers have no topic, so they only join the mix when practising everything.
    const extra = topic === 'all' ? shuffle(scenarioRounds()).slice(0, SCENARIO_ROUNDS) : []
    const words = pickWords(getProgress(), topic, ROUNDS - extra.length, { where: isBuildable }).map(wordRound)
    const all = shuffle([...words, ...extra])
    setRounds(all)
    setI(0)
    setFinished(false)
    reset()
    if (all[0]) load(all[0])
  }

  function add(id: number) {
    if (result === null && !built.includes(id)) setBuilt([...built, id])
  }

  function remove(id: number) {
    if (result === null) setBuilt(built.filter((x) => x !== id))
  }

  function compile() {
    if (!round || result !== null || built.length !== bank.length) return
    const ok = isCorrectOrder(built.map(textOf), round.answer)
    if (ok) {
      const { gained } = hit(15)
      if (round.wordId) practice(round.wordId, true, gained)
      else addXP(gained)
    } else {
      miss()
      if (round.wordId) practice(round.wordId, false)
    }
    setResult(ok)
    speak(sentenceOf(round))
  }

  function next() {
    if (!rounds) return
    if (i + 1 >= rounds.length) {
      finishGame(score.misses === 0, score.best)
      setFinished(true)
      return
    }
    setI(i + 1)
    load(rounds[i + 1])
  }

  useHotkeys((e) => {
    // Enter on a focused, still-clickable tile belongs to that tile (a used tile is disabled).
    if (!round || (e.target instanceof HTMLButtonElement && !e.target.disabled)) return
    if (e.key === 'Enter') {
      e.preventDefault()
      if (result === null) compile()
      else next()
    } else if (e.key === 'Backspace' && result === null) {
      e.preventDefault()
      setBuilt((b) => b.slice(0, -1))
    }
  })

  if (!rounds) {
    return (
      <GameIntro
        route="builder"
        desc="Ráp các từ thành câu tiếng Anh đúng trật tự — chữa tật “dịch từng chữ” từ tiếng Việt."
        steps={['Đọc câu tiếng Việt cần nói.', 'Chạm các ô từ theo đúng thứ tự (chạm lại để bỏ).', 'Bấm Compile — đúng trật tự thì build pass!']}
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

  if (finished || !round) {
    const perfect = score.misses === 0 && rounds.length > 0
    return (
      <Summary
        icon={perfect ? '🏆' : '🧱'}
        title={perfect ? 'Build succeeded — 0 errors!' : rounds.length ? 'Build xong!' : 'Chủ đề này chưa có câu phù hợp'}
        stats={
          rounds.length
            ? [
                { value: `${rounds.length - score.misses}/${rounds.length}`, label: 'câu đúng' },
                { value: `+${score.xp}`, label: 'XP' },
                { value: `x${score.best}`, label: 'combo cao nhất' },
              ]
            : []
        }
        celebrate={perfect}
      >
        <button className="btn primary" onClick={start}>
          <RotateCcw size={16} /> Chơi lại
        </button>
        <button className="btn" onClick={() => setRounds(null)}>
          Đổi chủ đề
        </button>
      </Summary>
    )
  }

  const done = built.length === bank.length
  return (
    <div className="card">
      <RoundHeader index={i} total={rounds.length} score={score} onExit={() => setRounds(null)} />
      <p className="prompt">Nói câu này bằng tiếng Anh:</p>
      <div className="build-prompt">
        <span className="lang">VI</span>
        <span>{round.prompt}</span>
      </div>

      <div className={`build-line ${result === true ? 'ok' : result === false ? 'bad' : ''}`} aria-label="Câu bạn ráp" aria-live="polite">
        <span className="build-caret" aria-hidden>
          &gt;
        </span>
        {built.length === 0 && <span className="muted small">Chạm vào các từ bên dưới theo đúng thứ tự…</span>}
        {built.map((id, k) => (
          <button
            key={id}
            className={`word-tile placed ${result === false && textOf(id) !== round.answer[k] ? 'off' : ''}`}
            onClick={() => remove(id)}
            disabled={result !== null}
          >
            {textOf(id)}
          </button>
        ))}
        {done && <span className="build-end">{round.end}</span>}
      </div>

      <div className="build-bank">
        {bank.map((t) => {
          const used = built.includes(t.id)
          return (
            <button key={t.id} className={`word-tile ${used ? 'used' : ''}`} onClick={() => add(t.id)} disabled={used || result !== null} aria-hidden={used}>
              {t.text}
            </button>
          )
        })}
      </div>

      {result === null ? (
        <div className="row spread">
          <button className="btn ghost" onClick={() => setBuilt([])} disabled={!built.length}>
            <RotateCcw size={16} /> Làm lại
          </button>
          <button className="btn primary" onClick={compile} disabled={!done}>
            <Play size={16} fill="currentColor" /> Compile <Kbd>Enter</Kbd>
          </button>
        </div>
      ) : (
        <div className="after">
          <VerdictLine verdict={result ? 'correct' : 'wrong'} label={result ? 'Build succeeded' : 'Compile error'}>
            {result ? 'Đúng trật tự từ rồi!' : 'Trật tự từ chưa đúng — những ô viền đỏ đang sai vị trí.'}
          </VerdictLine>
          <div className="fix">
            <div className="fix-line add">
              <span className="sign">+</span>
              <span>{sentenceOf(round)}</span>
              <SpeakButton onSpeak={() => speak(sentenceOf(round))} title="Nghe câu đúng" />
            </div>
          </div>
          <button className="btn primary" onClick={next}>
            Tiếp <ArrowRight size={16} /> <Kbd>Enter</Kbd>
          </button>
        </div>
      )}
    </div>
  )
}
