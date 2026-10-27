import {
  Activity,
  Award,
  Bandage,
  Brain,
  Bug,
  CalendarDays,
  ChartColumn,
  Check,
  ChevronRight,
  FileCode2,
  Flame,
  FlaskConical,
  LibraryBig,
  Play,
  Repeat,
  Sparkles,
  TreeDeciduous,
  Lock,
  X,
  type LucideIcon,
} from 'lucide-react'
import { TOPICS } from '../data/topics'
import { WORDS } from '../data/words'
import { TOPIC_ICON } from '../components/icons'
import { ProgressBar, SectionTitle, SpeakButton, StatTile, sayWord } from '../components/ui'
import { BADGES, dailyPlan, levelOf, streak, type PlanStep } from '../lib/gamify'
import { dueIds } from '../lib/pick'
import { DAY } from '../lib/srs'
import { updateSettings, useProgress, type DayStat } from '../lib/store'
import { dayKey } from '../lib/text'
import { navOf, type Route } from '../routes'

const WEEKS = 40

const greeting = (h: number) =>
  h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

const METHODS: { icon: LucideIcon; tone: string; title: string; text: string }[] = [
  { icon: Repeat, tone: 'blue', title: 'Spaced Repetition', text: 'SM-2 nhắc lại mỗi từ đúng lúc bạn sắp quên: 1 → 3 → 8 → 20 ngày…' },
  { icon: Brain, tone: 'violet', title: 'Active Recall', text: 'Tự gõ ra từ thay vì chỉ nhìn — truy xuất chủ động giúp nhớ lâu hơn đọc lại.' },
  { icon: FileCode2, tone: 'green', title: 'Học trong ngữ cảnh', text: 'Từ xuất hiện trong commit, PR, Slack, error log — đúng nơi bạn gặp khi đi làm.' },
  { icon: Bug, tone: 'red', title: 'Học từ lỗi sai', text: 'Debug những lỗi Vietglish thay vì học ngữ pháp khô khan.' },
  { icon: Sparkles, tone: 'yellow', title: 'Gamification', text: 'XP, combo, streak và lên cấp từ Intern tới CTO để giữ thói quen.' },
]

export function Dashboard({ go }: { go: (r: Route) => void }) {
  const p = useProgress()
  const due = dueIds(p).length
  const cards = Object.values(p.cards)
  const mature = cards.filter((c) => c.interval >= 21).length
  const lvl = levelOf(p.xp)
  const today = p.days[dayKey()]?.xp ?? 0
  const answered = p.stats.correct + p.stats.wrong
  const accuracy = answered ? Math.round((p.stats.correct / answered) * 100) : 0
  const unlocked = BADGES.filter((b) => p.badges[b.id]).length
  const leeches = WORDS.filter((w) => (p.cards[w.id]?.lapses ?? 0) >= 2)
    .sort((a, b) => p.cards[b.id].lapses - p.cards[a.id].lapses)
    .slice(0, 12)

  return (
    <div className="stack">
      {!p.settings.onboarded && cards.length === 0 && <Welcome go={go} goal={p.settings.dailyGoal} batch={p.settings.newPerSession} />}

      <section className="card hero">
        <div className="hero-main">
          <div className="muted">{greeting(new Date().getHours())} 👋</div>
          <div className="hero-level">
            <span className="avatar-tile lg">{lvl.current.icon}</span>
            <div>
              <h2 className="title">{lvl.current.title}</h2>
              <div className="muted small">
                {lvl.next ? `Còn ${lvl.next.min - p.xp} XP để lên ${lvl.next.icon} ${lvl.next.title}` : 'Đỉnh cao sự nghiệp!'}
              </div>
            </div>
          </div>
          <ProgressBar value={lvl.progress} label="Tiến độ lên cấp" />
          <WordOfDay />
          <div className="hero-stats">
            <div className="mini-stat">
              <b>
                <Flame size={18} color="var(--orange)" /> {streak(p.days)}
              </b>
              <span>ngày liên tiếp</span>
            </div>
            <div className="mini-stat">
              <b>
                <GoalRing value={today / p.settings.dailyGoal} /> {today}
              </b>
              <span>/ {p.settings.dailyGoal} XP hôm nay</span>
            </div>
            <div className="mini-stat">
              <b>
                <Repeat size={18} color="var(--accent)" /> {due}
              </b>
              <span>thẻ đến hạn</span>
            </div>
          </div>
        </div>
        <DailyPlan steps={dailyPlan(p, due)} go={go} />
      </section>

      <section className="stat-grid">
        <StatTile icon={LibraryBig} tone="blue" value={`${cards.length}/${WORDS.length}`} label="từ đã học" />
        <StatTile icon={TreeDeciduous} tone="green" value={mature} label="từ thành thạo" />
        <StatTile icon={Activity} tone="violet" value={`${accuracy}%`} label="tỉ lệ trả lời đúng" />
        <StatTile icon={Award} tone="yellow" value={`${unlocked}/${BADGES.length}`} label="huy hiệu" />
      </section>

      <section className="card">
        <SectionTitle icon={CalendarDays} aside={`${countActive(p.days)} ngày học trong ${WEEKS} tuần`}>
          Contribution graph
        </SectionTitle>
        <Heatmap days={p.days} goal={p.settings.dailyGoal} />
        <button className="btn ghost" onClick={() => go('stats')}>
          <ChartColumn size={16} /> Thống kê chi tiết <ChevronRight size={16} />
        </button>
      </section>

      <section className="card">
        <SectionTitle icon={FlaskConical} aside={`${cards.length}/${WORDS.length} từ`}>
          Tiến độ theo chủ đề
        </SectionTitle>
        <div className="topic-grid">
          {TOPICS.map((t) => {
            const words = WORDS.filter((w) => w.topic === t.id)
            const learned = words.filter((w) => p.cards[w.id]).length
            const Icon = TOPIC_ICON[t.id]
            return (
              <div key={t.id} className="topic-row">
                <span className={`icon-tile ${learned === words.length ? 'tone-green' : ''}`}>
                  <Icon size={17} />
                </span>
                <div>
                  <div className="topic-name">
                    <span>{t.name}</span>
                    <span className="muted mono small">
                      {learned}/{words.length}
                    </span>
                  </div>
                  <div className="row">
                    <ProgressBar value={learned / words.length} tone="green" label={`Đã học ${t.name}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {leeches.length > 0 && (
        <section className="card">
          <SectionTitle icon={Bandage}>Từ hay quên</SectionTitle>
          <p className="muted small">Những từ bạn quên từ 2 lần trở lên — được ưu tiên trong ôn tập và mini-game. Bấm để nghe lại.</p>
          <div className="chips" style={{ margin: '12px 0 14px' }}>
            {leeches.map((w) => (
              <button key={w.id} className="chip" onClick={() => sayWord(w)} title={w.vi}>
                {w.word} <span className="chip-count">×{p.cards[w.id].lapses}</span>
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => go('cloze')}>
            Luyện ngay với Code Cloze <ChevronRight size={16} />
          </button>
        </section>
      )}

      <section className="card">
        <SectionTitle icon={Award} aside={`${unlocked}/${BADGES.length}`}>
          Huy hiệu
        </SectionTitle>
        <div className="badges">
          {BADGES.map((b) => {
            const on = !!p.badges[b.id]
            return (
              <div key={b.id} className={`badge ${on ? 'on' : ''}`} title={b.desc}>
                {!on && <Lock size={14} className="badge-lock" />}
                <span className="badge-icon">{b.icon}</span>
                <b>{b.name}</b>
                <span className="muted small">{b.desc}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card">
        <SectionTitle icon={Sparkles}>Vì sao cách học này hiệu quả?</SectionTitle>
        <div className="methods">
          {METHODS.map(({ icon: Icon, tone, title, text }) => (
            <div key={title} className="method-card">
              <span className={`icon-tile tone-${tone}`}>
                <Icon size={18} />
              </span>
              <b>{title}</b>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const GOALS = [
  { xp: 30, label: 'Thong thả', time: '~5 phút' },
  { xp: 50, label: 'Đều đặn', time: '~10 phút' },
  { xp: 100, label: 'Nghiêm túc', time: '~20 phút' },
]

function Welcome({ go, goal, batch }: { go: (r: Route) => void; goal: number; batch: number }) {
  const finish = (route?: Route) => {
    updateSettings({ onboarded: true })
    if (route) go(route)
  }
  return (
    <section className="card welcome">
      <button className="icon-btn welcome-close" onClick={() => finish()} aria-label="Đóng lời chào">
        <X size={18} />
      </button>
      <div className="welcome-head">
        <img src="./favicon.svg" alt="" />
        <div>
          <h2 className="title">Chào mừng tới LearnEN 👋</h2>
          <p className="muted">Tiếng Anh IT cho dev Việt — mỗi ngày khoảng 15 phút, nhớ lâu nhờ ôn đúng lúc.</p>
        </div>
      </div>
      <ol className="howto">
        <li>Học vài từ mới mỗi ngày: nghe phát âm, xem ví dụ trong code, commit, Slack.</li>
        <li>Ôn tập khi đến hạn — thuật toán nhắc đúng lúc bạn sắp quên.</li>
        <li>Chơi game để luyện nghe, gõ, ráp câu và sửa lỗi Vietglish.</li>
      </ol>
      <div>
        <div className="field-label">Mục tiêu mỗi ngày</div>
        <div className="segmented" role="radiogroup" aria-label="Mục tiêu mỗi ngày">
          {GOALS.map((g) => (
            <button key={g.xp} role="radio" aria-checked={goal === g.xp} className={goal === g.xp ? 'active' : ''} onClick={() => updateSettings({ dailyGoal: g.xp })}>
              {g.label} · {g.time}
            </button>
          ))}
        </div>
      </div>
      <div className="row">
        <button className="btn primary big" onClick={() => finish('learn')}>
          <Play size={18} fill="currentColor" /> Học {batch} từ đầu tiên
        </button>
        <button className="btn ghost" onClick={() => finish()}>
          Để sau
        </button>
      </div>
    </section>
  )
}

/** A different word every day, so opening the app always teaches something. */
function WordOfDay() {
  const w = WORDS[Math.floor(Date.parse(dayKey()) / DAY) % WORDS.length]
  return (
    <div className="wotd">
      <span className="field-label">Từ của ngày</span>
      <div className="row">
        <b className="wotd-word">{w.word}</b>
        <span className="ipa small">{w.ipa}</span>
        <SpeakButton onSpeak={() => sayWord(w)} />
      </div>
      <span className="muted small">{w.vi}</span>
    </div>
  )
}

function DailyPlan({ steps, go }: { steps: PlanStep[]; go: (r: Route) => void }) {
  const next = steps.find((s) => !s.done)
  return (
    <div className="plan">
      <div className="row spread">
        <h3>Bài học hôm nay</h3>
        <span className="muted small">~15 phút</span>
      </div>
      <ol className="plan-steps">
        {steps.map((s) => {
          const Icon = navOf(s.route).icon
          return (
            <li key={s.route}>
              <button className={s.done ? 'done' : s === next ? 'current' : ''} onClick={() => go(s.route)}>
                <span className="plan-check">{s.done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}</span>
                <span className="plan-label">{s.label}</span>
                <span className="muted small">{s.detail}</span>
                <ChevronRight size={16} />
              </button>
            </li>
          )
        })}
      </ol>
      {next ? (
        <button className="btn primary big block" onClick={() => go(next.route)}>
          <Play size={18} fill="currentColor" /> Tiếp tục: {next.label}
        </button>
      ) : (
        <div className="verdict correct">
          <Check size={18} />
          <div className="verdict-text">
            <b className="verdict-label">Xong bài học hôm nay! 🎉</b> Hẹn gặp lại ngày mai để giữ streak.
          </div>
        </div>
      )}
    </div>
  )
}

function GoalRing({ value }: { value: number }) {
  const r = 7
  const c = 2 * Math.PI * r
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="ring" aria-hidden>
      <circle cx="10" cy="10" r={r} className="ring-bg" />
      <circle cx="10" cy="10" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} />
    </svg>
  )
}

const countActive = (days: Record<string, DayStat>) => {
  const since = dayKey(Date.now() - WEEKS * 7 * DAY)
  return Object.entries(days).filter(([k, d]) => k >= since && d.xp > 0).length
}

const CELL = 18 // 14px cell + 4px gap

function Heatmap({ days, goal }: { days: Record<string, DayStat>; goal: number }) {
  // On narrow screens the graph scrolls horizontally: start at the most recent weeks.
  const scrollToEnd = (el: HTMLDivElement | null) => {
    if (el) el.scrollLeft = el.scrollWidth
  }
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  // Start on a Monday so each column is one week.
  const start = today.getTime() - ((today.getDay() + 6) % 7) * DAY - (WEEKS - 1) * 7 * DAY
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => start + i * DAY).filter((t) => t <= today.getTime())
  const level = (xp: number) => (xp <= 0 ? 0 : xp < goal / 2 ? 1 : xp < goal ? 2 : xp < goal * 2 ? 3 : 4)
  const months = Array.from({ length: WEEKS }, (_, w) => new Date(start + w * 7 * DAY))
    .map((d, w, all) => ({ w, label: `Th${d.getMonth() + 1}`, show: w > 0 && d.getMonth() !== all[w - 1].getMonth() }))
    .filter((m) => m.show && m.w < WEEKS - 1)
  const todayKey = dayKey()

  return (
    <>
      <div className="heatmap-wrap" ref={scrollToEnd} tabIndex={0} role="region" aria-label="Lịch sử ngày học (cuộn ngang)">
        <div className="heat-days" aria-hidden>
          {['T2', '', 'T4', '', 'T6', '', ''].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div>
          <div className="heat-months" aria-hidden>
            {months.map((m) => (
              <span key={m.w} style={{ left: m.w * CELL }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="heatmap">
            {cells.map((t) => {
              const key = dayKey(t)
              const xp = days[key]?.xp ?? 0
              return <div key={key} className={`heat l${level(xp)} ${key === todayKey ? 'today' : ''}`} title={`${key}: ${xp} XP`} />
            })}
          </div>
        </div>
      </div>
      <div className="heat-legend" aria-hidden>
        Ít
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`heat l${l}`} />
        ))}
        Nhiều
      </div>
    </>
  )
}
