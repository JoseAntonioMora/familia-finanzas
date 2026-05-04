import { useState, useEffect } from "react";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import Gastos from "./pages/Gastos.jsx";
import Ingresos from "./pages/Ingresos.jsx";
import Resumen from "./pages/Resumen.jsx";
import Historial from "./pages/Historial.jsx";

// ⚠️ REEMPLAZA con tus credenciales de Supabase
const SUPABASE_URL = "https://aejfudvndqiabbglcoww.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlamZ1ZHZuZHFpYWJiZ2xjb3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Mjg3NjQsImV4cCI6MjA5MzQwNDc2NH0.zKGekLns3ywFHWlkxp8YyDrm6PM8m_FO5uiapnf8Kx4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [page, setPage] = useState("resumen");
 
  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#fdf6f0", minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 88 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
 
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #f9c5d1 0%, #fde8d8 100%)", padding: "20px 20px 16px", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: "0 4px 20px rgba(249,197,209,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🏡</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#6b3a4a" }}>Mi Familia</div>
            <div style={{ fontSize: 12, color: "#b07080", fontWeight: 600 }}>Control de Finanzas</div>
          </div>
        </div>
      </div>
 
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
          { id: "historial", icon: "📋", label: "Historial" },
          { id: "ingresos",  icon: "💰", label: "Ingresos" },
          { id: "gastos",    icon: "🛒", label: "Gastos"   },
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