import { ChevronRight, Star } from 'lucide-react'
import { dailyPlan } from '../lib/gamify'
import { dueIds } from '../lib/pick'
import { useProgress } from '../lib/store'
import { GAMES, type Route } from '../routes'

export function Arcade({ go }: { go: (r: Route) => void }) {
  const p = useProgress()
  const todaysGame = dailyPlan(p, dueIds(p).length)[2].route

  return (
    <div className="stack">
      <div>
        <h2 className="title">Arcade</h2>
        <p className="muted">Vừa chơi vừa học: mỗi game luyện một kỹ năng khác nhau và ưu tiên những từ bạn hay quên.</p>
      </div>
      <div className="game-grid">
        {GAMES.map(({ route, icon: Icon, label, desc, tone }) => (
          <button key={route} className="card game-card" onClick={() => go(route)}>
            {route === todaysGame && (
              <span className="game-tag">
                <Star size={12} fill="currentColor" /> Hôm nay
              </span>
            )}
            <span className={`icon-tile lg tone-${tone}`}>
              <Icon size={26} />
            </span>
            <h3>{label}</h3>
            <p>{desc}</p>
            <span className="card-foot">
              Chơi ngay <ChevronRight size={16} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
