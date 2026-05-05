const ONESIGNAL_APP_ID   = "9ea361b9-599f-4eb8-931e-3e474e5be900";
const ONESIGNAL_REST_KEY = process.env.ONESIGNAL_REST_KEY; // ← desde variable de entorno

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { titulo, mensaje, tipo } = req.body;
  const emoji = tipo === "gasto" ? "🛒" : "💰";

  // Log para debug — verás esto en Vercel Functions logs
  console.log("Enviando notificación:", { titulo, mensaje, tipo });
  console.log("App ID:", ONESIGNAL_APP_ID);
  console.log("Key definida:", !!ONESIGNAL_REST_KEY);

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
    console.log("Respuesta OneSignal:", JSON.stringify(data));

    if (data.errors) return res.status(400).json({ error: data.errors });
    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    console.error("Error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}