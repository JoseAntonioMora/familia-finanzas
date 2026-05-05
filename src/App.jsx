import { useState, useEffect } from "react";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import Gastos from "./pages/Gastos.jsx";
import Ingresos from "./pages/Ingresos.jsx";
import Resumen from "./pages/Resumen.jsx";
import Historial from "./pages/Historial.jsx";
import { suscribir, estasSuscrito } from "./notifications.js";

// ⚠️ REEMPLAZA con tus credenciales de Supabase
const SUPABASE_URL = "https://aejfudvndqiabbglcoww.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlamZ1ZHZuZHFpYWJiZ2xjb3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Mjg3NjQsImV4cCI6MjA5MzQwNDc2NH0.zKGekLns3ywFHWlkxp8YyDrm6PM8m_FO5uiapnf8Kx4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [page, setPage] = useState("resumen");
  const [notifActivas, setNotifActivas] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    // Revisa si ya están activas las notificaciones
    setTimeout(async () => {
      const activas = await estasSuscrito();
      setNotifActivas(activas);
      // Muestra banner solo si no se han activado y no se ha descartado antes
      if (!activas && !localStorage.getItem("notif_descartado")) {
        setBannerVisible(true);
      }
    }, 1500);
  }, []);

  async function activarNotificaciones() {
    const ok = await suscribir();
    setNotifActivas(ok);
    setBannerVisible(false);
  }

  function descartarBanner() {
    setBannerVisible(false);
    localStorage.setItem("notif_descartado", "1");
  }
 
  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#fdf6f0", minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 88 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
 
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #f9c5d1 0%, #fde8d8 100%)", padding: "20px 20px 16px", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: "0 4px 20px rgba(249,197,209,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>🏡</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#6b3a4a" }}>Mi Familia</div>
              <div style={{ fontSize: 12, color: "#b07080", fontWeight: 600 }}>Control de Finanzas</div>
            </div>
          </div>
          {/* Botón campana */}
          <button
            onClick={notifActivas ? null : activarNotificaciones}
            title={notifActivas ? "Notificaciones activas" : "Activar notificaciones"}
            style={{ background: notifActivas ? "#edfbf3" : "#fff0f3", border: "none", borderRadius: 12, padding: "8px 10px", cursor: notifActivas ? "default" : "pointer", fontSize: 18, lineHeight: 1 }}
          >
            {notifActivas ? "🔔" : "🔕"}
          </button>
        </div>
      </div>

      {/* Banner de notificaciones */}
      {bannerVisible && (
        <div style={{ margin: "12px 16px 0", background: "linear-gradient(135deg,#f9c5d1,#fde8d8)", borderRadius: 16, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 2px 12px rgba(249,197,209,0.5)" }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#6b3a4a" }}>¿Activar notificaciones?</div>
            <div style={{ fontSize: 11, color: "#b07080", marginTop: 2 }}>Recibe un aviso cuando Fer o Toño registren un movimiento</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <button onClick={activarNotificaciones} style={{ background: "#e87a9b", border: "none", borderRadius: 10, padding: "6px 12px", color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              Activar
            </button>
            <button onClick={descartarBanner} style={{ background: "transparent", border: "none", color: "#b07080", fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              Ahora no
            </button>
          </div>
        </div>
      )}
 
      {/* Page Content */}
      <div style={{ padding: "16px 16px 0" }}>
        {page === "gastos"    && <Gastos    supabase={supabase} />}
        {page === "ingresos"  && <Ingresos  supabase={supabase} />}
        {page === "resumen"   && <Resumen   supabase={supabase} />}
        {page === "historial" && <Historial supabase={supabase} />}
      </div>
 
      {/* Bottom Nav — 4 tabs */}
      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #f5e6ea", display: "flex", justifyContent: "space-around", padding: "8px 0 16px", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)", zIndex: 100 }}>
        {[
          { id: "resumen",   icon: "📊", label: "Resumen"  },
          { id: "ingresos",  icon: "💰", label: "Ingresos" },
          { id: "gastos",    icon: "🛒", label: "Gastos"   },
          { id: "historial", icon: "📋", label: "Historial" },
        ].map(nav => (
          <button key={nav.id} onClick={() => setPage(nav.id)} style={{ background: page === nav.id ? "#fff0f3" : "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", borderRadius: 12, transition: "background 0.2s" }}>
            <span style={{ fontSize: 20 }}>{nav.icon}</span>
            <span style={{ fontSize: 10, fontWeight: page === nav.id ? 800 : 600, color: page === nav.id ? "#e87a9b" : "#b0a0a8" }}>{nav.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}