import { useState, useEffect } from "react";

const AREAS = {
  hogar:          { label: "Hogar",        icon: "🏠", color: "#f9c5d1" },
  alimentacion:   { label: "Alimentación", icon: "🥦", color: "#c8f0dc" },
  transporte:     { label: "Transporte",   icon: "🚗", color: "#c5d9f9" },
  salud:          { label: "Salud",        icon: "💊", color: "#f9e5c5" },
  entretenimiento:{ label: "Salidas",      icon: "🎉", color: "#e5c5f9" },
  ahorro:         { label: "Ahorro",       icon: "💰", color: "#f9f0c5" },
  otros:          { label: "Otros",        icon: "📦", color: "#ddd"    },
};

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function fmt(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n || 0);
}

function fmtFecha(f) {
  if (!f) return "";
  const [y, m, d] = f.split("-");
  return `${d}/${m}/${y}`;
}

// Calcula la quincena actual: inicio = último depósito (día 14 o 29 del mes)
function calcQuincenaActual() {
  const hoy = new Date();
  const d = hoy.getDate();
  const m = hoy.getMonth();
  const y = hoy.getFullYear();

  let inicio, fin;
  if (d >= 29) {
    // Del 29 al 13 del siguiente mes
    inicio = new Date(y, m, 29);
    fin    = new Date(y, m + 1, 13);
  } else if (d >= 14) {
    // Del 14 al 28
    inicio = new Date(y, m, 14);
    fin    = new Date(y, m, 28);
  } else {
    // Del 29 del mes anterior al 13 de este mes
    inicio = new Date(y, m - 1, 29);
    fin    = new Date(y, m, 13);
  }

  return {
    inicio: inicio.toISOString().split("T")[0],
    fin:    fin.toISOString().split("T")[0],
  };
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ data, total }) {
  const size = 160;
  const cx = size / 2, cy = size / 2, r = 56, inner = 34;
  let angle = -90;
  const slices = data.filter(d => d.value > 0).map(d => {
    const pct = d.value / total;
    const a1 = angle, a2 = angle + pct * 360;
    angle = a2;
    const toRad = a => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(a1)), y1 = cy + r * Math.sin(toRad(a1));
    const x2 = cx + r * Math.cos(toRad(a2)), y2 = cy + r * Math.sin(toRad(a2));
    const xi1 = cx + inner * Math.cos(toRad(a1)), yi1 = cy + inner * Math.sin(toRad(a1));
    const xi2 = cx + inner * Math.cos(toRad(a2)), yi2 = cy + inner * Math.sin(toRad(a2));
    const large = pct > 0.5 ? 1 : 0;
    return { ...d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`, pct };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {total === 0
        ? <circle cx={cx} cy={cy} r={r} fill="#f0e8eb" />
        : slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={1.5} />)
      }
      <circle cx={cx} cy={cy} r={inner - 2} fill="#fff" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="#b07080" fontWeight="700" fontFamily="Nunito, sans-serif">Total</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="#6b3a4a" fontWeight="800" fontFamily="Nunito, sans-serif">{fmt(total)}</text>
    </svg>
  );
}

// ── Bar Chart (últimas 6 quincenas) ──────────────────────────────────────────
function BarChart({ ingresos, gastos, labels }) {
  const max = Math.max(...ingresos, ...gastos, 1);
  const h = 100;
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, padding: "0 4px", minWidth: labels.length * 52 }}>
        {labels.map((lbl, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 44 }}>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: h }}>
              <div style={{ width: 12, background: "linear-gradient(180deg,#a8e6c4,#4caf82)", borderRadius: "4px 4px 0 0", height: Math.max((ingresos[i] / max) * h, ingresos[i] > 0 ? 3 : 0), transition: "height 0.4s" }} title={fmt(ingresos[i])} />
              <div style={{ width: 12, background: "linear-gradient(180deg,#f9c5d1,#e87a9b)", borderRadius: "4px 4px 0 0", height: Math.max((gastos[i] / max) * h, gastos[i] > 0 ? 3 : 0), transition: "height 0.4s" }} title={fmt(gastos[i])} />
            </div>
            <div style={{ fontSize: 9, color: "#b07080", fontWeight: 600, marginTop: 4, textAlign: "center", lineHeight: 1.2 }}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, background: "#4caf82", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#7aab8e", fontWeight: 600 }}>Ingresos</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, background: "#e87a9b", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#b07080", fontWeight: 600 }}>Gastos</span></div>
      </div>
    </div>
  );
}

// ── Selector de Periodo ───────────────────────────────────────────────────────
function SelectorPeriodo({ modo, fechaInicio, fechaFin, onChange, onModoChange }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 14, border: "1px solid #f5e6ea", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 16 }}>
      {/* Tabs modo */}
      <div style={{ display: "flex", background: "#f5eef0", borderRadius: 12, padding: 3, marginBottom: 12 }}>
        {[
          { id: "quincena", label: "📅 Quincena" },
          { id: "mes",      label: "🗓 Mes"       },
          { id: "custom",   label: "✏️ Personalizado" },
        ].map(t => (
          <button key={t.id} onClick={() => onModoChange(t.id)} style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: "none", background: modo === t.id ? "#fff" : "transparent", color: modo === t.id ? "#e87a9b" : "#b07080", fontWeight: 800, fontSize: 11, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: modo === t.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Fechas */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#b07080", marginBottom: 4 }}>DESDE</div>
          <input type="date" value={fechaInicio} onChange={e => onChange("inicio", e.target.value)} disabled={modo !== "custom"} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${modo === "custom" ? "#e87a9b" : "#f0e8ec"}`, background: modo === "custom" ? "#fff0f3" : "#fafafa", fontSize: 14, color: "#6b3a4a", fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", cursor: modo === "custom" ? "pointer" : "default" }} />
        </div>
        <div style={{ color: "#d0b8c0", fontWeight: 700, paddingTop: 18 }}>→</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#b07080", marginBottom: 4 }}>HASTA</div>
          <input type="date" value={fechaFin} onChange={e => onChange("fin", e.target.value)} disabled={modo !== "custom"} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${modo === "custom" ? "#e87a9b" : "#f0e8ec"}`, background: modo === "custom" ? "#fff0f3" : "#fafafa", fontSize: 14, color: "#6b3a4a", fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box", cursor: modo === "custom" ? "pointer" : "default" }} />
        </div>
      </div>

      {modo !== "custom" && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#b07080", textAlign: "center" }}>
          {fmtFecha(fechaInicio)} — {fmtFecha(fechaFin)}
        </div>
      )}
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function Resumen({ supabase }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const quincenaActual = calcQuincenaActual();

  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState("quincena");
  const [fechaInicio, setFechaInicio] = useState(quincenaActual.inicio);
  const [fechaFin, setFechaFin] = useState(quincenaActual.fin);

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

  // Cuando cambia el modo, actualiza las fechas automáticamente
  function handleModoChange(nuevoModo) {
    setModo(nuevoModo);
    if (nuevoModo === "quincena") {
      const q = calcQuincenaActual();
      setFechaInicio(q.inicio);
      setFechaFin(q.fin);
    } else if (nuevoModo === "mes") {
      const ini = new Date(year, month, 1);
      const fin = new Date(year, month + 1, 0);
      setFechaInicio(ini.toISOString().split("T")[0]);
      setFechaFin(fin.toISOString().split("T")[0]);
    }
    // "custom" mantiene las fechas actuales para que el usuario las edite
  }

  function handleFechaChange(campo, valor) {
    if (campo === "inicio") setFechaInicio(valor);
    else setFechaFin(valor);
  }

  // Filtro por rango de fechas
  function filtrar(rows) {
    return rows.filter(r => r.fecha >= fechaInicio && r.fecha <= fechaFin);
  }

  const gastosF   = filtrar(gastos);
  const ingresosF = filtrar(ingresos);

  const totalGastos   = gastosF.reduce((a, r) => a + (r.monto || 0), 0);
  const totalIngresos = ingresosF.reduce((a, r) => a + (r.monto || 0), 0);
  const balance       = totalIngresos - totalGastos;
  const pctGastado    = totalIngresos > 0 ? Math.min((totalGastos / totalIngresos) * 100, 100) : 0;

  const byArea = Object.entries(AREAS).map(([id, info]) => ({
    ...info, id,
    value: gastosF.filter(g => g.area === id).reduce((a, r) => a + (r.monto || 0), 0),
  }));

  // Últimas 6 quincenas para la barra
  const quincenas = Array.from({ length: 6 }, (_, i) => {
    // retrocede de i quincenas desde hoy
    const base = new Date();
    // cada quincena ~15 días
    base.setDate(base.getDate() - (5 - i) * 15);
    const d = base.getDate();
    const m = base.getMonth();
    const y = base.getFullYear();
    let ini, fin;
    if (d >= 15) { ini = new Date(y, m, 14); fin = new Date(y, m, 28); }
    else         { ini = new Date(y, m - 1, 29); fin = new Date(y, m, 13); }
    const iniS = ini.toISOString().split("T")[0];
    const finS = fin.toISOString().split("T")[0];
    return { label: `${ini.getDate()}/${MESES[ini.getMonth()]}`, ini: iniS, fin: finS };
  });

  const barIngresos = quincenas.map(q => ingresos.filter(r => r.fecha >= q.ini && r.fecha <= q.fin).reduce((a, r) => a + r.monto, 0));
  const barGastos   = quincenas.map(q => gastos.filter(r => r.fecha >= q.ini && r.fecha <= q.fin).reduce((a, r) => a + r.monto, 0));

  const recientes = gastosF.slice(0, 5);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#b07080", fontSize: 16, fontWeight: 600 }}>Cargando... ✨</div>;

  return (
    <div style={{ paddingBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#6b3a4a", margin: 0 }}>Resumen 📊</h2>
        <button onClick={fetchData} style={{ background: "#fff0f3", border: "none", borderRadius: 10, padding: "6px 12px", color: "#e87a9b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>↻ Actualizar</button>
      </div>

      {/* Selector de período */}
      <SelectorPeriodo
        modo={modo}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onChange={handleFechaChange}
        onModoChange={handleModoChange}
      />

      {/* Cards Ingresos / Gastos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "linear-gradient(135deg,#c8f0dc,#edfbf3)", borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7aab8e" }}>INGRESOS</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#2d5a42", marginTop: 4 }}>{fmt(totalIngresos)}</div>
          <div style={{ fontSize: 11, color: "#7aab8e", marginTop: 2 }}>{ingresosF.length} registro{ingresosF.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg,#f9c5d1,#fff0f3)", borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b07080" }}>GASTOS</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#6b3a4a", marginTop: 4 }}>{fmt(totalGastos)}</div>
          <div style={{ fontSize: 11, color: "#b07080", marginTop: 2 }}>{gastosF.length} registro{gastosF.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Balance */}
      <div style={{ background: balance >= 0 ? "linear-gradient(135deg,#a8e6c4,#4caf82)" : "linear-gradient(135deg,#f9c5d1,#e87a9b)", borderRadius: 16, padding: "14px 16px", marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{balance >= 0 ? "✅ BALANCE POSITIVO" : "⚠️ BALANCE NEGATIVO"}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 2 }}>{fmt(Math.abs(balance))}</div>
        {balance < 0 && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>Estás gastando más de lo que ingresas</div>}
      </div>

      {/* Barra de progreso del gasto */}
      {totalIngresos > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "12px 16px", border: "1px solid #f5e6ea", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6b3a4a" }}>💸 Presupuesto utilizado</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: pctGastado > 85 ? "#e87a9b" : "#4caf82" }}>{Math.round(pctGastado)}%</span>
          </div>
          <div style={{ background: "#f5eaee", borderRadius: 20, height: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pctGastado}%`, background: pctGastado > 85 ? "linear-gradient(90deg,#f9c5d1,#e87a9b)" : "linear-gradient(90deg,#a8e6c4,#4caf82)", borderRadius: 20, transition: "width 0.6s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#b07080", marginTop: 6 }}>
            Te quedan <strong style={{ color: balance >= 0 ? "#4caf82" : "#e87a9b" }}>{fmt(Math.abs(balance))}</strong> {balance >= 0 ? "disponibles" : "en negativo"}
          </div>
        </div>
      )}

      {/* Donut por área */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 16, border: "1px solid #f5e6ea", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#6b3a4a", marginBottom: 12 }}>Gastos por Área</div>
        {totalGastos === 0 ? (
          <div style={{ textAlign: "center", color: "#c0a8b0", fontSize: 13, padding: "10px 0" }}>Sin gastos en este período</div>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <DonutChart data={byArea} total={totalGastos} />
            <div style={{ flex: 1 }}>
              {byArea.filter(a => a.value > 0).sort((a, b) => b.value - a.value).map(a => (
                <div key={a.id} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: "#6b3a4a", fontWeight: 600 }}>{a.icon} {a.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#e87a9b" }}>{fmt(a.value)}</span>
                  </div>
                  <div style={{ background: "#f5eaee", borderRadius: 10, height: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(a.value / totalGastos) * 100}%`, background: a.color, borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bar chart últimas 6 quincenas */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 16, border: "1px solid #f5e6ea", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#6b3a4a", marginBottom: 12 }}>Últimas 6 quincenas</div>
        <BarChart ingresos={barIngresos} gastos={barGastos} labels={quincenas.map(q => q.label)} />
      </div>

      {/* Gastos recientes del período */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 16, border: "1px solid #f5e6ea", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#6b3a4a", marginBottom: 12 }}>Gastos recientes del período</div>
        {recientes.length === 0 ? (
          <div style={{ textAlign: "center", color: "#c0a0a8", fontSize: 13, padding: "10px 0" }}>Sin gastos en este período</div>
        ) : recientes.map((g, i) => {
          const area = AREAS[g.area] || { label: g.area, icon: "📦", color: "#ddd" };
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < recientes.length - 1 ? "1px solid #faf0f3" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: area.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{area.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#6b3a4a" }}>{g.descripcion}</div>
                <div style={{ fontSize: 11, color: "#b07080" }}>{fmtFecha(g.fecha)} · {area.label}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#e87a9b" }}>-{fmt(g.monto)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}