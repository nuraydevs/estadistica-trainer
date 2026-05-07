-- ============================================================
-- Capa social: perfiles públicos, presencia online, ranking
-- Ejecutar después de 0006_exam_simulator.sql
-- ============================================================

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  avatar_type text not null default 'none' check (avatar_type in ('photo', 'generated', 'none')),
  show_in_ranking boolean not null default true,
  show_online_status boolean not null default true,
  bio text,
  warned_at timestamptz,
  avatar_banned boolean not null default false,
  ban_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_profiles_touch on public.user_profiles;
create trigger user_profiles_touch
  before update on public.user_profiles
  for each row execute function public.touch_updated_at();

create table if not exists public.online_presence (
  user_id uuid primary key references public.users(id) on delete cascade,
  subject_slug text,
  current_section text,
  is_visible boolean not null default true,
  last_seen timestamptz not null default now()
);

create index if not exists online_presence_subject_idx
  on public.online_presence (subject_slug, last_seen desc);

create table if not exists public.community_stats (
  subject_slug text primary key,
  hardest_exercises jsonb not null default '[]'::jsonb,
  most_studied_today jsonb not null default '[]'::jsonb,
  active_users_today integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table public.user_profiles enable row level security;
alter table public.online_presence enable row level security;
alter table public.community_stats enable row level security;

-- user_profiles: cualquier authenticated lee perfiles que no estén baneados;
-- el propio usuario puede insert/update; admin todo.
drop policy if exists user_profiles_read on public.user_profiles;
create policy user_profiles_read on public.user_profiles
  for select using (auth.uid() is not null);

drop policy if exists user_profiles_self_write on public.user_profiles;
create policy user_profiles_self_write on public.user_profiles
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- online_presence: cada usuario gestiona su fila; cualquier authenticated lee
-- las filas con is_visible=true.
drop policy if exists online_presence_read on public.online_presence;
create policy online_presence_read on public.online_presence
  for select using (auth.uid() is not null and (is_visible or user_id = auth.uid() or public.is_admin()));

drop policy if exists online_presence_self_write on public.online_presence;
create policy online_presence_self_write on public.online_presence
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- community_stats: cualquier authenticated lee.
drop policy if exists community_stats_read on public.community_stats;
create policy community_stats_read on public.community_stats
  for select using (auth.uid() is not null);

drop policy if exists community_stats_admin_write on public.community_stats;
create policy community_stats_admin_write on public.community_stats
  for all using (public.is_admin()) with check (public.is_admin());
