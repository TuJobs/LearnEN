import { getProgress } from './store'

const synth: SpeechSynthesis | undefined = typeof window !== 'undefined' ? window.speechSynthesis : undefined

// macOS ships joke and legacy robot voices tagged en-US (Bubbles, Zarvox, Fred...): useless for pronunciation.
const NOVELTY =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|fred|junior|kathy|ralph|grandma|grandpa|rocko|shelley|sandy|flo|eddy|reed)\b/i

type VoiceInfo = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'voiceURI'>

function voiceScore(v: VoiceInfo): number {
  let score = v.lang === 'en-US' ? 2 : v.lang.startsWith('en-GB') ? 1 : 0
  if (/google|natural|neural|premium|enhanced|siri/i.test(v.name)) score += 4
  if (/samantha|ava|allison|aria|jenny|zira/i.test(v.name)) score += 2
  return score
}

const usable = (v: VoiceInfo) => v.lang.toLowerCase().startsWith('en') && !NOVELTY.test(v.name)

/** English voices worth learning from, most natural-sounding first. */
export function rankVoices<V extends VoiceInfo>(voices: V[]): V[] {
  return voices.filter(usable).sort((a, b) => voiceScore(b) - voiceScore(a))
}

/** The saved voice if it is still installed, otherwise the best available one. */
export function pickVoice<V extends VoiceInfo>(voices: V[], preferredURI = ''): V | undefined {
  const ranked = rankVoices(voices)
  return ranked.find((v) => v.voiceURI === preferredURI) ?? ranked[0]
}

export const englishVoices = (): SpeechSynthesisVoice[] => (synth ? rankVoices(synth.getVoices()) : [])

export function onVoicesChanged(cb: () => void): () => void {
  synth?.addEventListener('voiceschanged', cb)
  return () => synth?.removeEventListener('voiceschanged', cb)
}

/** Reads English text aloud with the voice and speed chosen in Settings. */
export function speak(text: string, rate?: number) {
  if (!synth) return
  const { voiceURI, rate: baseRate } = getProgress().settings
  const voice = pickVoice(synth.getVoices(), voiceURI)
  const u = new SpeechSynthesisUtterance(text)
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? 'en-US'
  u.rate = rate ?? baseRate
  synth.cancel()
  synth.speak(u)
}

// Minimal typing for the Web Speech recognition API (prefixed in Chrome/Safari, absent in Firefox).
interface Recognition {
  lang: string
  maxAlternatives: number
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
}
type RecognitionCtor = new () => Recognition

function recognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export const canListen = !!recognitionCtor()

/** Records one utterance and resolves with the recognizer's guesses (best first). */
export function listen(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const Ctor = recognitionCtor()
    if (!Ctor) return reject(new Error('unsupported'))
    const r = new Ctor()
    r.lang = 'en-US'
    r.maxAlternatives = 5
    r.interimResults = false
    let heard: string[] = []
    r.onresult = (e) => {
      heard = Array.from(e.results[0] ?? [], (a) => a.transcript)
    }
    r.onerror = (e) => reject(new Error(e.error))
    r.onend = () => resolve(heard)
    r.start()
  })
}
