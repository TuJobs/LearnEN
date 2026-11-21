import { ArrowLeft, ArrowRight, Zap } from 'lucide-react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { WORDS } from '../data/words'
import { Quiz } from '../components/Quiz'
import { ExitButton, GameIntro, Kbd, ProgressBar, Summary, TopicPicker, WordCard, sayWord } from '../components/ui'
import { confirmLeave, useHotkeys, useLeaveGuard, useScrollTopOn } from '../lib/hooks'
import { inTopic, type TopicFilter } from '../lib/pick'
import { addXP, gradeCard, takeLearnStart, useProgress } from '../lib/store'
import type { Word } from '../types'

type Phase = 'pick' | 'study' | 'quiz' | 'done'

export function Learn() {
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

  // Coming from the welcome card: skip this intro and show the first words right away.
  useLayoutEffect(() => {
    if (takeLearnStart()) start()
  }, [])

  const inSession = phase === 'study' || phase === 'quiz'
  const leaveText = `Dừng học? ${batch.length} từ vừa xem sẽ chưa được lưu vào lịch ôn.`
  useLeaveGuard(inSession, leaveText)
  const exit = () => {
    if (confirmLeave()) setPhase('pick')
  }

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
    batch.forEach((w) => gradeCard(w.id, firstTry[w.id] ? 2 : 0, { firstLearn: true }))
    addXP(10)
    setScore(batch.filter((w) => firstTry[w.id]).length)
    setPhase('done')
  }

  useScrollTopOn(`${phase}:${i}`)

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
          <ExitButton onExit={exit} label="Dừng học" />
        </div>
        <WordCard key={word.id} word={word} />
        <div className="row spread dock">
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

  if (phase === 'quiz') return <Quiz words={batch} onDone={finish} onExit={exit} />

  if (phase === 'done') {
    const perfect = score === batch.length
    return (
      <Summary
        icon={perfect ? '🏆' : '🎉'}
        title={perfect ? 'Nhớ hết ngay lần đầu!' : 'Đã thêm từ mới vào bộ nhớ!'}
        text="Từ đúng ngay sẽ được nhắc lại vào ngày mai; từ sai sẽ quay lại trong phần Ôn tập sau 1 phút."
        stats={[
          { value: `${score}/${batch.length}`, label: 'đúng ngay lần đầu' },
          { value: Object.keys(p.cards).length, label: 'từ đã học' },
        ]}
        celebrate={perfect}
      >
        <button className="btn primary" onClick={start} disabled={!fresh(topic).length}>
          Học tiếp {p.settings.newPerSession} từ
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
        'Nhìn nghĩa tiếng Việt, tự gõ ra từ tiếng Anh (nhớ chủ động).',
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
