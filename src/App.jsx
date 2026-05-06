import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Gastos       from "./pages/Gastos.jsx";
import Ingresos     from "./pages/Ingresos.jsx";
import Resumen      from "./pages/Resumen.jsx";
import Historial    from "./pages/Historial.jsx";
import Tarjetas     from "./pages/Tarjetas.jsx";
import GastosFijos  from "./pages/GastosFijos.jsx";
import Presupuestos from "./pages/Presupuestos.jsx";
import { suscribir, estasSuscrito } from "./notifications.js";

const SUPABASE_URL      = "https://aejfudvndqiabbglcoww.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlamZ1ZHZuZHFpYWJiZ2xjb3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Mjg3NjQsImV4cCI6MjA5MzQwNDc2NH0.zKGekLns3ywFHWlkxp8YyDrm6PM8m_FO5uiapnf8Kx4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const NAV_PRINCIPAL = [
  { id:"resumen",    icon:"📊", label:"Resumen"   },
  { id:"ingresos",   icon:"💰", label:"Ingresos"  },
  { id:"gastos",     icon:"🛒", label:"Gastos"    },
  { id:"historial",  icon:"📋", label:"Historial" },
  { id:"mas",        icon:"⋯",  label:"Más"       },
];

const NAV_MAS = [
  { id:"tarjetas",    icon:"💳", label:"Tarjetas"    },
  { id:"fijos",       icon:"📌", label:"Gastos Fijos" },
  { id:"presupuesto", icon:"🎯", label:"Presupuesto"  },
];

export default function App() {
  const [page,          setPage]          = useState("resumen");
  const [menuMas,       setMenuMas]       = useState(false);
  const [notifActivas,  setNotifActivas]  = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    setTimeout(async () => {
      const activas = await estasSuscrito();
      setNotifActivas(activas);
      if (!activas && !localStorage.getItem("notif_descartado")) setBannerVisible(true);
    }, 1500);
  }, []);

  async function activarNotificaciones() {
    const ok = await suscribir();
    setNotifActivas(ok);
    setBannerVisible(false);
  }

  function navegar(id) {
    if (id === "mas") { setMenuMas(!menuMas); return; }
    setPage(id);
    setMenuMas(false);
  }

  const todasLasPaginas = [...NAV_PRINCIPAL.filter(n=>n.id!=="mas"), ...NAV_MAS];
  const paginaActual    = todasLasPaginas.find(n => n.id === page);

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#fdf6f0", minHeight:"100vh", maxWidth:480, margin:"0 auto", position:"relative", paddingBottom:88 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#f9c5d1 0%,#fde8d8 100%)", padding:"20px 20px 16px", borderBottomLeftRadius:24, borderBottomRightRadius:24, boxShadow:"0 4px 20px rgba(249,197,209,0.4)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:28 }}>🏡</span>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:"#6b3a4a" }}>Mi Familia</div>
              <div style={{ fontSize:12, color:"#b07080", fontWeight:600 }}>
                {paginaActual ? `${paginaActual.icon} ${paginaActual.label}` : "Control de Finanzas"}
              </div>
            </div>
          </div>
          <button onClick={notifActivas ? null : activarNotificaciones} style={{ background:notifActivas?"#edfbf3":"#fff0f3", border:"none", borderRadius:12, padding:"8px 10px", cursor:notifActivas?"default":"pointer", fontSize:18, lineHeight:1 }}>
            {notifActivas ? "🔔" : "🔕"}
          </button>
        </div>
      </div>

      {/* Banner notificaciones */}
      {bannerVisible && (
        <div style={{ margin:"12px 16px 0", background:"linear-gradient(135deg,#f9c5d1,#fde8d8)", borderRadius:16, padding:"12px 14px", display:"flex", gap:10, alignItems:"center", boxShadow:"0 2px 12px rgba(249,197,209,0.5)" }}>
          <span style={{ fontSize:24, flexShrink:0 }}>🔔</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"#6b3a4a" }}>¿Activar notificaciones?</div>
            <div style={{ fontSize:11, color:"#b07080", marginTop:2 }}>Recibe un aviso cuando Fer o Toño registren un movimiento</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
            <button onClick={activarNotificaciones} style={{ background:"#e87a9b", border:"none", borderRadius:10, padding:"6px 12px", color:"#fff", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>Activar</button>
            <button onClick={() => { setBannerVisible(false); localStorage.setItem("notif_descartado","1"); }} style={{ background:"transparent", border:"none", color:"#b07080", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>Ahora no</button>
          </div>
        </div>
      )}

      {/* Menú "Más" desplegable */}
      {menuMas && (
        <div style={{ margin:"12px 16px 0", background:"#fff", borderRadius:18, border:"1px solid #f5e6ea", boxShadow:"0 8px 30px rgba(0,0,0,0.12)", overflow:"hidden" }}>
          {NAV_MAS.map(n => (
            <button key={n.id} onClick={() => navegar(n.id)} style={{ width:"100%", padding:"14px 18px", border:"none", borderBottom:"1px solid #faf0f3", background:page===n.id?"#fff0f3":"#fff", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
              <span style={{ fontSize:22 }}>{n.icon}</span>
              <span style={{ fontSize:15, fontWeight:700, color:page===n.id?"#e87a9b":"#6b3a4a" }}>{n.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Contenido */}
      <div style={{ padding:"16px 16px 0" }}>
        {page==="resumen"    && <Resumen      supabase={supabase}/>}
        {page==="ingresos"   && <Ingresos     supabase={supabase}/>}
        {page==="gastos"     && <Gastos       supabase={supabase}/>}
        {page==="historial"  && <Historial    supabase={supabase}/>}
        {page==="tarjetas"   && <Tarjetas     supabase={supabase}/>}
        {page==="fijos"      && <GastosFijos  supabase={supabase}/>}
        {page==="presupuesto"&& <Presupuestos supabase={supabase}/>}
      </div>

      {/* Bottom Nav */}
      <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"#fff", borderTop:"1px solid #f5e6ea", display:"flex", justifyContent:"space-around", padding:"8px 0 16px", boxShadow:"0 -4px 20px rgba(0,0,0,0.06)", zIndex:100 }}>
        {NAV_PRINCIPAL.map(nav => {
          const activo = nav.id==="mas" ? menuMas : page===nav.id;
          return (
            <button key={nav.id} onClick={() => navegar(nav.id)} style={{ background:activo?"#fff0f3":"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"4px 10px", borderRadius:12, transition:"background 0.2s" }}>
              <span style={{ fontSize:20 }}>{nav.icon}</span>
              <span style={{ fontSize:10, fontWeight:activo?800:600, color:activo?"#e87a9b":"#b0a0a8" }}>{nav.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}