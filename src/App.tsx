import { ChevronRight, Flame, Moon, Settings as SettingsIcon, Sun, Target } from 'lucide-react'
import { Suspense, lazy, useEffect, useRef, type ReactNode } from 'react'
import { ProgressBar } from './components/ui'
import { levelOf, streak } from './lib/gamify'
import { useMediaQuery, useRoute } from './lib/hooks'
import { dueIds } from './lib/pick'
import { sfx } from './lib/sfx'
import { updateSettings, useProgress } from './lib/store'
import { dayKey } from './lib/text'
import { useToasts } from './lib/toast'
import { Dashboard } from './pages/Dashboard'
import { GAMES, MOBILE_TABS, navOf, type Route } from './routes'

// Every page except the dashboard is its own chunk, prefetched once the browser is idle
// so the first load stays small and switching pages never waits on the network.
const chunks = {
  learn: () => import('./pages/Learn').then((m) => ({ default: m.Learn })),
  review: () => import('./pages/Review').then((m) => ({ default: m.Review })),
  arcade: () => import('./pages/Arcade').then((m) => ({ default: m.Arcade })),
  match: () => import('./pages/Match').then((m) => ({ default: m.Match })),
  cloze: () => import('./pages/Cloze').then((m) => ({ default: m.Cloze })),
  dictation: () => import('./pages/Dictation').then((m) => ({ default: m.Dictation })),
  bugs: () => import('./pages/Bugs').then((m) => ({ default: m.Bugs })),
  scenario: () => import('./pages/Scenario').then((m) => ({ default: m.Scenario })),
  speak: () => import('./pages/Speak').then((m) => ({ default: m.Speak })),
  builder: () => import('./pages/Builder').then((m) => ({ default: m.Builder })),
  stats: () => import('./pages/Stats').then((m) => ({ default: m.Stats })),
  dict: () => import('./pages/Dictionary').then((m) => ({ default: m.Dictionary })),
  settings: () => import('./pages/Settings').then((m) => ({ default: m.Settings })),
}
const Learn = lazy(chunks.learn)
const Review = lazy(chunks.review)
const Arcade = lazy(chunks.arcade)
const Match = lazy(chunks.match)
const Cloze = lazy(chunks.cloze)
const Dictation = lazy(chunks.dictation)
const Bugs = lazy(chunks.bugs)
const Scenario = lazy(chunks.scenario)
const Speak = lazy(chunks.speak)
const Builder = lazy(chunks.builder)
const Stats = lazy(chunks.stats)
const Dictionary = lazy(chunks.dict)
const Settings = lazy(chunks.settings)

const prefetch = () => Object.values(chunks).forEach((load) => void load())

const SIDEBAR: { section?: string; sectionRoute?: Route; items: Route[] }[] = [
  { items: ['home', 'learn', 'review'] },
  { section: 'Arcade', sectionRoute: 'arcade', items: GAMES.map((g) => g.route) },
  { section: 'Khác', items: ['dict', 'stats', 'settings'] },
]

export function App() {
  const [route, go] = useRoute()
  const p = useProgress()
  const due = dueIds(p).length
  const lvl = levelOf(p.xp)
  const today = p.days[dayKey()]?.xp ?? 0
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = p.settings.theme === 'system' ? (prefersDark ? 'dark' : 'light') : p.settings.theme
  const { icon: PageIcon, label: pageLabel } = navOf(route)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#ffffff' : '#11161f')
  }, [theme])

  const shownLevel = useRef(lvl.index)
  useEffect(() => {
    if (lvl.index > shownLevel.current) sfx.fanfare()
    shownLevel.current = lvl.index
  }, [lvl.index])

  useEffect(() => {
    if ('requestIdleCallback' in window) requestIdleCallback(prefetch)
    else setTimeout(prefetch, 1500)
  }, [])

  const pages: Record<Route, ReactNode> = {
    home: <Dashboard go={go} />,
    learn: <Learn go={go} />,
    review: <Review go={go} />,
    arcade: <Arcade go={go} />,
    match: <Match />,
    cloze: <Cloze />,
    dictation: <Dictation />,
    bugs: <Bugs />,
    scenario: <Scenario />,
    speak: <Speak />,
    builder: <Builder />,
    stats: <Stats go={go} />,
    dict: <Dictionary />,
    settings: <Settings />,
  }

  const badge = (r: Route) => (r === 'review' && due > 0 ? <span className="nav-badge">{due}</span> : null)

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src="./favicon.svg" alt="" />
          <div>
            <b>LearnEN</b>
            <small>Tiếng Anh IT cho dev Việt</small>
          </div>
        </div>
        <nav aria-label="Điều hướng chính">
          {SIDEBAR.map((group) => (
            <div key={group.items[0]}>
              {group.sectionRoute ? (
                <button className="nav-section" onClick={() => go(group.sectionRoute!)}>
                  {group.section} <ChevronRight size={14} />
                </button>
              ) : (
                group.section && <div className="nav-section">{group.section}</div>
              )}
              {group.items.map((r) => {
                const { icon: Icon, label } = navOf(r)
                return (
                  <button
                    key={r}
                    className={`nav-item ${route === r ? 'active' : ''}`}
                    onClick={() => go(r)}
                    aria-current={route === r ? 'page' : undefined}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {badge(r)}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <button className="level-card" onClick={() => go('home')}>
          <div className="row">
            <span className="avatar-tile">{lvl.current.icon}</span>
            <div>
              <b>{lvl.current.title}</b>
              <div className="muted small">
                {p.xp} XP{lvl.next && ` / ${lvl.next.min}`}
              </div>
            </div>
          </div>
          <ProgressBar value={lvl.progress} label="Tiến độ lên cấp" />
        </button>
      </aside>

      <main>
        <header className="topbar">
          <div className="page-title">
            <PageIcon size={18} aria-hidden />
            <h1>{pageLabel}</h1>
            <span className="path">~/learnen/{route}</span>
          </div>
          <div className="top-stats">
            <span className={`pill ${today > 0 ? 'hot' : ''}`} title="Chuỗi ngày học liên tiếp">
              <Flame size={15} /> {streak(p.days)}
            </span>
            <span className={`pill ${today >= p.settings.dailyGoal ? 'done' : ''}`} title="XP hôm nay / mục tiêu">
              <Target size={15} /> {today}/{p.settings.dailyGoal}
            </span>
            <span className="pill hide-sm" title={`${p.xp} XP`}>
              {lvl.current.icon} {lvl.current.title}
            </span>
            <button
              className="icon-btn theme-toggle"
              onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
              title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              aria-label="Đổi giao diện sáng/tối"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-btn mobile-only" onClick={() => go('settings')} aria-label="Cài đặt">
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        <div className="page" key={route}>
          <Suspense fallback={<p className="muted">Đang tải…</p>}>{pages[route]}</Suspense>
        </div>
      </main>

      <nav className="tabbar" aria-label="Điều hướng">
        {MOBILE_TABS.map((r) => {
          const { icon: Icon, label, short } = navOf(r)
          const active = route === r || (r === 'arcade' && GAMES.some((g) => g.route === route))
          return (
            <button key={r} className={`tab ${active ? 'active' : ''}`} onClick={() => go(r)} aria-label={label}>
              <Icon size={22} />
              {short ?? label}
              {badge(r)}
            </button>
          )
        })}
      </nav>

      <Toasts />
    </div>
  )
}

function Toasts() {
  const toasts = useToasts()
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.slice(-2).map((t) => (
        <div key={t.id} className="toast">
          {t.text}
        </div>
      ))}
    </div>
  )
}
