// Service worker: guarda o jogo inteiro no aparelho para abrir offline.
// files.json é gerado por scripts/build-site.sh com a lista de todos os arquivos publicados.
// Estratégia: responde do cache na hora e atualiza em segundo plano; a versão nova vale na próxima abertura.
const CACHE = 'nanquim-v3';

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const files = await (await fetch('files.json', { cache: 'no-store' })).json();
    await cache.addAll(['./', ...files]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then((res) => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    if (hit) { e.waitUntil(fresh); return hit; }
    return fresh;
  })());
});
