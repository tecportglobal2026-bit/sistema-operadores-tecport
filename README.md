# Sistema de Gestión de Operadores TECPORT

Plataforma administrativa para registrar operadores de equipos portuarios e industriales, asociarlos a empresas y equipos, y controlar certificaciones como evidencia administrativa (no emite certificados oficiales — eso es responsabilidad de Tecport Academy, un proyecto aparte).

## Arquitectura

```
sistema-operadores-tecport/
├── frontend/   → React + Vite + Tailwind, desplegado en Netlify
└── backend/    → Node.js + Express + Prisma, desplegado en Railway
```

- **Base de datos**: PostgreSQL administrado por Supabase.
- **Autenticación**: Supabase Auth (el backend no genera tokens propios ni guarda contraseñas).
- Flujo: `Frontend (Netlify) → Supabase Auth (login) → Backend (Railway) valida el token → Prisma → Supabase PostgreSQL`.

## Requisitos previos

- Node.js 18+
- Un proyecto de Supabase ya creado (URL, anon key, service role key, cadena de conexión a la base de datos)
- Cuentas en Netlify y Railway (solo para deploy)

## Ejecutar localmente

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # completa con tus credenciales reales de Supabase
npx prisma migrate dev --name init   # solo la primera vez
npm run dev
```

El backend queda en `http://localhost:3000`. Verifica con `curl http://localhost:3000/api/health`.

**Primera vez únicamente** — crea la secuencia para los códigos de operador (en el SQL Editor de Supabase, o vía `prisma db execute`):

```sql
CREATE SEQUENCE IF NOT EXISTS operador_codigo_seq START 1;
```

Y crea tu primer administrador:

```bash
npm run crear-admin -- "tu-correo@tecportla.com" "TuContraseñaSegura123!" "Tu Nombre"
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=http://localhost:3000/api
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con el administrador que creaste.

## Deploy

### Base de datos — Supabase

Ya la tienes creada. Solo asegúrate de:
- Haber corrido las migraciones (`prisma migrate deploy`, ver abajo).
- Haber creado la secuencia `operador_codigo_seq` (ver arriba).
- Tener al menos un `admin_profile` activo (script `crear-admin`).

### Backend — Railway

1. Conecta el repositorio de GitHub a Railway.
2. En la configuración del servicio, define **Root Directory** = `backend` (es un monorepo).
3. Variables de entorno a configurar en Railway (mismas claves que `.env.example`, valores reales de producción):
   - `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL` → la URL de tu sitio en Netlify (ej. `https://operadores-tecport.netlify.app`)
   - `NODE_ENV=production`
   - No definas `PORT` manualmente: Railway lo inyecta automáticamente y el código ya usa `process.env.PORT`.
4. Railway ejecuta `npm install` (que corre `postinstall: prisma generate`) y luego `npm start`, que ahora aplica automáticamente las migraciones pendientes (`prisma migrate deploy`) antes de levantar el servidor.
5. Verifica el deploy con `GET https://tu-backend.up.railway.app/api/health`.

### Frontend — Netlify

1. Conecta el mismo repositorio a Netlify.
2. **Base directory**: `frontend`.
3. **Build command**: `npm run build` (ya está en `frontend/netlify.toml`).
4. **Publish directory**: `dist`.
5. Variables de entorno en Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` → `https://tu-backend.up.railway.app/api`
6. `frontend/public/_redirects` ya está configurado para que las rutas de React Router (`/operadores/123`, etc.) no den 404 al refrescar la página en Netlify.

### Después del primer deploy

Actualiza `FRONTEND_URL` en Railway con el dominio final de Netlify (si cambia respecto al que pusiste antes) para que CORS funcione correctamente.

## Estructura de módulos

Login · Dashboard · Operadores (listado, nuevo, detalle, editar) · Empresas · Equipos · Certificaciones.

Ver `backend/README.md` para detalles de la API y decisiones de diseño del backend.
