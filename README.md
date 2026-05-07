# Portal Universitario — Remontada Curso

Plataforma de estudio que engloba 5 asignaturas. Vainilla JS + Vite + Supabase.

## Estructura

```
.
├── portal/                       Aplicación principal (login, hub, admin, tutor)
│   ├── package.json
│   ├── vite.config.js            con plugin que sirve /api/* en dev
│   ├── vercel.json               includeFiles para .temario/
│   ├── index.html
│   ├── .env.local                claves Supabase + Gemini (gitignored)
│   ├── .env.example
│   ├── api/
│   │   ├── tutor.js              serverless: auth + Gemini + rate limit
│   │   └── _lib/
│   │       ├── gemini-files.js   upload/cache de PDFs a Gemini Files API
│   │       └── prompts.js        system prompts por asignatura
│   ├── scripts/sync-temario.mjs  copia PDFs a .temario/ (predev/prebuild)
│   ├── .temario/                 PDFs sincronizados (gitignored)
│   └── src/
│       ├── main.js               orquestador (router básico)
│       ├── lib/                  supabase, auth, progress, subjects, gemini
│       ├── pages/                Login, Hub, SubjectView, AdminPanel
│       ├── components/           Header, SubjectCard, Tutor
│       └── styles/main.css       paleta dark heredada de Estadística
│
├── apps/
│   ├── estadistica/              ✅ construida (con getCurrentContext)
│   │   └── Temario UAL/          PDFs originales (origen del .temario)
│   ├── fisica/                   ⏳ pendiente
│   ├── tecnologia/               ⏳ pendiente
│   ├── programacion-c/           ⏳ pendiente
│   └── matematicas/              ⏳ pendiente
│
├── supabase/migrations/
│   ├── 0001_init_portal.sql      tablas core + RLS
│   └── 0002_tutor.sql            tablas del tutor (conversations, usage, files)
│
└── scripts/
    └── create-admin.mjs          crea/promueve usuario admin (service_role)
```

## Asignaturas

| Slug             | Estado          | Notas                                         |
| ---------------- | --------------- | --------------------------------------------- |
| `estadistica`    | ✅ construida    | Movida a `apps/estadistica/`, expone `mount()` |
| `fisica`         | ⏳ esqueleto     | Carpeta vacía + README                        |
| `tecnologia`     | ⏳ esqueleto     | Carpeta vacía + README                        |
| `programacion-c` | ⏳ esqueleto     | Carpeta vacía + README                        |
| `matematicas`    | ⏳ esqueleto     | Carpeta vacía + README                        |

Para activar una asignatura nueva, expón un módulo `apps/<slug>/src/main.js` con
`export function mount(container, ctx)` y cambia el flag `available` y el
`loader` en [`portal/src/lib/subjects.js`](portal/src/lib/subjects.js).

## Esquema de base de datos (Supabase)

**0001 — core**
- `public.users` — espejo de `auth.users` con `is_admin`, `active`, `full_name`
- `public.user_subjects` — qué asignaturas tiene cada usuario
- `public.progress` — JSONB con el estado por usuario y asignatura
- Trigger `on_auth_user_created` espeja altas de auth en `public.users`
- RLS activa en las tres tablas (cada usuario solo ve lo suyo, admins ven todo)

**0002 — tutor Gemini**
- `public.tutor_conversations` — historial por (usuario, asignatura)
- `public.tutor_usage` — contador diario para rate limit (50/día)
- `public.tutor_files` — cache de los `file_uri` que devuelve Gemini File API

Ver
[`supabase/migrations/0001_init_portal.sql`](supabase/migrations/0001_init_portal.sql)
y
[`supabase/migrations/0002_tutor.sql`](supabase/migrations/0002_tutor.sql).

## Cómo arrancar en local

```bash
# 1) instalar dependencias del portal
cd portal
npm install

# 2) variables de entorno (ya hay .env.local con tus claves)
#    si las quieres regenerar:
cp .env.example .env.local
# y rellena:
#   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY      (cliente)
#   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY        (server)
#   GEMINI_API_KEY  (o GOOGLE_AI_API_KEY)          (server, tutor)

# 3) dev server (incluye plugin que sirve /api/tutor en local)
npm run dev
# → http://localhost:5173
```

> El predev script copia los PDFs de `apps/<slug>/Temario UAL/` a
> `portal/.temario/<slug>/` para que la función serverless los encuentre con
> el mismo path en local y en Vercel.

## Crear el primer admin (tú)

Ejecuta una sola vez después de aplicar la migración SQL:

```bash
# desde la raíz del repo
node scripts/create-admin.mjs replika.agency@gmail.com 'tu-password' "Oliver García"
```

El script:
1. Crea el usuario en `auth.users` (o lo recupera si ya existe).
2. Lo marca como `is_admin = true` en `public.users`.
3. Le desbloquea `estadistica` por defecto (puedes pasar más slugs como 4º arg
   separados por coma, ej. `"estadistica,fisica"`).

## Aplicar la migración SQL

Mi MCP no tiene permisos sobre el proyecto Supabase `lfyymspgcayhxehjmala`, así
que tienes que aplicar la migración manualmente:

1. Abre <https://supabase.com/dashboard/project/lfyymspgcayhxehjmala/sql/new>
2. Pega el contenido de `supabase/migrations/0001_init_portal.sql`
3. Ejecuta. Debe terminar sin errores.

## Despliegue en Vercel

Ver [`DEPLOY.md`](DEPLOY.md).
