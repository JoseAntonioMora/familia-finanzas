import { useState, useEffect } from "react";

const AREAS = {
  hogar: { label: "Hogar", icon: "🏠", color: "#f9c5d1" },
  alimentacion: { label: "Alimentación", icon: "🥦", color: "#c8f0dc" },
  transporte: { label: "Transporte", icon: "🚗", color: "#c5d9f9" },
  salud: { label: "Salud", icon: "💊", color: "#f9e5c5" },
  entretenimiento: { label: "Salidas", icon: "🎉", color: "#e5c5f9" },
  ahorro: { label: "Ahorro", icon: "🐷", color: "#f9f0c5" },
  otros: { label: "Otros", icon: "📦", color: "#ddd" },
};

const METODOS = ["Efectivo", "Débito", "Crédito"];
const MESES_OPTS = [1, 3, 6, 9, 12, 18, 24];
const FUENTES = ["Salario", "Freelance", "Negocio", "Regalo", "Otro"];
const PERSONAS = [
  { id: "Fer", icon: "👩", colorDark: "#e87a9b", bg: "#fff0f3", border: "#f9c5d1" },
  { id: "Toño", icon: "👨", colorDark: "#5a8ae8", bg: "#f0f4ff", border: "#c5d9f9" },
];

function fmt(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n || 0);
}

function fmtFecha(f) {
  if (!f) return "";
  const [y, m, d] = f.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Modal de Edición ────────────────────────────────────────────────────────
function ModalEditar({ item, tipo, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const esGasto = tipo === "gasto";

  async function handleSave() {
    setLoading(true);
    await onSave(form);
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    await onDelete(item.id, tipo);
    setLoading(false);
  }

  const persona = PERSONAS.find(p => p.id === form.persona);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: "20px 20px 40px" }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "#e0d0d8", borderRadius: 4, margin: "0 auto 20px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: esGasto ? "#6b3a4a" : "#2d5a42" }}>
            {esGasto ? "✏️ Editar Gasto" : "✏️ Editar Ingreso"}
          </div>
          <button onClick={onClose} style={{ background: "#f5f0f2", border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#b07080", fontFamily: "Nunito, sans-serif" }}>✕ Cerrar</button>
        </div>

        {/* Persona */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b07080", marginBottom: 8 }}>{esGasto ? "¿QUIÉN GASTÓ?" : "¿QUIÉN RECIBIÓ?"}</div>
          <div style={{ display: "flex", gap: 10 }}>
            {PERSONAS.map(p => (
              <button key={p.id} onClick={() => set("persona", p.id)} style={{ flex: 1, padding: "10px", borderRadius: 14, border: `2px solid ${form.persona === p.id ? p.colorDark : "#f0e8ec"}`, background: form.persona === p.id ? p.bg : "#fafafa", cursor: "pointer", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
                <div style={{ fontSize: 24 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: form.persona === p.id ? p.colorDark : "#b0a0a8" }}>{p.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Monto */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b07080", marginBottom: 6 }}>MONTO ($)</div>
          <input type="number" value={form.monto} onChange={e => set("monto", e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #f0e8ec", background: "#fafafa", fontSize: 16, fontWeight: 700, color: esGasto ? "#6b3a4a" : "#2d5a42", fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b07080", marginBottom: 6 }}>FECHA</div>
          <input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #f0e8ec", background: "#fafafa", fontSize: 15, color: "#6b3a4a", fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b07080", marginBottom: 6 }}>DESCRIPCIÓN</div>
          <input type="text" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #f0e8ec", background: "#fafafa", fontSize: 15, color: "#6b3a4a", fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Nota */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b07080", marginBottom: 6 }}>NOTA</div>
          <textarea rows={2} value={form.nota || ""} onChange={e => set("nota", e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #f0e8ec", background: "#fafafa", fontSize: 15, color: "#6b3a4a", fontFamily: "Nunito, sans-serif", outline: "none", resize: "none", boxSizing: "border-box" }} />
        </div>

        {esGasto ? (
          <>
            {/* Área */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#b07080", marginBottom: 8 }}>ÁREA</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {Object.entries(AREAS).map(([id, a]) => (
                  <button key={id} onClick={() => set("area", id)} style={{ padding: "8px 4px", borderRadius: 12, border: `1.5px solid ${form.area === id ? "#e87a9b" : "#f0e8ec"}`, background: form.area === id ? "#fff0f3" : "#fafafa", cursor: "pointer", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
                    <div style={{ fontSize: 16 }}>{a.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: form.area === id ? "#e87a9b" : "#b07080" }}>{a.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Método */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#b07080", marginBottom: 8 }}>MÉTODO DE PAGO</div>
              <div style={{ display: "flex", gap: 6 }}>
                {METODOS.map(m => (
                  <button key={m} onClick={() => set("metodo", m)} style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: `1.5px solid ${form.metodo === m ? "#e87a9b" : "#f0e8ec"}`, background: form.metodo === m ? "#fff0f3" : "#fafafa", color: form.metodo === m ? "#e87a9b" : "#b07080", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    {m === "Efectivo" ? "💵" : m === "Débito" ? "💳" : "🔵"} {m}
                  </button>
                ))}
              </div>
            </div>

            {form.metodo === "Crédito" && (
              <div style={{ marginBottom: 14, background: "#f0f4ff", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7080b0", marginBottom: 8 }}>MESES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {MESES_OPTS.map(m => (
                    <button key={m} onClick={() => set("meses", m)} style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${form.meses === m ? "#7080b0" : "#d0d8f0"}`, background: form.meses === m ? "#7080b0" : "#fff", color: form.meses === m ? "#fff" : "#7080b0", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                      {m === 1 ? "Contado" : `${m}m`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7aab8e", marginBottom: 8 }}>FUENTE</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FUENTES.map(f => (
                <button key={f} onClick={() => set("fuente", f)} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${form.fuente === f ? "#4caf82" : "#e6f5ec"}`, background: form.fuente === f ? "#edfbf3" : "#fafafa", color: form.fuente === f ? "#4caf82" : "#7aab8e", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#fff0f0", border: "1.5px solid #ffd0d0", color: "#e06060", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              🗑 Eliminar
            </button>
          ) : (
            <button onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: "13px", borderRadius: 14, background: "#e06060", border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              ⚠️ ¿Confirmar?
            </button>
          )}
          <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: "13px", borderRadius: 14, background: esGasto ? "linear-gradient(135deg,#f9c5d1,#e87a9b)" : "linear-gradient(135deg,#a8e6c4,#4caf82)", border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", boxShadow: esGasto ? "0 4px 14px rgba(232,122,155,0.35)" : "0 4px 14px rgba(76,175,130,0.35)" }}>
            {loading ? "Guardando..." : "✅ Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Historial({ supabase }) {
  const [tab, setTab] = useState("gastos");
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [filtroPersona, setFiltroPersona] = useState("todos");
  const [filtroMes, setFiltroMes] = useState("todos");
  const [toast, setToast] = useState("");

  const now = new Date();
  const mesesDisp = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("es-MX", { month: "long", year: "numeric" }) };
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: g }, { data: i }] = await Promise.all([
      supabase.from("gastos").select("*").order("fecha", { ascending: false }),
      supabase.from("ingresos").select("*").order("fecha", { ascending: false }),
    ]);
    setGastos(g || []);
    setIngresos(i || []);
    setLoading(false);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleSave(form) {
    const tabla = editando.tipo === "gasto" ? "gastos" : "ingresos";
    const { error } = await supabase.from(tabla).update({
      monto: parseFloat(form.monto),
      fecha: form.fecha,
      descripcion: form.descripcion,
      nota: form.nota,
      persona: form.persona,
      ...(editando.tipo === "gasto" ? { area: form.area, metodo: form.metodo, meses: form.metodo === "Crédito" ? form.meses : null } : { fuente: form.fuente }),
    }).eq("id", form.id);
    if (error) { showToast("❌ Error al guardar"); return; }
    showToast("✅ Cambios guardados");
    setEditando(null);
    fetchData();
  }

  async function handleDelete(id, tipo) {
    const tabla = tipo === "gasto" ? "gastos" : "ingresos";
    const { error } = await supabase.from(tabla).delete().eq("id", id);
    if (error) { showToast("❌ Error al eliminar"); return; }
    showToast("🗑 Registro eliminado");
    setEditando(null);
    fetchData();
  }

  // Filtrado
  function applyFilters(rows) {
    return rows.filter(r => {
      if (filtroPersona !== "todos" && r.persona !== filtroPersona) return false;
      if (filtroMes !== "todos") {
        const ym = r.fecha?.slice(0, 7);
        if (ym !== filtroMes) return false;
      }
      return true;
    });
  }

  const gastosF = applyFilters(gastos);
  const ingresosF = applyFilters(ingresos);
  const rows = tab === "gastos" ? gastosF : ingresosF;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#6b3a4a", margin: "0 0 14px" }}>Historial 📋</h2>

      {/* Tabs Gastos / Ingresos */}
      <div style={{ display: "flex", background: "#f5eef0", borderRadius: 14, padding: 4, marginBottom: 14 }}>
        {[{ id: "gastos", label: "🛒 Gastos" }, { id: "ingresos", label: "💰 Ingresos" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "9px 0", borderRadius: 11, border: "none", background: tab === t.id ? "#fff" : "transparent", color: tab === t.id ? "#e87a9b" : "#b07080", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: tab === t.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {/* Filtro Persona */}
        <div style={{ display: "flex", gap: 6 }}>
          {["todos", "Fer", "Toño"].map(p => (
            <button key={p} onClick={() => setFiltroPersona(p)} style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${filtroPersona === p ? "#e87a9b" : "#f0e8ec"}`, background: filtroPersona === p ? "#fff0f3" : "#fff", color: filtroPersona === p ? "#e87a9b" : "#b07080", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              {p === "todos" ? "👥 Todos" : p === "Fer" ? "👩 Fer" : "👨 Toño"}
            </button>
          ))}
        </div>

        {/* Filtro Mes */}
        <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid #f0e8ec", background: "#fff", color: "#b07080", fontWeight: 700, fontSize: 12, fontFamily: "Nunito, sans-serif", outline: "none", cursor: "pointer" }}>
          <option value="todos">📅 Todos los meses</option>
          {mesesDisp.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Resumen rápido */}
      {rows.length > 0 && (
        <div style={{ background: tab === "gastos" ? "#fff0f3" : "#edfbf3", borderRadius: 14, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: tab === "gastos" ? "#b07080" : "#7aab8e" }}>{rows.length} registro{rows.length !== 1 ? "s" : ""}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: tab === "gastos" ? "#e87a9b" : "#4caf82" }}>
            {tab === "gastos" ? "-" : "+"}{fmt(rows.reduce((a, r) => a + (r.monto || 0), 0))}
          </span>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#b07080", fontSize: 15, fontWeight: 600 }}>Cargando... ✨</div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#c0a8b0", fontSize: 14 }}>Sin registros para este filtro</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(r => {
            const esGasto = tab === "gastos";
            const area = esGasto ? (AREAS[r.area] || { icon: "📦", label: r.area, color: "#eee" }) : null;
            const persona = PERSONAS.find(p => p.id === r.persona);

            return (
              <button key={r.id} onClick={() => setEditando({ ...r, tipo: esGasto ? "gasto" : "ingreso" })} style={{ background: "#fff", border: "1.5px solid #f5eaee", borderRadius: 16, padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"}
              >
                {/* Ícono área / ingreso */}
                <div style={{ width: 42, height: 42, borderRadius: 12, background: esGasto ? (area?.color || "#eee") : "#edfbf3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {esGasto ? area?.icon : "💰"}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#6b3a4a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.descripcion}</div>
                  <div style={{ fontSize: 11, color: "#b07080", marginTop: 2, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span>{fmtFecha(r.fecha)}</span>
                    {esGasto && <span>· {area?.label}</span>}
                    {!esGasto && r.fuente && <span>· {r.fuente}</span>}
                    {esGasto && r.metodo && <span>· {r.metodo === "Crédito" && r.meses > 1 ? `${r.meses}m` : r.metodo}</span>}
                  </div>
                </div>

                {/* Persona + Monto */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: esGasto ? "#e87a9b" : "#4caf82" }}>
                    {esGasto ? "-" : "+"}{fmt(r.monto)}
                  </span>
                  {r.persona && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: persona?.colorDark || "#b07080", background: persona?.bg || "#f5f0f2", padding: "2px 8px", borderRadius: 10 }}>
                      {persona?.icon} {r.persona}
                    </span>
                  )}
                </div>

                {/* Flecha editar */}
                <div style={{ color: "#d0c0c8", fontSize: 16, flexShrink: 0 }}>›</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal edición */}
      {editando && (
        <ModalEditar
          item={editando}
          tipo={editando.tipo}
          onClose={() => setEditando(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 300, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}