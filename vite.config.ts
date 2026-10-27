import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** Emits sw.js with every built file precached, so the whole app works offline after one visit. */
function serviceWorker(): Plugin {
  return {
    name: 'learnen:service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const publicFiles = readdirSync('public', { recursive: true, encoding: 'utf8' }).filter(
        (f) => !f.split('/').pop()!.startsWith('.') && statSync(join('public', f)).isFile(),
      )
      const files = ['./', ...[...Object.keys(bundle), ...publicFiles].map((f) => `./${f}`)]
      const template = readFileSync('src/service-worker.js', 'utf8')
      const hash = createHash('sha256').update(template)
      for (const out of Object.values(bundle)) hash.update(out.type === 'chunk' ? out.code : out.source)
      const source = template
        .replace('__VERSION__', hash.digest('hex').slice(0, 12))
        .replace('__FILES__', JSON.stringify(files, null, 2))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({
  // Relative paths + hash routing: the build works from any sub-folder (e.g. GitHub Pages).
  base: './',
  plugins: [react(), serviceWorker()],
})
