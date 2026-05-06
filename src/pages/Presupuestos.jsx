import { useState, useEffect } from "react";

const AREAS = [
  { id:"hogar",           label:"Hogar",        icon:"🏠", color:"#f9c5d1" },
  { id:"alimentacion",    label:"Alimentación",  icon:"🥦", color:"#c8f0dc" },
  { id:"transporte",      label:"Transporte",    icon:"🚗", color:"#c5d9f9" },
  { id:"salud",           label:"Salud",         icon:"💊", color:"#f9e5c5" },
  { id:"entretenimiento", label:"Salidas",       icon:"🎉", color:"#e5c5f9" },
  { id:"ahorro",          label:"Ahorro",        icon:"🐷", color:"#f9f0c5" },
  { id:"otros",           label:"Otros",         icon:"📦", color:"#ddd"    },
];

function fmt(n) {
  return new Intl.NumberFormat("es-MX", { style:"currency", currency:"MXN", minimumFractionDigits:0 }).format(n || 0);
}

export default function Presupuestos({ supabase }) {
  const [presupuestos, setPresupuestos] = useState({});
  const [gastos,       setGastos]       = useState([]);
  const [ingresos,     setIngresos]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [ingBase,      setIngBase]      = useState("");
  const [editando,     setEditando]     = useState(false);
  const [draft,        setDraft]        = useState({});
  const [toast,        setToast]        = useState("");

  const now    = new Date();
  const year   = now.getFullYear();
  const month  = now.getMonth();
  const iniMes = new Date(year, month, 1).toISOString().split("T")[0];
  const finMes = new Date(year, month+1, 0).toISOString().split("T")[0];

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: p }, { data: g }, { data: i }] = await Promise.all([
      supabase.from("presupuestos").select("*"),
      supabase.from("gastos").select("*").gte("fecha", iniMes).lte("fecha", finMes),
      supabase.from("ingresos").select("*").gte("fecha", iniMes).lte("fecha", finMes),
    ]);
    const pMap = {};
    (p || []).forEach(r => { pMap[r.area] = { id:r.id, porcentaje:r.porcentaje }; });
    setPresupuestos(pMap);
    setDraft(Object.fromEntries(Object.entries(pMap).map(([k,v]) => [k, v.porcentaje])));
    setGastos(g || []);
    setIngresos(i || []);
    setLoading(false);
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  const totalIngresos = ingresos.reduce((a,r) => a+(r.monto||0), 0);
  const ingresoBase   = ingBase ? parseFloat(ingBase) : totalIngresos;
  const totalPct      = Object.values(draft).reduce((a,v) => a+(parseFloat(v)||0), 0);

  async function handleGuardar() {
    if (totalPct > 100) { showToast("⚠️ El total supera el 100%"); return; }
    const updates = AREAS.map(a => {
      const pct = parseFloat(draft[a.id]) || 0;
      const existing = presupuestos[a.id];
      return existing
        ? supabase.from("presupuestos").update({ porcentaje: pct, updated_at: new Date().toISOString() }).eq("id", existing.id)
        : supabase.from("presupuestos").insert([{ area: a.id, porcentaje: pct }]);
    });
    await Promise.all(updates);
    showToast("✅ Presupuestos guardados");
    setEditando(false);
    fetchData();
  }

  if (loading) return <div style={{ textAlign:"center", padding:40, color:"#b07080" }}>Cargando... ✨</div>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#6b3a4a", margin:0 }}>Presupuesto 🎯</h2>
        <button onClick={() => setEditando(!editando)} style={{ background: editando ? "#fff0f3" : "linear-gradient(135deg,#f9c5d1,#e87a9b)", border: editando ? "1.5px solid #f9c5d1" : "none", borderRadius:12, padding:"8px 14px", color: editando ? "#e87a9b" : "#fff", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
          {editando ? "✕ Cancelar" : "✏️ Editar"}
        </button>
      </div>

      {/* Ingreso base */}
      <div style={{ background:"linear-gradient(135deg,#c8f0dc,#edfbf3)", borderRadius:16, padding:"12px 16px", marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#7aab8e", marginBottom:6 }}>BASE DE CÁLCULO (ingreso del mes)</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:18, color:"#4caf82", fontWeight:700 }}>$</span>
          <input
            type="number"
            value={ingBase}
            onChange={e => setIngBase(e.target.value)}
            placeholder={`${totalIngresos || 0} (ingreso real del mes)`}
            style={{ flex:1, border:"none", background:"transparent", fontSize:20, fontWeight:800, color:"#2d5a42", fontFamily:"Nunito,sans-serif", outline:"none" }}
          />
        </div>
        {!ingBase && totalIngresos > 0 && (
          <div style={{ fontSize:11, color:"#7aab8e", marginTop:4 }}>Usando ingreso real del mes: {fmt(totalIngresos)}</div>
        )}
      </div>

      {/* Total porcentaje */}
      <div style={{ background:"#fff", borderRadius:14, padding:"10px 14px", marginBottom:14, border:`1.5px solid ${totalPct>100?"#e87a9b":totalPct===100?"#4caf82":"#f5e6ea"}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#6b3a4a" }}>Total asignado</span>
        <div style={{ textAlign:"right" }}>
          <span style={{ fontSize:18, fontWeight:800, color:totalPct>100?"#e87a9b":totalPct===100?"#4caf82":"#6b3a4a" }}>{totalPct.toFixed(0)}%</span>
          {totalPct < 100 && <div style={{ fontSize:10, color:"#b07080" }}>{(100-totalPct).toFixed(0)}% sin asignar</div>}
          {totalPct > 100 && <div style={{ fontSize:10, color:"#e87a9b" }}>⚠️ Excede el 100%</div>}
        </div>
      </div>

      {/* Barra total */}
      <div style={{ background:"#f5eaee", borderRadius:20, height:8, overflow:"hidden", marginBottom:16 }}>
        <div style={{ height:"100%", width:`${Math.min(totalPct,100)}%`, background:totalPct>100?"#e87a9b":"linear-gradient(90deg,#a8e6c4,#4caf82)", borderRadius:20, transition:"width 0.4s" }}/>
      </div>

      {/* Áreas */}
      {AREAS.map(a => {
        const pct        = parseFloat(presupuestos[a.id]?.porcentaje || 0);
        const draftPct   = parseFloat(draft[a.id] || 0);
        const monto      = (ingresoBase * pct) / 100;
        const gastado    = gastos.filter(g => g.area===a.id && g.metodo!=="Crédito").reduce((s,r) => s+(r.monto||0), 0);
        const pctUsado   = monto > 0 ? Math.min((gastado / monto)*100, 100) : 0;
        const excede     = gastado > monto && monto > 0;

        return (
          <div key={a.id} style={{ background:"#fff", borderRadius:16, padding:"12px 14px", marginBottom:10, border:"1.5px solid #f5e6ea", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#6b3a4a" }}>{a.label}</div>
                {ingresoBase > 0 && (
                  <div style={{ fontSize:11, color:"#b07080" }}>
                    {fmt(gastado)} de {fmt(monto)}
                    {excede && <span style={{ color:"#e87a9b", fontWeight:700 }}> · ¡Excedido!</span>}
                  </div>
                )}
              </div>

              {editando ? (
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <input
                    type="number" min="0" max="100"
                    value={draft[a.id] || ""}
                    onChange={e => setDraft(d => ({ ...d, [a.id]: e.target.value }))}
                    style={{ width:56, padding:"6px 8px", borderRadius:10, border:"1.5px solid #f9c5d1", background:"#fff0f3", fontSize:15, fontWeight:800, color:"#e87a9b", fontFamily:"Nunito,sans-serif", outline:"none", textAlign:"center" }}
                  />
                  <span style={{ fontSize:14, fontWeight:700, color:"#e87a9b" }}>%</span>
                </div>
              ) : (
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:16, fontWeight:800, color:"#6b3a4a" }}>{pct}%</div>
                  {ingresoBase > 0 && <div style={{ fontSize:11, color:"#b07080" }}>{fmt(monto)}</div>}
                </div>
              )}
            </div>

            {ingresoBase > 0 && (
              <div style={{ background:"#f5eaee", borderRadius:20, height:6, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pctUsado}%`, background:excede?"#e87a9b":a.color, borderRadius:20, transition:"width 0.5s" }}/>
              </div>
            )}
          </div>
        );
      })}

      {editando && (
        <button onClick={handleGuardar} style={{ width:"100%", padding:"14px", borderRadius:14, background:"linear-gradient(135deg,#f9c5d1,#e87a9b)", color:"#fff", fontWeight:800, fontSize:16, border:"none", cursor:"pointer", fontFamily:"Nunito,sans-serif", boxShadow:"0 4px 14px rgba(232,122,155,0.35)", marginTop:4 }}>
          💾 Guardar Presupuestos
        </button>
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:"#333", color:"#fff", padding:"10px 20px", borderRadius:20, fontSize:13, fontWeight:700, zIndex:300 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
