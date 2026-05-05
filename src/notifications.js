// ─────────────────────────────────────────────────────────────────────────────
// notifications.js — Integración con OneSignal (patrón correcto para Vite/React)
// ─────────────────────────────────────────────────────────────────────────────
const ONESIGNAL_APP_ID   = "9ea361b9-599f-4eb8-931e-3e474e5be900";
const ONESIGNAL_REST_KEY = "a2rw4rh7fukpuqmr2mu66xm3i";

let initPromise = null;

// Carga el script de OneSignal y espera a que esté listo
function cargarSDK() {
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    // Si ya está cargado, úsalo directo
    if (window.OneSignal && window.OneSignal.initialized) {
      resolve(window.OneSignal);
      return;
    }

    // Prepara la cola antes de cargar el script
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    // Inyecta el script
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;

    script.onload = () => {
      // El SDK está disponible — lo inicializamos
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: true,
          });
          console.log("✅ OneSignal inicializado");
          resolve(OneSignal);
        } catch (err) {
          console.error("❌ Error iniciando OneSignal:", err);
          reject(err);
        }
      });
    };

    script.onerror = (err) => {
      console.error("❌ No se pudo cargar el SDK de OneSignal:", err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return initPromise;
}

// Inicializa (llamar una vez al arrancar la app)
export async function initNotifications() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) {
    console.warn("Notificaciones no soportadas en este navegador");
    return;
  }
  try {
    await cargarSDK();
  } catch (e) {
    console.warn("OneSignal no disponible:", e);
  }
}

// Pide permiso al usuario y lo suscribe
export async function suscribir() {
  try {
    const OneSignal = await cargarSDK();
    await OneSignal.Notifications.requestPermission();
    const ok = OneSignal.Notifications.permission;
    if (ok) console.log("✅ Suscrito a notificaciones");
    return ok;
  } catch (e) {
    console.error("Error al suscribir:", e);
    return false;
  }
}

// Verifica si el usuario ya tiene permiso activo
export async function estasSuscrito() {
  try {
    const OneSignal = await cargarSDK();
    return OneSignal.Notifications.permission;
  } catch {
    return false;
  }
}

// Envía notificación push a todos los suscritos
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
    if (data.errors) {
      console.error("❌ OneSignal error:", data.errors);
    } else {
      console.log("✅ Notificación enviada, id:", data.id);
    }
  } catch (e) {
    console.error("❌ Error enviando notificación:", e);
  }
}