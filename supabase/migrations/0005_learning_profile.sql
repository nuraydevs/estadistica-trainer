-- ============================================================
-- Memoria persistente del alumno: perfil de aprendizaje
-- Ejecutar después de 0004_sessions_and_payments.sql
-- ============================================================

create table if not exists public.learning_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_slug text not null,
  concepts_mastered jsonb not null default '[]'::jsonb,    -- array de strings
  concepts_weak jsonb not null default '[]'::jsonb,         -- array de {concept, fail_count, last_failed}
  concepts_broken jsonb not null default '[]'::jsonb,       -- array de strings
  recent_history jsonb not null default '[]'::jsonb,        -- array de { concept, result, ts } últimos 30
  avg_session_minutes integer not null default 0,
  best_hour integer,                                        -- 0-23
  hour_counts jsonb not null default '{}'::jsonb,           -- { "9": 12, "10": 5, ... }
  total_exercises_done integer not null default 0,
  total_exercises_failed integer not null default 0,
  streak_days integer not null default 0,
  last_study_date date,
  updated_at timestamptz not null default now(),
  unique (user_id, subject_slug)
);

create index if not exists learning_profile_user_idx on public.learning_profile (user_id);

drop trigger if exists learning_profile_touch on public.learning_profile;
create trigger learning_profile_touch
  before update on public.learning_profile
  for each row execute function public.touch_updated_at();

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_slug text not null,
  exercise_id text not null,
  concept text,
  result text not null check (result in ('correct', 'failed', 'gave_up')),
  hints_used integer not null default 0,
  time_spent_seconds integer not null default 0,
  attempted_at timestamptz not null default now()
);

create index if not exists exercise_attempts_user_idx on public.exercise_attempts (user_id, attempted_at desc);
create index if not exists exercise_attempts_concept_idx on public.exercise_attempts (subject_slug, concept);

-- ============================================================
-- RLS
-- ============================================================
alter table public.learning_profile enable row level security;
alter table public.exercise_attempts enable row level security;

drop policy if exists learning_profile_self_all on public.learning_profile;
create policy learning_profile_self_all on public.learning_profile
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

drop policy if exists exercise_attempts_self_read on public.exercise_attempts;
create policy exercise_attempts_self_read on public.exercise_attempts
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists exercise_attempts_self_insert on public.exercise_attempts;
create policy exercise_attempts_self_insert on public.exercise_attempts
  for insert with check (user_id = auth.uid());

drop policy if exists exercise_attempts_admin_delete on public.exercise_attempts;
create policy exercise_attempts_admin_delete on public.exercise_attempts
  for delete using (public.is_admin());
