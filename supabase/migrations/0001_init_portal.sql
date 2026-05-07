-- ============================================================
-- Portal Universitario — schema inicial
-- Ejecutar este fichero en el SQL Editor de Supabase
-- (Project: lfyymspgcayhxehjmala)
-- ============================================================

-- 1) Tabla extendida de usuarios
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  is_admin boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Asignaturas desbloqueadas por usuario
create table if not exists public.user_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_slug text not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.users(id),
  unique (user_id, subject_slug)
);

create index if not exists user_subjects_user_idx
  on public.user_subjects (user_id);

-- 3) Progreso por asignatura
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_slug text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, subject_slug)
);

create index if not exists progress_user_idx
  on public.progress (user_id);

-- 4) Trigger: cuando se crea un user en auth.users, espejarlo en public.users
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- 5) Helper: ¿el usuario actual es admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.users where id = auth.uid()),
    false
  );
$$;

-- 6) Habilitar RLS
alter table public.users enable row level security;
alter table public.user_subjects enable row level security;
alter table public.progress enable row level security;

-- ============================================================
-- POLÍTICAS RLS
-- ============================================================

-- USERS: cada uno lee su fila; admin lee todo y gestiona todo.
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists users_admin_insert on public.users;
create policy users_admin_insert on public.users
  for insert with check (public.is_admin());

drop policy if exists users_admin_delete on public.users;
create policy users_admin_delete on public.users
  for delete using (public.is_admin());

-- USER_SUBJECTS: el usuario lee las suyas; admin gestiona todas.
drop policy if exists user_subjects_self_read on public.user_subjects;
create policy user_subjects_self_read on public.user_subjects
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_subjects_admin_write on public.user_subjects;
create policy user_subjects_admin_write on public.user_subjects
  for all using (public.is_admin())
  with check (public.is_admin());

-- PROGRESS: el usuario lee y escribe sólo sus filas; admin lee.
drop policy if exists progress_self_read on public.progress;
create policy progress_self_read on public.progress
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists progress_self_insert on public.progress;
create policy progress_self_insert on public.progress
  for insert with check (user_id = auth.uid());

drop policy if exists progress_self_update on public.progress;
create policy progress_self_update on public.progress
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists progress_self_delete on public.progress;
create policy progress_self_delete on public.progress
  for delete using (user_id = auth.uid() or public.is_admin());

-- ============================================================
-- Trigger updated_at en progress
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists progress_touch_updated_at on public.progress;
create trigger progress_touch_updated_at
  before update on public.progress
  for each row execute function public.touch_updated_at();
