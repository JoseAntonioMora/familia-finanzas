import { useState, useEffect } from "react";

const PERSONAS = [
  { id: "Fer",  icon: "👩", colorDark: "#e87a9b", bg: "#fff0f3", border: "#f9c5d1" },
  { id: "Toño", icon: "👨", colorDark: "#5a8ae8", bg: "#f0f4ff", border: "#c5d9f9" },
];

const COLORES = [
  { value: "#8040c0", label: "Morado"  },
  { value: "#e87a9b", label: "Rosa"    },
  { value: "#5a8ae8", label: "Azul"    },
  { value: "#4caf82", label: "Verde"   },
  { value: "#f0a050", label: "Naranja" },
  { value: "#606060", label: "Gris"    },
];

function fmt(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n || 0);
}

function diasHasta(diaObjetivo) {
  const hoy = new Date();
  const objetivo = new Date(hoy.getFullYear(), hoy.getMonth(), diaObjetivo);
  if (objetivo <= hoy) objetivo.setMonth(objetivo.getMonth() + 1);
  return Math.ceil((objetivo - hoy) / (1000 * 60 * 60 * 24));
}

// ── Formulario Nueva Tarjeta ──────────────────────────────────────────────────
function FormTarjeta({ onSave, onCancel, inicial }) {
  const [form, setForm] = useState(inicial || { persona:"Fer", nombre:"", banco:"", color:"#8040c0", fecha_corte:"", fecha_pago:"", limite:"" });
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ background:"#fff", borderRadius:18, padding:16, border:"1.5px solid #e0d4f5", boxShadow:"0 2px 12px rgba(130,80,200,0.1)", marginBottom:14 }}>
      <div style={{ fontSize:14, fontWeight:800, color:"#6b3a9a", marginBottom:14 }}>{inicial ? "✏️ Editar Tarjeta" : "➕ Nueva Tarjeta"}</div>

      {/* Persona */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#9070b0", marginBottom:6 }}>¿DE QUIÉN?</div>
        <div style={{ display:"flex", gap:8 }}>
          {PERSONAS.map(p => (
            <button key={p.id} onClick={() => set("persona", p.id)} style={{ flex:1, padding:"10px", borderRadius:12, border:`2px solid ${form.persona===p.id ? p.colorDark : "#f0e8f8"}`, background:form.persona===p.id ? p.bg : "#fafafa", cursor:"pointer", fontFamily:"Nunito,sans-serif", textAlign:"center" }}>
              <div style={{ fontSize:22 }}>{p.icon}</div>
              <div style={{ fontSize:13, fontWeight:800, color:form.persona===p.id ? p.colorDark : "#b0a0b8" }}>{p.id}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Nombre y Banco */}
      {[["nombre","NOMBRE / ALIAS","Ej: Visa Banamex"],["banco","BANCO (opcional)","Ej: Banamex"]].map(([k,lbl,ph]) => (
        <div key={k} style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#9070b0", marginBottom:4 }}>{lbl}</div>
          <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:"1.5px solid #f0e8f8", background:"#fafafa", fontSize:14, color:"#6b3a4a", fontFamily:"Nunito,sans-serif", outline:"none", boxSizing:"border-box" }}/>
        </div>
      ))}

      {/* Color */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#9070b0", marginBottom:6 }}>COLOR</div>
        <div style={{ display:"flex", gap:8 }}>
          {COLORES.map(c => (
            <button key={c.value} onClick={() => set("color", c.value)} style={{ width:32, height:32, borderRadius:"50%", background:c.value, border:form.color===c.value ? "3px solid #333" : "2px solid transparent", cursor:"pointer", transition:"all 0.15s" }}/>
          ))}
        </div>
      </div>

      {/* Fechas y Límite */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
        {[["fecha_corte","CORTE (día)","15"],["fecha_pago","PAGO (día)","5"],["limite","LÍMITE ($)",""]].map(([k,lbl,ph]) => (
          <div key={k}>
            <div style={{ fontSize:10, fontWeight:700, color:"#9070b0", marginBottom:4 }}>{lbl}</div>
            <input type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} style={{ width:"100%", padding:"9px 10px", borderRadius:11, border:"1.5px solid #f0e8f8", background:"#fafafa", fontSize:14, color:"#6b3a4a", fontFamily:"Nunito,sans-serif", outline:"none", boxSizing:"border-box" }}/>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onCancel} style={{ flex:1, padding:"11px", borderRadius:12, border:"1.5px solid #f0e8f8", background:"#fafafa", color:"#9070b0", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>Cancelar</button>
        <button onClick={() => onSave(form)} style={{ flex:2, padding:"11px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#c5a0e8,#8040c0)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
          💾 Guardar Tarjeta
        </button>
      </div>
    </div>
  );
}

// ── Card de Tarjeta ───────────────────────────────────────────────────────────
function CardTarjeta({ tarjeta, gastos, onEdit }) {
  const totalGastado = gastos.filter(g => g.tarjeta_id === tarjeta.id).reduce((a,r) => a+(r.monto||0), 0);
  const pct = tarjeta.limite ? Math.min((totalGastado / tarjeta.limite) * 100, 100) : null;
  const diasCorte = diasHasta(tarjeta.fecha_corte);
  const diasPago  = diasHasta(tarjeta.fecha_pago);
  const persona   = PERSONAS.find(p => p.id === tarjeta.persona);

  return (
    <div style={{ borderRadius:20, overflow:"hidden", marginBottom:12, boxShadow:"0 4px 20px rgba(0,0,0,0.12)" }}>
      {/* Cara de la tarjeta */}
      <div style={{ background:`linear-gradient(135deg, ${tarjeta.color}cc, ${tarjeta.color})`, padding:"16px 18px 14px", position:"relative" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>{persona?.icon} {tarjeta.persona}</div>
            <div style={{ fontSize:17, fontWeight:800, color:"#fff", marginTop:2 }}>{tarjeta.nombre}</div>
            {tarjeta.banco && <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)", marginTop:1 }}>{tarjeta.banco}</div>}
          </div>
          <button onClick={() => onEdit(tarjeta)} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:10, padding:"6px 10px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>✏️</button>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
          <div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)", fontWeight:700 }}>GASTADO</div>
            <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{fmt(totalGastado)}</div>
            {tarjeta.limite && <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>de {fmt(tarjeta.limite)}</div>}
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)", fontWeight:700 }}>CORTE</div>
            <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>día {tarjeta.fecha_corte}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.8)" }}>en {diasCorte} día{diasCorte!==1?"s":""}</div>
          </div>
        </div>

        {pct !== null && (
          <div style={{ marginTop:12 }}>
            <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:20, height:6, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:pct>85?"#ff6b6b":"rgba(255,255,255,0.9)", borderRadius:20, transition:"width 0.5s" }}/>
            </div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.8)", marginTop:3 }}>{Math.round(pct)}% del límite utilizado</div>
          </div>
        )}
      </div>

      {/* Pie de la tarjeta */}
      <div style={{ background:"#fff", padding:"10px 18px", display:"flex", justifyContent:"space-between", borderTop:`3px solid ${tarjeta.color}` }}>
        <div style={{ fontSize:11, color:"#9070b0" }}>📅 Pago: día <strong>{tarjeta.fecha_pago}</strong></div>
        <div style={{ fontSize:11, color:diasPago<=5?"#e87a9b":"#7aab8e", fontWeight:700 }}>
          {diasPago<=5 ? `⚠️ ¡Vence en ${diasPago} días!` : `Vence en ${diasPago} días`}
        </div>
      </div>
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function Tarjetas({ supabase }) {
  const [tarjetas, setTarjetas]   = useState([]);
  const [gastos,   setGastos]     = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando]   = useState(null);
  const [toast,    setToast]      = useState("");
  const [filtro,   setFiltro]     = useState("todos");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: t }, { data: g }] = await Promise.all([
      supabase.from("tarjetas").select("*").order("created_at"),
      supabase.from("gastos").select("*").eq("metodo","Crédito"),
    ]);
    setTarjetas(t || []);
    setGastos(g || []);
    setLoading(false);
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  async function handleSave(form) {
    if (!form.nombre || !form.fecha_corte || !form.fecha_pago) { showToast("⚠️ Completa nombre, corte y pago"); return; }
    const data = { persona:form.persona, nombre:form.nombre, banco:form.banco, color:form.color, fecha_corte:parseInt(form.fecha_corte), fecha_pago:parseInt(form.fecha_pago), limite:form.limite ? parseFloat(form.limite) : null };
    const { error } = editando
      ? await supabase.from("tarjetas").update(data).eq("id", editando.id)
      : await supabase.from("tarjetas").insert([data]);
    if (error) { showToast("❌ Error: " + error.message); return; }
    showToast(editando ? "✅ Tarjeta actualizada" : "✅ Tarjeta guardada");
    setMostrarForm(false); setEditando(null);
    fetchData();
  }

  async function handleDelete(id) {
    await supabase.from("tarjetas").delete().eq("id", id);
    showToast("🗑 Tarjeta eliminada");
    setEditando(null); setMostrarForm(false);
    fetchData();
  }

  const tarjetasFiltradas = filtro === "todos" ? tarjetas : tarjetas.filter(t => t.persona === filtro);
  const totalCredito = gastos.reduce((a,r) => a+(r.monto||0), 0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#6b3a9a", margin:0 }}>Tarjetas 💳</h2>
        <button onClick={() => { setMostrarForm(true); setEditando(null); }} style={{ background:"linear-gradient(135deg,#c5a0e8,#8040c0)", border:"none", borderRadius:12, padding:"8px 14px", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
          + Nueva
        </button>
      </div>

      {/* Resumen total crédito */}
      <div style={{ background:"linear-gradient(135deg,#e5c5f9,#f3e8ff)", borderRadius:16, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"#9070b0" }}>TOTAL EN CRÉDITO</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#6b3a9a" }}>{fmt(totalCredito)}</div>
        </div>
        <div style={{ fontSize:11, color:"#9070b0", textAlign:"right" }}>
          <div>{tarjetas.length} tarjeta{tarjetas.length!==1?"s":""}</div>
          <div style={{ marginTop:2 }}>No afecta tu balance</div>
        </div>
      </div>

      {/* Filtro persona */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["todos","Fer","Toño"].map(p => (
          <button key={p} onClick={() => setFiltro(p)} style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${filtro===p?"#8040c0":"#f0e8f8"}`, background:filtro===p?"#f3e8ff":"#fff", color:filtro===p?"#8040c0":"#9070b0", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
            {p==="todos"?"👥 Todos":p==="Fer"?"👩 Fer":"👨 Toño"}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {(mostrarForm || editando) && (
        <FormTarjeta
          inicial={editando}
          onSave={handleSave}
          onCancel={() => { setMostrarForm(false); setEditando(null); }}
        />
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#9070b0" }}>Cargando... ✨</div>
      ) : tarjetasFiltradas.length === 0 ? (
        <div style={{ textAlign:"center", padding:40, color:"#c0a8d0", fontSize:14 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>💳</div>
          No tienes tarjetas registradas.<br/>¡Agrega una!
        </div>
      ) : tarjetasFiltradas.map(t => (
        <CardTarjeta key={t.id} tarjeta={t} gastos={gastos} onEdit={setEditando}/>
      ))}

      {toast && (
        <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:"#333", color:"#fff", padding:"10px 20px", borderRadius:20, fontSize:13, fontWeight:700, zIndex:300, whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
