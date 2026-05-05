const CACHE = "finanzas-v2";
//const ASSETS = ["/", "/index.html"];
const ASSETS = [];

// ── Instalación ──────────────────────────────────────────────────────────────
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activación ───────────────────────────────────────────────────────────────
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch (cache-first para assets, network-first para Supabase) ─────────────
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("supabase.co")) return;
  if (e.request.url.includes("onesignal.com")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── Push Notifications (OneSignal las maneja internamente,
//    pero por si acaso también las capturamos aquí) ───────────────────────────
self.addEventListener("push", e => {
  if (!e.data) return;
  let data;
  try { data = e.data.json(); } catch { data = { title: "Mi Familia", body: e.data.text() }; }

  e.waitUntil(
    self.registration.showNotification(data.title || "Mi Familia 🏡", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "finanzas",
      data: data.url ? { url: data.url } : {},
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(clients.openWindow(url));
});