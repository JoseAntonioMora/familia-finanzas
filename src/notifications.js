const ONESIGNAL_APP_ID   = "9ea361b9-599f-4eb8-931e-3e474e5be900";
const ONESIGNAL_REST_KEY = "a2rw4rh7fukpuqmr2mu66xm3i";

let initPromise = null;

function cargarSDK() {
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    if (window.OneSignal?.initialized) { resolve(window.OneSignal); return; }

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;

    script.onload = () => {
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerParam: { scope: "/" },
            serviceWorkerPath: "OneSignalSDKWorker.js", // único SW
          });
          console.log("✅ OneSignal inicializado");
          resolve(OneSignal);
        } catch (err) {
          console.error("❌ Error OneSignal init:", err);
          reject(err);
        }
      });
    };

    script.onerror = reject;
    document.head.appendChild(script);
  });

  return initPromise;
}

export async function initNotifications() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  try { await cargarSDK(); } catch (e) { console.warn("OneSignal no disponible:", e); }
}

export async function suscribir() {
  try {
    const OneSignal = await cargarSDK();
    await OneSignal.Notifications.requestPermission();
    const ok = OneSignal.Notifications.permission;
    if (ok) console.log("✅ Suscrito a notificaciones");
    return ok;
  } catch (e) { console.error("Error al suscribir:", e); return false; }
}

export async function estasSuscrito() {
  try {
    const OneSignal = await cargarSDK();
    return OneSignal.Notifications.permission;
  } catch { return false; }
}

export async function enviarNotificacion({ titulo, mensaje, tipo }) {
  const emoji = tipo === "gasto" ? "🛒" : "💰";
  try {
    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Total Subscriptions"],
        headings: { es: `${emoji} ${titulo}`, en: `${emoji} ${titulo}` },
        contents: { es: mensaje, en: mensaje },
        large_icon: "https://familia-finanzas-seven.vercel.app/icon-192.png",
      }),
    });
    const data = await res.json();
    if (data.errors) console.error("❌ OneSignal error:", data.errors);
    else console.log("✅ Notificación enviada, id:", data.id);
  } catch (e) { console.error("❌ Error enviando notificación:", e); }
}