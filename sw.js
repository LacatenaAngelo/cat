// Prima prova a scaricare la versione aggiornata; se non c'è rete (o è troppo lenta) usa la copia salvata.
const CACHE = "controllo-abbonamenti";
const ATTESA_MS = 4000;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const rete = fetch(e.request, { cache: "no-store" }).then(r => {
      if (r.ok) cache.put(e.request, r.clone());
      return r;
    });
    const scaduto = new Promise(ok => setTimeout(ok, ATTESA_MS));
    const salvata = cache.match(e.request, { ignoreSearch: true });
    try {
      const vince = await Promise.race([rete, scaduto.then(() => salvata)]);
      if (vince) return vince;
      return await rete;
    } catch {
      return (await salvata) || Response.error();
    }
  })());
});
