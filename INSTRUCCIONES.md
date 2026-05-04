# 🏡 Mi Familia - Control de Finanzas
## Guía de Instalación Completa

---

## 🗄️ PASO 1: Configurar Supabase (Base de datos GRATIS)

1. Ve a **https://supabase.com** y crea una cuenta gratis
2. Crea un **nuevo proyecto** (elige la región más cercana: South America)
3. Espera ~2 minutos a que se inicialice
4. Ve a **SQL Editor** (menú lateral) y pega el contenido de `supabase_schema.sql`
5. Presiona **Run** para crear las tablas

### Obtener tus credenciales:
- Ve a **Settings > API**
- Copia el **Project URL** → es tu `SUPABASE_URL`
- Copia la **anon public key** → es tu `SUPABASE_ANON_KEY`

---

## ⚙️ PASO 2: Configurar la app

Abre `src/App.jsx` y reemplaza las líneas:
```js
const SUPABASE_URL = "https://TU_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";
```
Con tus credenciales reales de Supabase.

---

## 💻 PASO 3: Instalar y correr localmente

Necesitas tener **Node.js** instalado (https://nodejs.org).

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5173`

---

## 📱 PASO 4: Acceso desde el celular (red local)

Cuando corras `npm run dev`, Vite te mostrará algo como:
```
  Local:   http://localhost:5173/
  Network: http://192.168.1.X:5173/
```

Desde tu celular (en la misma WiFi), abre la dirección de **Network**.

---

## 🌐 PASO 5 (Opcional): Deploy gratis para acceso desde cualquier lugar

### Opción A - Vercel (recomendado):
1. Crea cuenta en https://vercel.com
2. Sube el proyecto a GitHub
3. Conecta el repo en Vercel → deploy automático ✨

### Opción B - Netlify:
1. Crea cuenta en https://netlify.com
2. Arrastra la carpeta `dist` (después de correr `npm run build`)

---

## 📁 Estructura del proyecto

```
familia-finanzas/
├── index.html
├── package.json
├── vite.config.js
├── supabase_schema.sql    ← Ejecutar en Supabase
└── src/
    ├── main.jsx
    ├── App.jsx            ← Configurar credenciales aquí
    └── pages/
        ├── Gastos.jsx
        ├── Ingresos.jsx
        └── Resumen.jsx
```

---

## 🆓 Plan gratuito de Supabase incluye:
- ✅ 500 MB de base de datos
- ✅ 2 GB de transferencia
- ✅ Más que suficiente para uso familiar

---

¡Listo! 🎉 Si tienes dudas, el proyecto está diseñado para funcionar solo entre tú y tu esposa sin ningún costo.
