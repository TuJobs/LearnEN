import { Check, CircleCheck, Mic, MicOff, X } from 'lucide-react'
import { useState } from 'react'
import { WORDS } from '../data/words'
import { GameIntro, Note, ProgressBar, SpeakButton, VerdictLine, sayWord } from '../components/ui'
import { sfx } from '../lib/sfx'
import { canListen, listen, speak } from '../lib/speech'
import { bumpStat, practice } from '../lib/store'
import { compact, levenshtein } from '../lib/text'
import type { Word } from '../types'

/** Words Vietnamese devs commonly mispronounce. */
const TRICKY = WORDS.filter((w) => w.wrong)

const ERRORS: Record<string, string> = {
  'not-allowed': 'Trình duyệt chưa được cấp quyền micro.',
  'no-speech': 'Không nghe thấy gì, hãy nói to và rõ hơn nhé.',
  network: 'Nhận diện giọng nói cần kết nối Internet.',
  'audio-capture': 'Không tìm thấy micro.',
}

function isMatch(w: Word, heard: string[]): boolean {
  const targets = [w.word, w.speak ?? '', ...(w.alt ?? [])].filter(Boolean).map(compact)
  return heard.some((h) => {
    const c = compact(h)
    return targets.some((t) => c === t || (t.length >= 4 && c.includes(t)) || (t.length >= 6 && levenshtein(c, t) <= 1))
  })
}

export function Speak() {
  const [word, setWord] = useState<Word>(TRICKY[0])
  const [passed, setPassed] = useState<string[]>([])
  const [listening, setListening] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; heard: string } | null>(null)
  const [error, setError] = useState('')

  function select(w: Word) {
    setWord(w)
    setResult(null)
    setError('')
    sayWord(w)
  }

  async function record() {
    setListening(true)
    setResult(null)
    setError('')
    try {
      const heard = await listen()
      const ok = isMatch(word, heard)
      if (ok) sfx.correct()
      else sfx.wrong()
      setResult({ ok, heard: heard[0] ?? '(không nghe rõ)' })
      if (ok && !passed.includes(word.id)) {
        setPassed([...passed, word.id])
        bumpStat('spoken')
        practice(word.id, true, 10)
      }
    } catch (e) {
      const code = e instanceof Error ? e.message : ''
      setError(ERRORS[code] ?? `Lỗi nhận diện giọng nói (${code}).`)
    } finally {
      setListening(false)
    }
  }

  return (
    <div className="stack">
      <GameIntro route="speak" desc="Những từ dev Việt hay đọc sai nhất. Nghe mẫu, đọc theo rồi bấm micro để máy kiểm tra.">
        {!canListen && (
          <Note warn icon={MicOff}>
            Trình duyệt này chưa hỗ trợ nhận diện giọng nói — bạn vẫn nghe mẫu được, nhưng hãy dùng <b>Chrome</b> hoặc <b>Edge</b> để luyện nói.
          </Note>
        )}
      </GameIntro>

      <div className="speak-layout">
        <div className="card speak-panel">
          <div className="big-word">{word.word}</div>
          <div className="ipa center">{word.ipa}</div>
          <div className="pron-compare">
            <div className="pron bad">
              <span className="small muted">
                <X size={14} /> Hay đọc sai
              </span>
              <b>{word.wrong}</b>
            </div>
            <div className="pron good">
              <span className="small muted">
                <Check size={14} /> Đọc gần đúng
              </span>
              <b>{word.sound}</b>
            </div>
          </div>
          {word.tip && <Note>{word.tip}</Note>}
          <div className="speak-actions">
            <SpeakButton solid onSpeak={() => sayWord(word)} title="Nghe mẫu" />
            {canListen && (
              <button
                className={`mic-btn ${listening ? 'recording' : ''}`}
                onClick={record}
                disabled={listening}
                aria-label={listening ? 'Đang nghe' : 'Nói thử'}
                title="Nói thử"
              >
                <Mic size={30} />
              </button>
            )}
            <SpeakButton slow onSpeak={() => speak(word.speak ?? word.word, 0.5)} />
          </div>
          <p className="muted small center">{listening ? 'Đang nghe… hãy đọc to từ trên' : canListen ? 'Bấm micro rồi đọc to từ trên' : ''}</p>
          {result && (
            <VerdictLine verdict={result.ok ? 'correct' : 'wrong'} label={result.ok ? 'Chuẩn rồi!' : 'Chưa giống lắm'}>
              Máy nghe được: “{result.heard}”
            </VerdictLine>
          )}
          {error && <VerdictLine verdict="wrong" label="Lỗi">{error}</VerdictLine>}
        </div>

        <div className="card">
          <div className="field-label">Danh sách từ</div>
          <div className="row" style={{ marginBottom: 14 }}>
            <ProgressBar value={passed.length / TRICKY.length} tone="green" label="Số từ đã đọc đúng" />
            <span className="muted small mono">
              {passed.length}/{TRICKY.length}
            </span>
          </div>
          <div className="chips">
            {TRICKY.map((w) => (
              <button key={w.id} className={`chip ${w.id === word.id ? 'active' : ''}`} onClick={() => select(w)}>
                {passed.includes(w.id) && <CircleCheck size={14} color="var(--green)" />}
                {w.word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
