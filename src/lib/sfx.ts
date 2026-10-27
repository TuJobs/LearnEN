import { getProgress } from './store'

let audio: AudioContext | undefined

type Note = [freq: number, start: number, duration: number]

function play(notes: Note[], type: OscillatorType = 'sine', volume = 0.06) {
  if (!getProgress().settings.sound || typeof AudioContext === 'undefined') return
  audio ??= new AudioContext()
  if (audio.state === 'suspended') void audio.resume()
  const t0 = audio.currentTime
  for (const [freq, start, duration] of notes) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t0 + start)
    gain.gain.exponentialRampToValueAtTime(volume, t0 + start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + duration)
    osc.connect(gain).connect(audio.destination)
    osc.start(t0 + start)
    osc.stop(t0 + start + duration + 0.02)
  }
}

const vibrate = (pattern: number | number[]) => {
  if (getProgress().settings.sound) navigator.vibrate?.(pattern)
}

/** Tiny synthesized UI sounds: no audio files, so they cost nothing and work offline. */
export const sfx = {
  correct: () => play([[880, 0, 0.1], [1320, 0.07, 0.16]]),
  wrong: () => {
    play([[220, 0, 0.12], [165, 0.09, 0.2]], 'triangle', 0.08)
    vibrate(40)
  },
  fanfare: () => {
    play([[523, 0, 0.14], [659, 0.1, 0.14], [784, 0.2, 0.14], [1047, 0.3, 0.32]], 'triangle', 0.05)
    vibrate([30, 40, 30])
  },
}
