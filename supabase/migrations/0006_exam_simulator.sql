-- ============================================================
-- Simulacro de examen + corrección IA + fechas de examen
-- Ejecutar después de 0005_learning_profile.sql
-- ============================================================

-- Tabla `subjects` para metadata editable desde admin (fechas de examen).
-- El catálogo principal vive en código (subjects.js); aquí solo guardamos
-- atributos que cambian en tiempo de ejecución.
create table if not exists public.subjects (
  slug text primary key,
  exam_date date,
  notes text,
  updated_at timestamptz not null default now()
);

drop trigger if exists subjects_touch on public.subjects;
create trigger subjects_touch
  before update on public.subjects
  for each row execute function public.touch_updated_at();

-- Sesiones de examen
create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_slug text not null,
  exam_type text not null check (exam_type in ('parcial', 'completo', 'panico', 'custom')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  time_limit_minutes integer not null default 60,
  score numeric(4,2),
  max_score numeric(4,2),
  status text not null default 'active' check (status in ('active', 'finished', 'abandoned')),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists exam_sessions_user_idx on public.exam_sessions (user_id, started_at desc);

-- Respuestas + correcciones
create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  exam_session_id uuid not null references public.exam_sessions(id) on delete cascade,
  question_id text not null,
  question_statement text,
  user_answer text,
  ai_correction jsonb,
  score numeric(4,2),
  max_score numeric(4,2),
  time_spent_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists exam_answers_session_idx on public.exam_answers (exam_session_id);

-- ============================================================
-- RLS
-- ============================================================
alter table public.subjects enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_answers enable row level security;

-- subjects: cualquier authenticated lee; sólo admin escribe.
drop policy if exists subjects_read on public.subjects;
create policy subjects_read on public.subjects
  for select using (auth.uid() is not null);

drop policy if exists subjects_admin_write on public.subjects;
create policy subjects_admin_write on public.subjects
  for all using (public.is_admin()) with check (public.is_admin());

-- exam_sessions: el alumno gestiona las suyas; admin lee todas.
drop policy if exists exam_sessions_self_all on public.exam_sessions;
create policy exam_sessions_self_all on public.exam_sessions
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- exam_answers: el alumno lee/escribe las suyas (a través de la sesión)
drop policy if exists exam_answers_self_read on public.exam_answers;
create policy exam_answers_self_read on public.exam_answers
  for select using (
    exists (
      select 1 from public.exam_sessions s
      where s.id = exam_answers.exam_session_id
        and (s.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists exam_answers_self_write on public.exam_answers;
create policy exam_answers_self_write on public.exam_answers
  for all using (
    exists (
      select 1 from public.exam_sessions s
      where s.id = exam_answers.exam_session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.exam_sessions s
      where s.id = exam_answers.exam_session_id and s.user_id = auth.uid()
    )
  );

-- Pre-llenar slugs conocidos
insert into public.subjects (slug) values
  ('estadistica'), ('fisica'), ('tecnologia'), ('programacion-c'), ('matematicas')
on conflict (slug) do nothing;
