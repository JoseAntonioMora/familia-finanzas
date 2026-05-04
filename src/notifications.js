// ─────────────────────────────────────────────────────────────────────────────
// notifications.js — Integración con OneSignal
// ⚠️ REEMPLAZA "TU_ONESIGNAL_APP_ID" con tu App ID de OneSignal
// ─────────────────────────────────────────────────────────────────────────────
const ONESIGNAL_APP_ID = "9ea361b9-599f-4eb8-931e-3e474e5be900";

// Inicializa OneSignal (llama esto una vez al cargar la app)
export async function initNotifications() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones");
    return;
  }

  // Carga el SDK de OneSignal dinámicamente
  await loadOneSignalSDK();

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      safari_web_id: "web.onesignal.auto." + ONESIGNAL_APP_ID,
      notifyButton: { enable: false }, // usamos nuestro propio botón
      allowLocalhostAsSecureOrigin: true, // para desarrollo local
    });
  });
}

function loadOneSignalSDK() {
  return new Promise((resolve, reject) => {
    if (document.getElementById("onesignal-sdk")) { resolve(); return; }
    const s = document.createElement("script");
    s.id = "onesignal-sdk";
    s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    s.defer = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Pide permiso y suscribe al usuario
export async function suscribir() {
  if (!window.OneSignal) return false;
  try {
    await window.OneSignal.Notifications.requestPermission();
    const granted = window.OneSignal.Notifications.permission;
    return granted;
  } catch (e) {
    console.error("Error al suscribir:", e);
    return false;
  }
}

// Verifica si ya está suscrito
export async function estasSuscrito() {
  if (!window.OneSignal) return false;
  try {
    return window.OneSignal.Notifications.permission;
  } catch { return false; }
}

// Envía notificación a TODOS los usuarios suscritos via OneSignal REST API
// ⚠️ Esto normalmente va en un backend, pero como son solo 2 usuarios
//    usamos la REST API directamente con la clave de solo-lectura de OneSignal.
//    REEMPLAZA "TU_ONESIGNAL_REST_API_KEY" con tu REST API Key.
const ONESIGNAL_REST_KEY = "a2rw4rh7fukpuqmr2mu66xm3i";

export async function enviarNotificacion({ titulo, mensaje, tipo }) {
  try {
    const emoji = tipo === "gasto" ? "🛒" : "💰";
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Total Subscriptions"], // envía a todos los suscritos
        headings: { es: `${emoji} ${titulo}` },
        contents: { es: mensaje },
        small_icon: "ic_stat_onesignal_default",
        large_icon: "/icon-192.png",
      }),
    });
  } catch (e) {
    console.error("Error enviando notificación:", e);
  }
}
