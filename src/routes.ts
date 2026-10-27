import {
  BookOpen,
  Bug,
  ChartColumn,
  Gamepad2,
  GitMerge,
  Hammer,
  Headphones,
  LayoutDashboard,
  Library,
  MessagesSquare,
  Mic,
  Puzzle,
  Repeat,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  route: string
  icon: LucideIcon
  label: string
  /** Short label for the mobile tab bar */
  short?: string
  /** One-line pitch shown on game cards */
  desc?: string
  /** Accent color of the game card */
  tone?: string
}

export const NAV = [
  { route: 'home', icon: LayoutDashboard, label: 'Dashboard', short: 'Home' },
  { route: 'learn', icon: BookOpen, label: 'Học từ mới', short: 'Học' },
  { route: 'review', icon: Repeat, label: 'Ôn tập', short: 'Ôn tập' },
  { route: 'arcade', icon: Gamepad2, label: 'Arcade', short: 'Game' },
  { route: 'match', icon: GitMerge, label: 'Merge Pairs', tone: 'blue', desc: 'Ghép thuật ngữ với nghĩa, đua tốc độ và combo.' },
  { route: 'cloze', icon: Puzzle, label: 'Code Cloze', tone: 'green', desc: 'Điền từ còn thiếu vào commit, PR, Slack, code comment.' },
  { route: 'dictation', icon: Headphones, label: 'Listen & Type', tone: 'violet', desc: 'Nghe và gõ lại từ hoặc cả câu — luyện tai và chính tả.' },
  { route: 'bugs', icon: Bug, label: 'Vietglish Debugger', tone: 'red', desc: 'Tìm lỗi tiếng Anh người Việt hay mắc trong câu.' },
  { route: 'scenario', icon: MessagesSquare, label: 'Tình huống thực tế', tone: 'yellow', desc: 'Nhập vai stand-up, code review, phỏng vấn, báo sự cố.' },
  { route: 'speak', icon: Mic, label: 'Phát âm chuẩn', tone: 'orange', desc: 'Sửa các từ dev Việt hay đọc sai, máy chấm giọng nói.' },
  { route: 'builder', icon: Hammer, label: 'Sentence Compiler', tone: 'cyan', desc: 'Ráp từ thành câu đúng trật tự — chữa tật dịch từng chữ.' },
  { route: 'dict', icon: Library, label: 'Từ điển', short: 'Từ điển' },
  { route: 'stats', icon: ChartColumn, label: 'Thống kê' },
  { route: 'settings', icon: Settings, label: 'Cài đặt' },
] as const satisfies readonly NavItem[]

export type Route = (typeof NAV)[number]['route']

export const navOf = (route: Route): NavItem => NAV.find((n) => n.route === route)!

export const GAMES = NAV.filter((n): n is Extract<(typeof NAV)[number], { desc: string }> => 'desc' in n)

/** Tabs of the mobile bottom bar (the sidebar shows everything on larger screens). */
export const MOBILE_TABS: Route[] = ['home', 'learn', 'review', 'arcade', 'dict']
