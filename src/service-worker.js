/* Service worker template — the build fills in the cache version and file list (see vite.config.ts). */
const CACHE = 'learnen-__VERSION__'
const FILES = __FILES__

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('learnen-') && k !== CACHE).map((k) => caches.delete(k)))),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  // Pages: network first so a new release shows up right away; the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')))
    return
  }
  // Built assets have content hashes in their names, so the cached copy is always valid. Vary is
  // ignored because module scripts are requested with an Origin header the precache never sent.
  event.respondWith(caches.match(request, { ignoreVary: true }).then((hit) => hit ?? fetch(request)))
})
