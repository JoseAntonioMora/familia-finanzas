// OneSignal DEBE ser el primer import
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// ── Cache PWA (sin pre-cache para evitar errores en Vercel) ──────────────────
const CACHE = "finanzas-v4";

self.addEventListener("install", e => {
  self.skipWaiting(); // activa inmediatamente sin esperar cache
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache dinámico: guarda los recursos conforme se van usando
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("supabase.co")) return;
  if (e.request.url.includes("onesignal.com")) return;
  if (e.request.url.includes("googleapis.com")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Solo cachea respuestas válidas
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});