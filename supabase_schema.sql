-- =============================================
-- EJECUTA ESTO EN EL SQL EDITOR DE SUPABASE
-- supabase.com > Tu proyecto > SQL Editor
-- =============================================

-- Tabla de GASTOS
CREATE TABLE gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  nota TEXT,
  metodo TEXT NOT NULL CHECK (metodo IN ('Efectivo','Débito','Crédito')),
  meses INTEGER,
  area TEXT NOT NULL CHECK (area IN ('hogar','alimentacion','transporte','salud','entretenimiento','ahorro','otros')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de INGRESOS
CREATE TABLE ingresos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  nota TEXT,
  fuente TEXT DEFAULT 'Salario',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (pero permitir todo por ahora para uso familiar)
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo (para uso personal sin autenticación)
CREATE POLICY "allow_all_gastos" ON gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ingresos" ON ingresos FOR ALL USING (true) WITH CHECK (true);
