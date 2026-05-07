# Despliegue

## 0. Aplica las migraciones SQL en Supabase

Mi MCP no tiene permisos sobre el proyecto `lfyymspgcayhxehjmala`, así que las
migraciones las aplicas tú manualmente. **Ejecuta las tres en orden**:

1. Abre [SQL Editor del proyecto](https://supabase.com/dashboard/project/lfyymspgcayhxehjmala/sql/new)
2. Pega y ejecuta `supabase/migrations/0001_init_portal.sql`
3. Pega y ejecuta `supabase/migrations/0002_tutor.sql`
4. Pega y ejecuta `supabase/migrations/0003_tutor_circuit_breaker.sql`

Las tres deben terminar sin errores. Crean:
- **0001**: `users`, `user_subjects`, `progress` + RLS + triggers
- **0002**: `tutor_conversations`, `tutor_usage`, `tutor_files` + RLS
- **0003**: `tutor_settings` (singleton 'default'), `tutor_alerts` + RLS

> Si quieres que en el futuro yo aplique migraciones por MCP, añade el
> proyecto a la organización **Replikaagency** (que es la única a la que
> tengo acceso) o conéctame el otro Supabase.

## 1. Crea tu usuario admin

```bash
node scripts/create-admin.mjs replika.agency@gmail.com 'TU_PASSWORD' "Oliver García" "estadistica"
```

Después podrás entrar a `http://localhost:5173` con esas credenciales.

## 2. Push a GitHub

El repo actual es `nuraydevs/estadistica-trainer` (apunta solo a la app vieja).
Tienes 2 opciones limpias:

### Opción A · Reusar el mismo repo (recomendado)

Es un cambio grande de estructura pero el historial se conserva:

```bash
# desde la raíz del monorepo
cd "PROYECTO REMONTADA CURSO"
git status                     # verás Estadística movida a apps/estadistica/

# (opcional) renombra la rama principal/repo en GitHub a portal-universitario
# desde Settings del repo si quieres reflejarlo

git add -A
git commit -m "feat: monorepo Portal Universitario con login Supabase y 5 asignaturas"
git push origin main
```

### Opción B · Repo nuevo

Si prefieres dejar el repo viejo intacto:

```bash
cd "PROYECTO REMONTADA CURSO"
git remote remove origin
gh repo create portal-universitario --private --source=. --remote=origin --push
```

(o crea el repo en GitHub a mano y `git remote set-url origin <nueva-url>`).

## 3. Configura Vercel

El Vercel actual (`estadistica-trainer`, project `prj_oHx1pPNq2OI7UMfo784mRXplwvUY`)
apuntaba al directorio raíz de la app vieja. Tienes que decirle que ahora
el Vite live en `portal/`.

### Desde la UI de Vercel

1. Vercel → tu proyecto `estadistica-trainer` → **Settings → General**
2. **Root Directory** → `portal`
3. Build & Development Settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)
   - Install Command: `npm install` (default)
4. **Settings → Environment Variables** (Production y Preview):
   | Nombre | Valor |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://lfyymspgcayhxehjmala.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | el anon key |
   | `SUPABASE_URL` | `https://lfyymspgcayhxehjmala.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | la service_role key — **server-side only** |
   | `GEMINI_API_KEY` | tu API key de [Google AI Studio](https://aistudio.google.com/) |

   Las dos primeras (`VITE_*`) las usa el frontend. Las tres últimas son
   para la función serverless `/api/tutor` y **no llevan prefix `VITE_`**
   para que Vite no las exponga al cliente.
5. **Deployments** → trigger un redeploy del último commit.

### Desde CLI

```bash
cd portal
vercel link --project estadistica-trainer
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add GEMINI_API_KEY production
vercel --prod
```

> El proyecto Vercel quedará desplegando solo `portal/` pero el build verá el
> repo entero, así que las imports a `apps/estadistica/` (vía alias `@apps`)
> seguirán funcionando.

### (Opcional) Renombra el proyecto Vercel

Si quieres que la URL refleje la nueva identidad:
Vercel → Settings → General → **Project Name** → `portal-universitario`.
La URL pasará a `portal-universitario.vercel.app`. (El proyecto Vercel sigue
siendo el mismo, no rompe nada.)

## 4. Limpia los proyectos Vercel viejos

Como apuntas en CLAUDE.md, podemos borrar al pasada:

- `consentino-proyecto`
- `workspace-ia`
- `unicar-mvpp`, `unicar-mvp-2362`, `unicar-mvp`, `unicar-ev7n`, `unicar-jgud`, `unicar-a4jo`

(esto ya estaba pendiente; no es del portal). Avísame cuando quieras y los
borro con el MCP de Vercel.

## 5. Verificación post-deploy

1. Abre la URL de Vercel.
2. Login con tu admin.
3. En el hub debes ver Estadística disponible y las 4 restantes en
   "Próximamente".
4. Abre Estadística — debe cargar el contador, tabs y datos como antes.
5. Avanza algún ejercicio, recarga: el progreso persiste (Supabase).
6. Botón **Admin** en el header → ves la tabla de usuarios.
7. Esquina inferior derecha → botón flotante azul (Tutor). Pregunta algo
   del temario; la primera consulta tarda más (sube los PDFs a Gemini),
   las siguientes ya van rápidas (usa la cache `tutor_files`).

## 6. Notas del Tutor Gemini

- **Modelo**: `gemini-1.5-flash` con max output 600 tokens y temp 0.2.
- **Rate limit**: 50 preguntas/día por usuario y asignatura. Admin sin límite.
- **PDFs**: durante el build, `portal/scripts/sync-temario.mjs` copia los PDFs
  de `apps/<slug>/Temario UAL/` a `portal/.temario/<slug>/`. La función
  serverless los sube a la Files API de Gemini (caduca en ~48h) y guarda los
  `file_uri` en la tabla `tutor_files`. La siguiente invocación reutiliza la
  cache; cuando expira o cambias un PDF, lo re-sube automáticamente.
- **Vercel** incluye `.temario/**` en el bundle de la función vía
  [`portal/vercel.json`](portal/vercel.json) (`functions.includeFiles`).
- **Coste estimado real** (Estadística, 17MB de PDFs):
  - Input por turno (PDFs ya subidos a Files API + pregunta + ~6 mensajes
    de historial): ≈ 80-120k tokens dependiendo del temario activo.
  - Output: ≤600 tokens.
  - 50 preguntas/día/usuario · ~$0.075 / 1M input · ~$0.30 / 1M output
    ≈ **$0.45-0.55 por usuario y día** en peor caso.
  - El tier gratuito de Gemini cubre 1500 RPD y ~1M tokens/día → con un
    par de usuarios activos sale gratis.
- **Limitaciones conocidas**:
  - Si renombras o sustituyes un PDF, la cache detecta el cambio de tamaño
    y re-sube. Si solo lo editas con el mismo nombre y mismo tamaño exacto
    (improbable), forzar re-sync con `npm run sync-temario` y vaciando la
    fila en `tutor_files`.
  - La función serverless de Vercel tiene `maxDuration: 30s`. La primera
    consulta (cuando hay que re-subir PDFs) puede acercarse a ese límite.
    Si te pasa, sube el plan o procesa la subida en un job separado.
