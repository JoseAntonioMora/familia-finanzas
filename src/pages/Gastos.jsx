import { enviarNotificacion } from "../notifications.js";
import { useState, useEffect } from "react";

const AREAS = [
  { id:"hogar",           label:"Hogar",        icon:"🏠", sub:"Renta, servicios" },
  { id:"alimentacion",    label:"Alimentación",  icon:"🥦", sub:"Super + comida"   },
  { id:"transporte",      label:"Transporte",    icon:"🚗", sub:""                 },
  { id:"salud",           label:"Salud",         icon:"💊", sub:"Muy importante"   },
  { id:"entretenimiento", label:"Salidas",       icon:"🎉", sub:"Entretenimiento"  },
  { id:"ahorro",          label:"Ahorro",        icon:"🐷", sub:""                 },
  { id:"otros",           label:"Otros",         icon:"📦", sub:""                 },
];

const METODOS    = ["Efectivo","Débito","Crédito","Transferencia","Vales"];
const MESES_OPTS = [1,3,6,9,12,18,24];
const PERSONAS   = [
  { id:"Fer",  icon:"👩", color:"#f9c5d1", colorDark:"#e87a9b", bg:"#fff0f3" },
  { id:"Toño", icon:"👨", color:"#c5d9f9", colorDark:"#5a8ae8", bg:"#f0f4ff" },
];

const pastel = { card:"#fff", border:"#f5e6ea", accent:"#e87a9b", accentLight:"#fff0f3", text:"#6b3a4a", sub:"#b07080", green:"#7ec8a4", greenLight:"#edfbf3" };

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:700, color:pastel.sub, marginBottom:4, display:"block" }}>{label}</label>
      <input {...props} style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:`1.5px solid ${pastel.border}`, background:"#fafafa", fontSize:15, color:pastel.text, fontFamily:"Nunito,sans-serif", outline:"none", boxSizing:"border-box" }}/>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:700, color:pastel.sub, marginBottom:4, display:"block" }}>{label}</label>
      <textarea {...props} rows={2} style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:`1.5px solid ${pastel.border}`, background:"#fafafa", fontSize:15, color:pastel.text, fontFamily:"Nunito,sans-serif", outline:"none", resize:"none", boxSizing:"border-box" }}/>
    </div>
  );
}

export default function Gastos({ supabase }) {
  const today = new Date().toISOString().split("T")[0];
  const [form,     setForm]    = useState({ monto:"", fecha:today, descripcion:"", nota:"", metodo:"Efectivo", meses:1, area:"", persona:"", tarjeta_id:"" });
  const [loading,  setLoading] = useState(false);
  const [success,  setSuccess] = useState(false);
  const [error,    setError]   = useState("");
  const [tarjetas, setTarjetas]= useState([]);

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  useEffect(() => {
    supabase.from("tarjetas").select("*").order("nombre").then(({ data }) => setTarjetas(data || []));
  }, []);

  // Tarjetas filtradas por persona seleccionada
  const tarjetasPersona = form.persona ? tarjetas.filter(t => t.persona === form.persona) : tarjetas;

  const handleSubmit = async () => {
    if (!form.persona)                          { setError("¿Quién está registrando este gasto?"); return; }
    if (!form.monto || !form.area || !form.descripcion) { setError("Completa monto, área y descripción."); return; }
    if (form.metodo === "Crédito" && !form.tarjeta_id)  { setError("Selecciona la tarjeta de crédito."); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.from("gastos").insert([{
        monto:      parseFloat(form.monto),
        fecha:      form.fecha,
        descripcion:form.descripcion,
        nota:       form.nota,
        metodo:     form.metodo,
        meses:      form.metodo==="Crédito" ? form.meses : null,
        area:       form.area,
        persona:    form.persona,
        tarjeta_id: form.metodo==="Crédito" ? form.tarjeta_id : null,
      }]);
      if (err) throw err;
      const nombreGuardado = form.persona;
      setSuccess(true);
      setForm({ monto:"", fecha:today, descripcion:"", nota:"", metodo:"Efectivo", meses:1, area:"", persona:nombreGuardado, tarjeta_id:"" });
      setTimeout(() => setSuccess(false), 2500);
      enviarNotificacion({ tipo:"gasto", titulo:`Gasto registrado por ${form.persona}`, mensaje:`${form.descripcion} — $${parseFloat(form.monto).toFixed(2)} (${form.metodo})` });
    } catch(e) { setError("Error al guardar: " + e.message); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:800, color:pastel.text, margin:"0 0 16px" }}>Registrar Gasto 🛒</h2>

      {/* Persona */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:pastel.sub, marginBottom:8 }}>¿QUIÉN GASTA?</div>
        <div style={{ display:"flex", gap:10 }}>
          {PERSONAS.map(p => (
            <button key={p.id} onClick={() => { set("persona",p.id); set("tarjeta_id",""); }} style={{ flex:1, padding:"14px 10px", borderRadius:16, border:`2px solid ${form.persona===p.id?p.colorDark:pastel.border}`, background:form.persona===p.id?p.bg:"#fff", cursor:"pointer", textAlign:"center", transition:"all 0.15s", boxShadow:form.persona===p.id?`0 4px 14px ${p.color}`:"none" }}>
              <div style={{ fontSize:32 }}>{p.icon}</div>
              <div style={{ fontSize:15, fontWeight:800, color:form.persona===p.id?p.colorDark:pastel.sub, marginTop:4 }}>{p.id}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Área */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:pastel.sub, marginBottom:8 }}>ÁREA DEL GASTO</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {AREAS.map(a => (
            <button key={a.id} onClick={() => set("area",a.id)} style={{ background:form.area===a.id?pastel.accentLight:"#fff", border:`1.5px solid ${form.area===a.id?pastel.accent:pastel.border}`, borderRadius:14, padding:"10px", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
              <div style={{ fontSize:20 }}>{a.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:form.area===a.id?pastel.accent:pastel.text, marginTop:2 }}>{a.label}</div>
              {a.sub && <div style={{ fontSize:10, color:pastel.sub }}>{a.sub}</div>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:pastel.card, borderRadius:18, padding:16, border:`1px solid ${pastel.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
        <Input label="MONTO ($)" type="number" placeholder="0.00" value={form.monto} onChange={e => set("monto",e.target.value)}/>
        <Input label="FECHA" type="date" value={form.fecha} onChange={e => set("fecha",e.target.value)}/>
        <Input label="DESCRIPCIÓN" placeholder="¿En qué gastaste?" value={form.descripcion} onChange={e => set("descripcion",e.target.value)}/>
        <Textarea label="NOTA (opcional)" placeholder="Notas adicionales..." value={form.nota} onChange={e => set("nota",e.target.value)}/>

        {/* Método */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:pastel.sub, marginBottom:8 }}>MÉTODO DE PAGO</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {METODOS.map(m => (
              <button key={m} onClick={() => { set("metodo",m); set("tarjeta_id",""); }} style={{ flex:1, minWidth:60, padding:"9px 4px", borderRadius:12, border:`1.5px solid ${form.metodo===m?pastel.accent:pastel.border}`, background:form.metodo===m?pastel.accentLight:"#fafafa", color:form.metodo===m?pastel.accent:pastel.sub, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
                {m==="Efectivo"?"💵":m==="Débito"?"💳":m==="Crédito"?"🔵":m==="Transferencia"?"🏦":"🎟️"} {m}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de tarjeta (solo crédito) */}
        {form.metodo === "Crédito" && (
          <div style={{ marginBottom:14, background:"#f3e8ff", borderRadius:14, padding:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#8040c0", marginBottom:8 }}>💳 TARJETA DE CRÉDITO</div>
            {tarjetasPersona.length === 0 ? (
              <div style={{ fontSize:13, color:"#9070b0", textAlign:"center", padding:"8px 0" }}>
                No tienes tarjetas registradas para {form.persona || "esta persona"}.<br/>
                <span style={{ fontSize:11 }}>Agrégalas en la sección Tarjetas 💳</span>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {tarjetasPersona.map(t => (
                  <button key={t.id} onClick={() => set("tarjeta_id",t.id)} style={{ padding:"10px 14px", borderRadius:12, border:`2px solid ${form.tarjeta_id===t.id?t.color:"#e0d4f5"}`, background:form.tarjeta_id===t.id?"#fff":"#fafafa", cursor:"pointer", textAlign:"left", fontFamily:"Nunito,sans-serif", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:t.color, flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#6b3a4a" }}>{t.nombre}</div>
                      {t.banco && <div style={{ fontSize:11, color:"#9070b0" }}>{t.banco}</div>}
                    </div>
                    {form.tarjeta_id === t.id && <span style={{ color:t.color, fontWeight:800 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Meses */}
            <div style={{ marginTop:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#8040c0", marginBottom:6 }}>MESES SIN INTERESES</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {MESES_OPTS.map(m => (
                  <button key={m} onClick={() => set("meses",m)} style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${form.meses===m?"#8040c0":"#d0b8e8"}`, background:form.meses===m?"#8040c0":"#fff", color:form.meses===m?"#fff":"#8040c0", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
                    {m===1?"Contado":`${m}m`}
                  </button>
                ))}
              </div>
              {form.meses>1 && form.monto && (
                <div style={{ marginTop:8, fontSize:12, color:"#8040c0", fontWeight:600 }}>
                  💡 Pago mensual: <strong>${(parseFloat(form.monto||0)/form.meses).toFixed(2)}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {error && <div style={{ background:"#ffe0e0", borderRadius:10, padding:"10px 14px", color:"#c0403a", fontSize:13, fontWeight:600, marginBottom:12 }}>{error}</div>}
        {success && <div style={{ background:pastel.greenLight, borderRadius:10, padding:"10px 14px", color:pastel.green, fontSize:13, fontWeight:700, marginBottom:12, textAlign:"center" }}>✅ ¡Gasto guardado!</div>}

        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"14px", borderRadius:14, background:loading?"#f0d0d8":"linear-gradient(135deg,#f9c5d1,#e87a9b)", color:"#fff", fontWeight:800, fontSize:16, border:"none", cursor:loading?"not-allowed":"pointer", fontFamily:"Nunito,sans-serif", boxShadow:"0 4px 14px rgba(232,122,155,0.35)" }}>
          {loading ? "Guardando..." : `💾 Guardar Gasto${form.persona?" de "+form.persona:""}`}
        </button>
      </div>
    </div>
  );
}