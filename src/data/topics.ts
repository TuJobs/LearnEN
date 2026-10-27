import type { Topic, TopicId } from '../types'

export const TOPICS: Topic[] = [
  { id: 'basics', name: 'Lập trình cơ bản', en: 'Programming basics' },
  { id: 'git', name: 'Git & làm việc nhóm', en: 'Version control' },
  { id: 'web', name: 'Web & API', en: 'Web & API' },
  { id: 'db', name: 'Cơ sở dữ liệu', en: 'Databases' },
  { id: 'devops', name: 'DevOps & Cloud', en: 'DevOps & Cloud' },
  { id: 'testing', name: 'Test & Debug', en: 'Testing & Debugging' },
  { id: 'agile', name: 'Agile & họp hành', en: 'Agile & Meetings' },
  { id: 'review', name: 'Code review', en: 'Code review' },
  { id: 'security', name: 'Bảo mật', en: 'Security' },
  { id: 'ai', name: 'AI & Machine Learning', en: 'AI & ML' },
  { id: 'slang', name: 'Viết tắt & tiếng lóng dev', en: 'Dev slang' },
  { id: 'frontend', name: 'Frontend & UI', en: 'Frontend & UI' },
  { id: 'email', name: 'Email & làm việc với khách', en: 'Client communication' },
]

export const topicById = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicId, Topic>
