import { Search, SearchX } from 'lucide-react'
import { useState } from 'react'
import { WORDS } from '../data/words'
import { SpeakButton, TopicPicker, WordCard, sayWord } from '../components/ui'
import { inTopic, type TopicFilter } from '../lib/pick'
import { MASTERY_LABEL, mastery } from '../lib/srs'
import { useProgress } from '../lib/store'
import { normalize } from '../lib/text'

export function Dictionary() {
  const p = useProgress()
  const [topic, setTopic] = useState<TopicFilter>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const q = normalize(query)
  const list = WORDS.filter(inTopic(topic)).filter((w) => !q || normalize(w.word).includes(q) || normalize(w.vi).includes(q))
  const toggle = (id: string) => setOpen(open === id ? null : id)

  return (
    <div className="stack">
      <div className="card intro">
        <div>
          <h2 className="title">Từ điển</h2>
          <p className="muted">
            {WORDS.length} thuật ngữ IT kèm phát âm, ví dụ trong ngữ cảnh và trạng thái ghi nhớ của bạn.
          </p>
        </div>
        <div className="search">
          <Search size={18} />
          <input
            className="text-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm từ… (vd: cache, triển khai)"
            aria-label="Tìm từ"
            spellCheck={false}
          />
        </div>
        <TopicPicker value={topic} onChange={setTopic} />
      </div>

      <div className="muted small">{list.length} từ</div>
      {list.length === 0 && (
        <div className="card center muted">
          <SearchX size={28} />
          <p>Không tìm thấy từ nào khớp “{query}”.</p>
        </div>
      )}
      <div className="dict">
        {list.map((w) => {
          const card = p.cards[w.id]
          const m = mastery(card)
          return (
            <div key={w.id} className={`dict-item ${open === w.id ? 'open' : ''}`}>
              <div className="dict-row">
                <SpeakButton onSpeak={() => sayWord(w)} />
                <button className="dict-toggle" aria-expanded={open === w.id} onClick={() => toggle(w.id)}>
                  <span className="dict-word">{w.word}</span>
                  <span className="ipa small">{w.ipa}</span>
                  <span className="dict-vi">{w.vi}</span>
                  <span
                    className={`status ${m}`}
                    title={card ? `Ôn lại: ${new Date(card.due).toLocaleDateString('vi-VN')}` : undefined}
                  >
                    {MASTERY_LABEL[m]}
                  </span>
                </button>
              </div>
              {open === w.id && <WordCard word={w} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
