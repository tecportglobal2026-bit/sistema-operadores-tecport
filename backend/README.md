# Backend — Sistema de Gestión de Operadores TECPORT

API en Node.js + Express + Prisma, sobre PostgreSQL administrado por Supabase. Valida sesiones mediante Supabase Auth (no maneja contraseñas ni emite tokens propios).

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Levanta el servidor con recarga automática (nodemon) |
| `npm start` | Aplica migraciones pendientes y arranca el servidor (usado en producción) |
| `npm run prisma:generate` | Regenera el cliente de Prisma a partir de `prisma/schema.prisma` |
| `npm run prisma:migrate:dev` | Crea y aplica una nueva migración en desarrollo |
| `npm run prisma:migrate` | Aplica migraciones pendientes sin generar una nueva (`migrate deploy`) |
| `npm run prisma:studio` | Abre Prisma Studio para inspeccionar la base de datos |
| `npm run crear-admin` | Crea un usuario en Supabase Auth + su `admin_profile` |

## Variables de entorno

Ver `.env.example`. Notas importantes:

- `DATABASE_URL` usa el **Transaction Pooler** de Supabase (puerto 6543) — la usa la app en runtime.
- `DIRECT_URL` usa el **Session Pooler** de Supabase (puerto 5432, mismo host que el pooler) — la usa Prisma Migrate. No usamos la conexión directa (`db.<ref>.supabase.co`) porque es solo IPv6 y muchas redes no tienen salida IPv6.
- `SUPABASE_SERVICE_ROLE_KEY` es secreta: nunca debe ir al frontend.

## Crear un nuevo administrador

No hay endpoint público de registro (por diseño: solo el equipo de TECPORT puede crear administradores). Para crear uno nuevo:

```bash
npm run crear-admin -- "correo@tecportla.com" "ContraseñaSegura123!" "Nombre Completo"
```

Esto crea el usuario en Supabase Auth y su fila en `admin_profiles` con `rol=admin` y `activo=true`.

## Notas de diseño

- El campo `certificaciones.estado` se recalcula contra la fecha actual en cada lectura (`resolverEstadoActual`), no solo al crear/editar. Así se evita mostrar un estado desactualizado (ej. "vigente" semanas después de vencida) sin necesidad de un cron job.
- `codigo_operador` se genera con la secuencia de Postgres `operador_codigo_seq` (creada manualmente, ver raíz del proyecto) para evitar colisiones ante creaciones concurrentes.
- No existen endpoints `DELETE`: empresas, equipos, operadores y certificaciones nunca se eliminan físicamente, solo se desactivan/inactivan.
