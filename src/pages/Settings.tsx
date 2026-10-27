import { CircleCheck, Database, Download, Monitor, Moon, Palette, Play, Smartphone, Sun, Target, Trash2, Upload, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useId, useState, type ChangeEvent, type ReactNode } from 'react'
import { SectionTitle } from '../components/ui'
import { isStandalone, promptInstall, useCanInstall } from '../lib/pwa'
import { englishVoices, onVoicesChanged, speak } from '../lib/speech'
import { exportProgress, importProgress, resetProgress, updateSettings, useProgress } from '../lib/store'
import { dayKey } from '../lib/text'
import { toast } from '../lib/toast'

function Setting({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div className="setting">
      <div>
        <label htmlFor={id}>
          <b>{label}</b>
        </label>
        {hint && <span className="muted small">{hint}</span>}
      </div>
      <div>{children(id)}</div>
    </div>
  )
}

export function Settings() {
  const { settings } = useProgress()
  const [voices, setVoices] = useState(englishVoices)
  const canInstall = useCanInstall()

  useEffect(() => onVoicesChanged(() => setVoices(englishVoices())), [])

  function download() {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `learnen-progress-${dayKey()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      importProgress(await file.text())
      toast('✅ Đã khôi phục tiến độ')
    } catch (err) {
      toast(`❌ ${err instanceof Error ? err.message : 'Không đọc được file'}`)
    }
  }

  function reset() {
    if (confirm('Xoá toàn bộ tiến độ học? Hành động này không thể hoàn tác (hãy xuất file sao lưu trước).')) {
      resetProgress()
      toast('🧹 Đã xoá tiến độ')
    }
  }

  return (
    <div className="stack">
      <h2 className="title">Cài đặt</h2>

      <section className="card">
        <SectionTitle icon={Target}>Mục tiêu</SectionTitle>
        <Setting label="XP mỗi ngày" hint="Đạt mục tiêu để vòng tròn hôm nay chuyển xanh.">
          {(id) => (
            <select id={id} value={settings.dailyGoal} onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}>
              <option value={30}>30 XP — Thong thả (~5 phút)</option>
              <option value={50}>50 XP — Đều đặn (~10 phút)</option>
              <option value={100}>100 XP — Nghiêm túc (~20 phút)</option>
              <option value={200}>200 XP — Hardcore (~40 phút)</option>
            </select>
          )}
        </Setting>
        <Setting label="Số từ mới mỗi lượt" hint="Ít mà đều hiệu quả hơn nhiều mà bỏ dở.">
          {(id) => (
            <select id={id} value={settings.newPerSession} onChange={(e) => updateSettings({ newPerSession: Number(e.target.value) })}>
              {[3, 5, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} từ
                </option>
              ))}
            </select>
          )}
        </Setting>
      </section>

      <section className="card">
        <SectionTitle icon={Volume2}>Giọng đọc</SectionTitle>
        <Setting label="Giọng" hint="Tự động chọn giọng tự nhiên nhất trên máy bạn.">
          {(id) => (
            <select id={id} value={settings.voiceURI} onChange={(e) => updateSettings({ voiceURI: e.target.value })}>
              <option value="">Tự động{voices[0] ? ` — ${voices[0].name}` : ''}</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          )}
        </Setting>
        <Setting label={`Tốc độ: ${settings.rate.toFixed(1)}x`}>
          {(id) => (
            <input
              id={id}
              type="range"
              min={0.5}
              max={1.3}
              step={0.1}
              value={settings.rate}
              onChange={(e) => updateSettings({ rate: Number(e.target.value) })}
            />
          )}
        </Setting>
        <button className="btn" onClick={() => speak("Let's refactor this function before we merge the pull request.")}>
          <Play size={16} /> Nghe thử
        </button>
      </section>

      <section className="card">
        <SectionTitle icon={Volume2}>Hiệu ứng</SectionTitle>
        <Setting label="Âm thanh & rung" hint="Tiếng “ting” khi đúng, “bụp” khi sai, nhạc khi lên cấp; rung nhẹ trên điện thoại.">
          {(id) => (
            <div className="segmented" role="radiogroup" id={id} aria-label="Âm thanh và rung">
              <button role="radio" aria-checked={settings.sound} className={settings.sound ? 'active' : ''} onClick={() => updateSettings({ sound: true })}>
                <Volume2 size={15} /> Bật
              </button>
              <button role="radio" aria-checked={!settings.sound} className={!settings.sound ? 'active' : ''} onClick={() => updateSettings({ sound: false })}>
                <VolumeX size={15} /> Tắt
              </button>
            </div>
          )}
        </Setting>
      </section>

      <section className="card">
        <SectionTitle icon={Palette}>Giao diện</SectionTitle>
        <div className="segmented" role="radiogroup" aria-label="Giao diện">
          <button
            role="radio"
            aria-checked={settings.theme === 'dark'}
            className={settings.theme === 'dark' ? 'active' : ''}
            onClick={() => updateSettings({ theme: 'dark' })}
          >
            <Moon size={15} /> Tối
          </button>
          <button
            role="radio"
            aria-checked={settings.theme === 'light'}
            className={settings.theme === 'light' ? 'active' : ''}
            onClick={() => updateSettings({ theme: 'light' })}
          >
            <Sun size={15} /> Sáng
          </button>
          <button
            role="radio"
            aria-checked={settings.theme === 'system'}
            className={settings.theme === 'system' ? 'active' : ''}
            onClick={() => updateSettings({ theme: 'system' })}
          >
            <Monitor size={15} /> Theo hệ thống
          </button>
        </div>
      </section>

      <section className="card">
        <SectionTitle icon={Smartphone}>Cài app</SectionTitle>
        {isStandalone() ? (
          <p className="row muted small">
            <CircleCheck size={16} color="var(--green)" /> Bạn đang dùng LearnEN dạng app — học được cả khi không có mạng.
          </p>
        ) : canInstall ? (
          <>
            <p className="muted small">Cài LearnEN lên máy để mở nhanh như app và học offline (trên xe buýt, máy bay…).</p>
            <button className="btn primary" onClick={promptInstall}>
              <Download size={16} /> Cài LearnEN
            </button>
          </>
        ) : (
          <p className="muted small">
            Sau khi build và deploy, LearnEN chạy được offline và cài được như app: trên Chrome/Edge bấm biểu tượng cài đặt ở thanh
            địa chỉ; trên iPhone mở bằng Safari → Chia sẻ → <b>Thêm vào MH chính</b>.
          </p>
        )}
      </section>

      <section className="card">
        <SectionTitle icon={Database}>Dữ liệu</SectionTitle>
        <p className="muted small">Tiến độ được lưu trong trình duyệt (localStorage). Xuất file để sao lưu hoặc chuyển sang máy khác.</p>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={download}>
            <Download size={16} /> Xuất tiến độ
          </button>
          <label className="btn">
            <Upload size={16} /> Nhập tiến độ
            <input type="file" accept="application/json" hidden onChange={upload} />
          </label>
          <button className="btn danger" onClick={reset}>
            <Trash2 size={16} /> Xoá tiến độ
          </button>
        </div>
      </section>
    </div>
  )
}
