import { ArrowLeft, ArrowRight, Puzzle, Repeat, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { WORDS } from '../data/words'
import { Quiz } from '../components/Quiz'
import { ExitButton, GameIntro, Kbd, ProgressBar, Summary, TopicPicker, WordCard, sayWord } from '../components/ui'
import { useHotkeys } from '../lib/hooks'
import { inTopic, type TopicFilter } from '../lib/pick'
import { addXP, gradeCard, useProgress } from '../lib/store'
import type { Route } from '../routes'
import type { Word } from '../types'

type Phase = 'pick' | 'study' | 'quiz' | 'done'

export function Learn({ go }: { go: (r: Route) => void }) {
  const p = useProgress()
  const [topic, setTopic] = useState<TopicFilter>('all')
  const [phase, setPhase] = useState<Phase>('pick')
  const [batch, setBatch] = useState<Word[]>([])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)

  const fresh = (t: TopicFilter) => WORDS.filter((w) => inTopic(t)(w) && !p.cards[w.id])
  const word = batch[i]

  useEffect(() => {
    if (phase === 'study' && word) sayWord(word)
  }, [phase, word])

  function start() {
    setBatch(fresh(topic).slice(0, p.settings.newPerSession))
    setI(0)
    setPhase('study')
  }

  function next() {
    if (i < batch.length - 1) setI(i + 1)
    else setPhase('quiz')
  }

  function finish(firstTry: Record<string, boolean>) {
    // The quiz counts as the first review: right on the first try → see it again tomorrow,
    // otherwise it is due again in a minute.
    batch.forEach((w) => gradeCard(w.id, firstTry[w.id] ? 2 : 0))
    addXP(10)
    setScore(batch.filter((w) => firstTry[w.id]).length)
    setPhase('done')
  }

  useHotkeys((e) => {
    if (phase !== 'study') return
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault()
      next()
    } else if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
  })

  if (phase === 'study' && word) {
    return (
      <div className="stack">
        <div className="round-head">
          <ProgressBar value={(i + 1) / batch.length} label="Tiến độ học từ mới" />
          <span className="muted mono small">
            {i + 1}/{batch.length}
          </span>
          <ExitButton onExit={() => setPhase('pick')} label="Dừng học" />
        </div>
        <WordCard key={word.id} word={word} />
        <div className="row spread">
          <button className="btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
            <ArrowLeft size={16} /> Trước
          </button>
          <span className="muted small kbd-hint">
            <Kbd>←</Kbd> <Kbd>→</Kbd> chuyển thẻ
          </span>
          <button className="btn primary" onClick={next}>
            {i < batch.length - 1 ? (
              <>
                Tiếp <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Zap size={16} /> Kiểm tra nhanh
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'quiz') return <Quiz words={batch} onDone={finish} onExit={() => setPhase('pick')} />

  if (phase === 'done') {
    const perfect = score === batch.length
    return (
      <Summary
        icon={perfect ? '🏆' : '🎉'}
        title={perfect ? 'Nhớ hết ngay lần đầu!' : 'Đã thêm từ mới vào bộ nhớ!'}
        text="Từ đúng ngay sẽ được nhắc lại vào ngày mai; từ sai sẽ quay lại trong phần Ôn tập sau 1 phút."
        stats={[
          { value: `${score}/${batch.length}`, label: 'đúng ngay lần đầu' },
          { value: Object.keys(p.cards).length, label: 'từ trong bộ nhớ' },
        ]}
        celebrate={perfect}
      >
        <button className="btn primary" onClick={start} disabled={!fresh(topic).length}>
          Học tiếp {p.settings.newPerSession} từ
        </button>
        <button className="btn" onClick={() => go('review')}>
          <Repeat size={16} /> Ôn tập
        </button>
        <button className="btn" onClick={() => go('cloze')}>
          <Puzzle size={16} /> Code Cloze
        </button>
      </Summary>
    )
  }

  const available = fresh(topic).length
  return (
    <GameIntro
      route="learn"
      desc="Mỗi lượt vài từ mới, sau đó được đưa vào lịch ôn tập ngắt quãng."
      steps={[
        'Xem thẻ từ: nghe phát âm, đọc ví dụ trong ngữ cảnh và mẹo nhớ.',
        'Chọn nghĩa đúng của từng từ (nhận diện).',
        'Tự gõ lại từ tiếng Anh từ nghĩa tiếng Việt (nhớ chủ động).',
      ]}
    >
      <TopicPicker value={topic} onChange={setTopic} count={(t) => fresh(t).length} />
      <div>
        <button className="btn primary big" onClick={start} disabled={!available}>
          {available ? `Bắt đầu học ${Math.min(available, p.settings.newPerSession)} từ` : 'Đã học hết chủ đề này 🎉'}
        </button>
      </div>
    </GameIntro>
  )
}
