/*
 * Service Worker: hält alle Dateien des Programms auf dem Gerät vor, damit die
 * installierte App ohne Internet startet. Antwortet sofort aus dem Vorrat und
 * holt im Hintergrund die aktuelle Fassung – sie gilt ab dem nächsten Start.
 *
 * Kommt eine Datei dazu, hier eintragen und CACHE hochzählen.
 */
const CACHE = 'kurs-planer-v1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/config.js',
  'js/elements.js',
  'js/editor.js',
  'js/export.js',
  'js/file.js',
  'js/app.js',
  'vendor/konva.min.js',
  'vendor/jspdf.umd.min.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached || Response.error());
      if (!cached) return fresh;
      event.waitUntil(fresh);             // im Hintergrund aktualisieren
      return cached;
    })
  );
});
