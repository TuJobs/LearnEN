import { Activity, BookOpen, CalendarClock, CalendarDays, Flame, Layers, Repeat, Target, TrendingUp, Zap } from 'lucide-react'
import { WORDS } from '../data/words'
import { ChartTable, ColumnChart, LineChart, StackedBar, type Segment } from '../components/charts'
import { SectionTitle, StatTile } from '../components/ui'
import { streak } from '../lib/gamify'
import { DAY, MASTERY_LABEL } from '../lib/srs'
import { forecast, longestStreak, masteryCounts, recentDays } from '../lib/stats'
import { useProgress } from '../lib/store'
import type { Route } from '../routes'

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const ddmm = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
const dayLabel = (d: Date) => `${WEEKDAY[d.getDay()]}, ${ddmm(d)}`

export function Stats({ go }: { go: (r: Route) => void }) {
  const p = useProgress()
  const cards = Object.values(p.cards)
  const now = Date.now()

  const due = forecast(cards, 14, now).map((value, i) => {
    const date = new Date(now + i * DAY)
    return { key: String(i), date, value, label: i === 0 ? 'Hôm nay (gồm thẻ quá hạn)' : dayLabel(date) }
  })
  const peakDue = due.reduce((best, d, i) => (d.value > due[best].value ? i : best), 0)

  const recent = recentDays(p.days, 30, now)
  const xp = recent.map((d) => ({ key: d.key, date: d.date, label: dayLabel(d.date), value: d.stat?.xp ?? 0 }))
  const peakXp = xp.reduce((best, d, i) => (d.value > xp[best].value ? i : best), 0)
  const accuracy = recent.map((d) => {
    const answered = (d.stat?.correct ?? 0) + (d.stat?.wrong ?? 0)
    return { key: d.key, date: d.date, label: dayLabel(d.date), value: answered ? Math.round(((d.stat?.correct ?? 0) / answered) * 100) : null }
  })

  const m = masteryCounts(cards, WORDS.length)
  const segments: Segment[] = (['new', 'learning', 'young', 'mature'] as const).map((k) => ({
    key: k,
    label: MASTERY_LABEL[k],
    value: m[k],
    color: `--m-${k}`,
    ink: `--m-${k}-ink`,
  }))

  const answered = p.stats.correct + p.stats.wrong
  const activeDays = Object.values(p.days).filter((d) => d.xp > 0).length

  return (
    <div className="stack">
      <div>
        <h2 className="title">Thống kê</h2>
        <p className="muted">Nhìn lại quá trình học và biết trước khối lượng ôn tập những ngày tới.</p>
      </div>

      <section className="stat-grid">
        <StatTile icon={Zap} tone="yellow" value={p.xp.toLocaleString('vi-VN')} label="tổng XP" />
        <StatTile icon={Repeat} tone="blue" value={p.stats.reviews} label="lượt ôn tập" />
        <StatTile icon={Flame} tone="orange" value={`${longestStreak(p.days)} ngày`} label={`chuỗi dài nhất · hiện tại ${streak(p.days)}`} />
        <StatTile icon={Activity} tone="violet" value={answered ? `${Math.round((p.stats.correct / answered) * 100)}%` : '—'} label={`trả lời đúng · ${activeDays} ngày học`} />
      </section>

      <section className="card">
        <SectionTitle icon={CalendarClock} aside="14 ngày tới">
          Dự báo ôn tập
        </SectionTitle>
        {cards.length ? (
          <>
            <p className="muted small">Số thẻ đến hạn mỗi ngày. Ôn đều mỗi ngày để không bị dồn việc.</p>
            <ColumnChart
              data={due}
              title="Số thẻ đến hạn trong 14 ngày tới"
              unit="thẻ"
              anchor="start"
              labeled={[...new Set([0, peakDue])]}
              tick={(_, i) => (i === 0 ? 'Nay' : ddmm(due[i].date))}
            />
            <ChartTable head={['Ngày', 'Số thẻ']} rows={due.map((d) => [d.label, d.value])} />
          </>
        ) : (
          <Empty go={go} text="Chưa có thẻ nào trong lịch ôn — hãy học vài từ đầu tiên." />
        )}
      </section>

      <section className="card">
        <SectionTitle icon={TrendingUp} aside="30 ngày qua">
          XP mỗi ngày
        </SectionTitle>
        <ColumnChart
          data={xp}
          title="XP mỗi ngày trong 30 ngày qua"
          unit="XP"
          labeled={xp[peakXp].value > 0 ? [peakXp] : []}
          goal={{ value: p.settings.dailyGoal, label: `Mục tiêu ${p.settings.dailyGoal} XP` }}
          tick={(_, i) => ddmm(xp[i].date)}
        />
        <ChartTable head={['Ngày', 'XP']} rows={xp.map((d) => [d.label, d.value])} />
      </section>

      <section className="card">
        <SectionTitle icon={Target} aside="30 ngày qua">
          Độ chính xác
        </SectionTitle>
        {accuracy.some((d) => d.value !== null) ? (
          <>
            <LineChart
              data={accuracy}
              title="Tỉ lệ trả lời đúng mỗi ngày trong 30 ngày qua"
              max={100}
              format={(v) => `${v}%`}
              tick={(_, i) => ddmm(accuracy[i].date)}
            />
            <ChartTable head={['Ngày', 'Trả lời đúng']} rows={accuracy.map((d) => [d.label, d.value === null ? '—' : `${d.value}%`])} />
          </>
        ) : (
          <Empty go={go} text="Chưa có câu trả lời nào trong 30 ngày qua." />
        )}
      </section>

      <section className="card">
        <SectionTitle icon={Layers} aside={`${WORDS.length} từ`}>
          Mức ghi nhớ
        </SectionTitle>
        <p className="muted small">
          <b className="text">Thành thạo</b> = khoảng cách ôn ≥ 21 ngày — từ đã vào trí nhớ dài hạn.
        </p>
        <StackedBar segments={segments} title="Số từ theo mức ghi nhớ" unit="từ" />
        <ChartTable head={['Mức', 'Số từ']} rows={segments.map((s) => [s.label, s.value])} />
      </section>

      <p className="muted small row">
        <CalendarDays size={14} /> Dữ liệu chỉ lưu trên trình duyệt này — xuất file trong Cài đặt để sao lưu.
      </p>
    </div>
  )
}

function Empty({ go, text }: { go: (r: Route) => void; text: string }) {
  return (
    <div className="viz-empty">
      <p className="muted">{text}</p>
      <button className="btn" onClick={() => go('learn')}>
        <BookOpen size={16} /> Học từ mới
      </button>
    </div>
  )
}
