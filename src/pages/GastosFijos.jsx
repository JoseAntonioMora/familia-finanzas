import { useState, useEffect } from "react";

const AREAS = [
  { id:"hogar",           label:"Hogar",        icon:"🏠" },
  { id:"alimentacion",    label:"Alimentación",  icon:"🥦" },
  { id:"transporte",      label:"Transporte",    icon:"🚗" },
  { id:"salud",           label:"Salud",         icon:"💊" },
  { id:"entretenimiento", label:"Salidas",       icon:"🎉" },
  { id:"ahorro",          label:"Ahorro",        icon:"🐷" },
  { id:"otros",           label:"Otros",         icon:"📦" },
];

const METODOS = ["Efectivo","Débito","Transferencia"];

function fmt(n) {
  return new Intl.NumberFormat("es-MX", { style:"currency", currency:"MXN", minimumFractionDigits:0 }).format(n || 0);
}

function FormFijo({ onSave, onCancel, inicial }) {
  const [form, setForm] = useState(inicial || { nombre:"", monto:"", dia_pago:"", area:"hogar", metodo:"Débito", nota:"", activo:true });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  return (
    <div style={{ background:"#fff", borderRadius:18, padding:16, border:"1.5px solid #c8e8d8", boxShadow:"0 2px 12px rgba(76,175,130,0.1)", marginBottom:14 }}>
      <div style={{ fontSize:14, fontWeight:800, color:"#2d5a42", marginBottom:14 }}>{inicial ? "✏️ Editar Gasto Fijo" : "➕ Nuevo Gasto Fijo"}</div>

      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#7aab8e", marginBottom:4 }}>NOMBRE</div>
        <input value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Ej: Renta, Luz, Internet..." style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:"1.5px solid #e6f5ec", background:"#fafafa", fontSize:14, color:"#2d5a42", fontFamily:"Nunito,sans-serif", outline:"none", boxSizing:"border-box" }}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"#7aab8e", marginBottom:4 }}>MONTO ($)</div>
          <input type="number" value={form.monto} onChange={e => set("monto", e.target.value)} placeholder="0.00" style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:"1.5px solid #e6f5ec", background:"#fafafa", fontSize:14, color:"#2d5a42", fontFamily:"Nunito,sans-serif", outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"#7aab8e", marginBottom:4 }}>DÍA DE PAGO</div>
          <input type="number" value={form.dia_pago} onChange={e => set("dia_pago", e.target.value)} placeholder="1-31" min="1" max="31" style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:"1.5px solid #e6f5ec", background:"#fafafa", fontSize:14, color:"#2d5a42", fontFamily:"Nunito,sans-serif", outline:"none", boxSizing:"border-box" }}/>
        </div>
      </div>

      {/* Área */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#7aab8e", marginBottom:6 }}>ÁREA</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
          {AREAS.map(a => (
            <button key={a.id} onClick={() => set("area", a.id)} style={{ padding:"7px 4px", borderRadius:11, border:`1.5px solid ${form.area===a.id?"#4caf82":"#e6f5ec"}`, background:form.area===a.id?"#edfbf3":"#fafafa", cursor:"pointer", textAlign:"center", fontFamily:"Nunito,sans-serif" }}>
              <div style={{ fontSize:16 }}>{a.icon}</div>
              <div style={{ fontSize:9, fontWeight:700, color:form.area===a.id?"#4caf82":"#7aab8e" }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Método */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#7aab8e", marginBottom:6 }}>MÉTODO</div>
        <div style={{ display:"flex", gap:6 }}>
          {METODOS.map(m => (
            <button key={m} onClick={() => set("metodo", m)} style={{ flex:1, padding:"8px", borderRadius:11, border:`1.5px solid ${form.metodo===m?"#4caf82":"#e6f5ec"}`, background:form.metodo===m?"#edfbf3":"#fafafa", color:form.metodo===m?"#4caf82":"#7aab8e", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#7aab8e", marginBottom:4 }}>NOTA (opcional)</div>
        <input value={form.nota||""} onChange={e => set("nota", e.target.value)} placeholder="Notas adicionales..." style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:"1.5px solid #e6f5ec", background:"#fafafa", fontSize:14, color:"#2d5a42", fontFamily:"Nunito,sans-serif", outline:"none", boxSizing:"border-box" }}/>
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onCancel} style={{ flex:1, padding:"11px", borderRadius:12, border:"1.5px solid #e6f5ec", background:"#fafafa", color:"#7aab8e", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>Cancelar</button>
        <button onClick={() => onSave(form)} style={{ flex:2, padding:"11px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#a8e6c4,#4caf82)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
          💾 Guardar
        </button>
      </div>
    </div>
  );
}

export default function GastosFijos({ supabase }) {
  const [fijos,    setFijos]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(false);
  const [editando, setEditando] = useState(null);
  const [toast,    setToast]    = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from("gastos_fijos").select("*").order("dia_pago");
    setFijos(data || []);
    setLoading(false);
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  async function handleSave(f) {
    if (!f.nombre || !f.monto) { showToast("⚠️ Completa nombre y monto"); return; }
    const data = { nombre:f.nombre, monto:parseFloat(f.monto), dia_pago:f.dia_pago ? parseInt(f.dia_pago) : null, area:f.area, metodo:f.metodo, nota:f.nota||"", activo:f.activo };
    const { error } = editando
      ? await supabase.from("gastos_fijos").update(data).eq("id", editando.id)
      : await supabase.from("gastos_fijos").insert([data]);
    if (error) { showToast("❌ " + error.message); return; }
    showToast(editando ? "✅ Actualizado" : "✅ Gasto fijo guardado");
    setForm(false); setEditando(null);
    fetchData();
  }

  async function toggleActivo(item) {
    await supabase.from("gastos_fijos").update({ activo: !item.activo }).eq("id", item.id);
    fetchData();
  }

  async function handleDelete(id) {
    await supabase.from("gastos_fijos").delete().eq("id", id);
    showToast("🗑 Eliminado");
    setEditando(null); setForm(false);
    fetchData();
  }

  const activos   = fijos.filter(f => f.activo);
  const inactivos = fijos.filter(f => !f.activo);
  const totalMes  = activos.reduce((a,f) => a+(f.monto||0), 0);

  const areaInfo = { hogar:{icon:"🏠",color:"#f9c5d1"}, alimentacion:{icon:"🥦",color:"#c8f0dc"}, transporte:{icon:"🚗",color:"#c5d9f9"}, salud:{icon:"💊",color:"#f9e5c5"}, entretenimiento:{icon:"🎉",color:"#e5c5f9"}, ahorro:{icon:"🐷",color:"#f9f0c5"}, otros:{icon:"📦",color:"#ddd"} };

  function diasHasta(dia) {
    if (!dia) return null;
    const hoy = new Date();
    const obj = new Date(hoy.getFullYear(), hoy.getMonth(), dia);
    if (obj <= hoy) obj.setMonth(obj.getMonth()+1);
    return Math.ceil((obj - hoy) / (1000*60*60*24));
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#2d5a42", margin:0 }}>Gastos Fijos 📌</h2>
        <button onClick={() => { setForm(true); setEditando(null); }} style={{ background:"linear-gradient(135deg,#a8e6c4,#4caf82)", border:"none", borderRadius:12, padding:"8px 14px", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
          + Agregar
        </button>
      </div>

      {/* Resumen */}
      <div style={{ background:"linear-gradient(135deg,#c8f0dc,#edfbf3)", borderRadius:16, padding:"12px 16px", marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#7aab8e" }}>TOTAL FIJOS POR MES</div>
        <div style={{ fontSize:24, fontWeight:800, color:"#2d5a42", marginTop:2 }}>{fmt(totalMes)}</div>
        <div style={{ fontSize:11, color:"#7aab8e", marginTop:2 }}>{activos.length} gasto{activos.length!==1?"s":""} activo{activos.length!==1?"s":""} · Sí afectan el balance</div>
      </div>

      {/* Formulario */}
      {(form || editando) && (
        <FormFijo
          inicial={editando}
          onSave={handleSave}
          onCancel={() => { setForm(false); setEditando(null); }}
        />
      )}

      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#7aab8e" }}>Cargando... ✨</div>
      ) : fijos.length === 0 ? (
        <div style={{ textAlign:"center", padding:40, color:"#a0c8b0", fontSize:14 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>📌</div>
          Sin gastos fijos registrados
        </div>
      ) : (
        <>
          {activos.map((f,i) => {
            const a = areaInfo[f.area] || { icon:"📦", color:"#ddd" };
            const dias = diasHasta(f.dia_pago);
            return (
              <div key={f.id} style={{ background:"#fff", borderRadius:16, padding:"12px 14px", marginBottom:8, border:"1.5px solid #e6f5ec", display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width:40, height:40, borderRadius:12, background:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"#2d5a42" }}>{f.nombre}</div>
                  <div style={{ fontSize:11, color:"#7aab8e" }}>
                    {f.dia_pago ? `Día ${f.dia_pago}` : "Sin fecha"} · {f.metodo}
                    {dias !== null && dias <= 5 && <span style={{ marginLeft:6, color:"#e87a9b", fontWeight:700 }}>⚠️ {dias}d</span>}
                  </div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:"#e87a9b" }}>{fmt(f.monto)}</div>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => { setEditando(f); setForm(false); }} style={{ background:"#f0f8f4", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:14 }}>✏️</button>
                  <button onClick={() => toggleActivo(f)} style={{ background:"#fff8f0", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:14 }} title="Desactivar">⏸</button>
                </div>
              </div>
            );
          })}

          {inactivos.length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#b0a0a8", marginBottom:8 }}>INACTIVOS</div>
              {inactivos.map(f => {
                const a = areaInfo[f.area] || { icon:"📦", color:"#ddd" };
                return (
                  <div key={f.id} style={{ background:"#fafafa", borderRadius:14, padding:"10px 14px", marginBottom:6, border:"1.5px solid #ece8ea", display:"flex", alignItems:"center", gap:10, opacity:0.6 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{a.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#888", textDecoration:"line-through" }}>{f.nombre}</div>
                      <div style={{ fontSize:11, color:"#aaa" }}>{fmt(f.monto)}/mes</div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => toggleActivo(f)} style={{ background:"#edfbf3", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:14 }} title="Activar">▶️</button>
                      <button onClick={() => handleDelete(f.id)} style={{ background:"#fff0f0", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:14 }}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:"#333", color:"#fff", padding:"10px 20px", borderRadius:20, fontSize:13, fontWeight:700, zIndex:300 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
