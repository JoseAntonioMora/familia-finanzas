// api/notify.js — Vercel Serverless Function (proxy seguro para OneSignal)
// Esta función corre en el servidor, no en el navegador, por eso no tiene CORS

const ONESIGNAL_APP_ID   = "9ea361b9-599f-4eb8-931e-3e474e5be900";
const ONESIGNAL_REST_KEY = "a2rw4rh7fukpuqmr2mu66xm3i";

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { titulo, mensaje, tipo } = req.body;
  const emoji = tipo === "gasto" ? "🛒" : "💰";

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
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

    const data = await response.json();

    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
