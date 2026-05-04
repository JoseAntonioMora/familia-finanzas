import { useState } from "react";

const pastel = {
  card: "#fff",
  border: "#e6f5ec",
  accent: "#4caf82",
  accentLight: "#edfbf3",
  text: "#2d5a42",
  sub: "#7aab8e",
  pink: "#e87a9b",
};

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: pastel.sub, marginBottom: 4, display: "block" }}>{label}</label>
      <input {...props} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${pastel.border}`, background: "#fafafa", fontSize: 15, color: pastel.text, fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: pastel.sub, marginBottom: 4, display: "block" }}>{label}</label>
      <textarea {...props} rows={2} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${pastel.border}`, background: "#fafafa", fontSize: 15, color: pastel.text, fontFamily: "Nunito, sans-serif", outline: "none", resize: "none", boxSizing: "border-box" }} />
    </div>
  );
}

const FUENTES = ["Salario", "Vales", "Otro"];

export default function Ingresos({ supabase }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ monto: "", fecha: today, descripcion: "", nota: "", fuente: "Salario" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.monto || !form.descripcion) { setError("Por favor completa monto y descripción."); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.from("ingresos").insert([{
        monto: parseFloat(form.monto),
        fecha: form.fecha,
        descripcion: form.descripcion,
        nota: form.nota,
        fuente: form.fuente,
      }]);
      if (err) throw err;
      setSuccess(true);
      setForm({ monto: "", fecha: today, descripcion: "", nota: "", fuente: "Salario" });
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) { setError("Error al guardar: " + e.message); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: pastel.text, margin: "0 0 16px" }}>Registrar Ingreso 💰</h2>

      {/* Fuente */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: pastel.sub, marginBottom: 8 }}>FUENTE DE INGRESO</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FUENTES.map(f => (
            <button key={f} onClick={() => set("fuente", f)} style={{ padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${form.fuente === f ? pastel.accent : pastel.border}`, background: form.fuente === f ? pastel.accentLight : "#fff", color: form.fuente === f ? pastel.accent : pastel.sub, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: pastel.card, borderRadius: 18, padding: 16, border: `1px solid ${pastel.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ background: "linear-gradient(135deg, #c8f0dc, #edfbf3)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: pastel.sub }}>MONTO A REGISTRAR</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 22, color: pastel.accent, fontWeight: 700 }}>$</span>
            <input type="number" placeholder="0.00" value={form.monto} onChange={e => set("monto", e.target.value)} style={{ border: "none", background: "transparent", fontSize: 32, fontWeight: 800, color: pastel.text, width: 160, textAlign: "center", fontFamily: "Nunito, sans-serif", outline: "none" }} />
          </div>
        </div>

        <Input label="FECHA" type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} />
        <Input label="DESCRIPCIÓN" placeholder="¿De dónde viene este ingreso?" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} />
        <Textarea label="NOTA (opcional)" placeholder="Notas adicionales..." value={form.nota} onChange={e => set("nota", e.target.value)} />

        {error && <div style={{ background: "#ffe0e0", borderRadius: 10, padding: "10px 14px", color: "#c0403a", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{error}</div>}

        {success && (
          <div style={{ background: pastel.accentLight, borderRadius: 10, padding: "10px 14px", color: pastel.accent, fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>
            ✅ ¡Ingreso guardado exitosamente!
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 14, background: loading ? "#c0e8d0" : "linear-gradient(135deg, #a8e6c4, #4caf82)", color: "#fff", fontWeight: 800, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 14px rgba(76,175,130,0.35)" }}>
          {loading ? "Guardando..." : "💾 Guardar Ingreso"}
        </button>
      </div>
    </div>
  );
}
