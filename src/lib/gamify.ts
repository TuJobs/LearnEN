import { WORDS } from '../data/words'
import { SCENARIOS } from '../data/scenarios'
import { navOf, type Route } from '../routes'
import { DAY } from './srs'
import type { DayStat, Progress } from './store'
import { dayKey } from './text'

/** Career ladder of a Vietnamese dev — your English levels up with you. */
export const LEVELS = [
  { title: 'Intern', min: 0, icon: '🐣' },
  { title: 'Fresher', min: 150, icon: '🌱' },
  { title: 'Junior Dev', min: 500, icon: '💻' },
  { title: 'Middle Dev', min: 1200, icon: '⚙️' },
  { title: 'Senior Dev', min: 2500, icon: '🚀' },
  { title: 'Tech Lead', min: 5000, icon: '🧭' },
  { title: 'Architect', min: 9000, icon: '🏛️' },
  { title: 'CTO', min: 15000, icon: '👑' },
]

export function levelOf(xp: number) {
  let index = LEVELS.length - 1
  while (index > 0 && xp < LEVELS[index].min) index--
  const current = LEVELS[index]
  const next = LEVELS[index + 1]
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1
  return { index, current, next, progress }
}

/** Consecutive active days, counting back from today (or from yesterday if today is still empty). */
export function streak(days: Record<string, DayStat>, now: number = Date.now()): number {
  const d = new Date(now)
  const active = () => (days[dayKey(d.getTime())]?.xp ?? 0) > 0
  if (!active()) d.setDate(d.getDate() - 1)
  let n = 0
  while (active()) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

const matureCount = (p: Progress) => Object.values(p.cards).filter((c) => c.interval >= 21).length

export interface Badge {
  id: string
  icon: string
  name: string
  desc: string
  test: (p: Progress) => boolean
}

export const BADGES: Badge[] = [
  { id: 'hello', icon: '👋', name: 'Hello, World!', desc: 'Học từ vựng đầu tiên', test: (p) => p.stats.learned >= 1 },
  { id: 'first-commit', icon: '📝', name: 'First Commit', desc: 'Hoàn thành lượt ôn tập đầu tiên', test: (p) => p.stats.reviews >= 1 },
  { id: 'vocab-50', icon: '📦', name: 'npm install vocab', desc: 'Học 50 từ', test: (p) => p.stats.learned >= 50 },
  { id: 'vocab-all', icon: '🧠', name: 'Full Stack', desc: 'Học toàn bộ từ vựng', test: (p) => Object.keys(p.cards).length >= WORDS.length },
  { id: 'streak-3', icon: '🔥', name: 'On Fire', desc: 'Học 3 ngày liên tiếp', test: (p) => streak(p.days) >= 3 },
  { id: 'streak-7', icon: '📅', name: 'Weekly Release', desc: 'Học 7 ngày liên tiếp', test: (p) => streak(p.days) >= 7 },
  { id: 'streak-30', icon: '🏆', name: 'LTS Version', desc: 'Học 30 ngày liên tiếp', test: (p) => streak(p.days) >= 30 },
  { id: 'combo-10', icon: '⚡', name: '10x Engineer', desc: 'Combo 10 câu đúng liên tiếp', test: (p) => p.stats.bestCombo >= 10 },
  { id: 'perfect', icon: '✅', name: 'All Tests Passed', desc: 'Hoàn thành một game không sai câu nào', test: (p) => p.stats.perfect >= 1 },
  { id: 'bug-20', icon: '🐛', name: 'Bug Hunter', desc: 'Tìm ra 20 lỗi Vietglish', test: (p) => p.stats.bugsFound >= 20 },
  { id: 'scenarios', icon: '🎭', name: 'Soft Skills Unlocked', desc: 'Hoàn thành mọi tình huống hội thoại', test: (p) => Object.keys(p.scenarios).length >= SCENARIOS.length },
  { id: 'speak-10', icon: '🎙️', name: 'Native Speaker (beta)', desc: 'Phát âm đúng 10 từ', test: (p) => p.stats.spoken >= 10 },
  { id: 'mature-25', icon: '🌳', name: 'Long-term Memory', desc: '25 từ đạt mức Thành thạo', test: (p) => matureCount(p) >= 25 },
  {
    id: 'night-owl', icon: '🦉', name: 'Night Owl', desc: 'Học sau 23 giờ',
    test: (p) => {
      const h = new Date().getHours()
      return (h >= 23 || h < 4) && (p.days[dayKey()]?.xp ?? 0) > 0
    },
  },
]

const GAME_ROTATION: Route[] = ['cloze', 'bugs', 'builder', 'match', 'dictation', 'scenario']

export interface PlanStep {
  route: Route
  label: string
  detail: string
  done: boolean
}

/** Today's ~15-minute routine: clear due reviews → learn new words → one game (rotates daily). */
export function dailyPlan(p: Progress, dueCount: number, now: number = Date.now()): PlanStep[] {
  const key = dayKey(now)
  const learned = p.days[key]?.learned ?? 0
  const played = p.days[key]?.games ?? 0
  const goal = p.settings.newPerSession
  const unlearned = WORDS.length - Object.keys(p.cards).length
  const game = GAME_ROTATION[Math.floor(Date.parse(key) / DAY) % GAME_ROTATION.length]
  return [
    {
      route: 'review',
      label: 'Ôn tập thẻ đến hạn',
      detail: dueCount ? `còn ${dueCount} thẻ` : 'không còn thẻ nào',
      done: dueCount === 0,
    },
    {
      route: 'learn',
      label: `Học ${goal} từ mới`,
      detail: unlearned ? `${Math.min(learned, goal)}/${goal}` : 'đã học hết từ vựng',
      done: learned >= goal || unlearned === 0,
    },
    {
      route: game,
      label: `Chơi ${navOf(game).label}`,
      detail: played ? `đã chơi ${played} ván` : 'game của hôm nay',
      done: played > 0,
    },
  ]
}
