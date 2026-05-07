-- ============================================================
-- Tutor Gemini — schema
-- Ejecutar después de 0001_init_portal.sql
-- ============================================================

-- 1) Conversaciones (una por usuario+asignatura)
create table if not exists public.tutor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_slug text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, subject_slug)
);

create index if not exists tutor_conversations_user_idx
  on public.tutor_conversations (user_id);

drop trigger if exists tutor_conversations_touch_updated_at on public.tutor_conversations;
create trigger tutor_conversations_touch_updated_at
  before update on public.tutor_conversations
  for each row execute function public.touch_updated_at();

-- 2) Uso diario (rate limit: 50/día por usuario)
create table if not exists public.tutor_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_slug text not null,
  tokens_used integer not null default 0,
  questions_count integer not null default 0,
  date date not null default current_date,
  unique (user_id, subject_slug, date)
);

create index if not exists tutor_usage_user_date_idx
  on public.tutor_usage (user_id, date);

-- 3) Cache de archivos subidos a Gemini File API
--    file_uri expira ~48h. Cada subject puede tener varios PDFs.
create table if not exists public.tutor_files (
  id uuid primary key default gen_random_uuid(),
  subject_slug text not null,
  source_path text not null,        -- path relativo dentro del repo
  source_size bigint,
  source_mtime timestamptz,
  file_uri text not null,           -- URI devuelta por Gemini File API
  mime_type text not null default 'application/pdf',
  display_name text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (subject_slug, source_path)
);

create index if not exists tutor_files_subject_idx
  on public.tutor_files (subject_slug);

-- ============================================================
-- RLS
-- ============================================================
alter table public.tutor_conversations enable row level security;
alter table public.tutor_usage enable row level security;
alter table public.tutor_files enable row level security;

-- tutor_conversations: usuario lee/escribe las suyas; admin lee todas.
drop policy if exists tutor_conversations_self_read on public.tutor_conversations;
create policy tutor_conversations_self_read on public.tutor_conversations
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists tutor_conversations_self_write on public.tutor_conversations;
create policy tutor_conversations_self_write on public.tutor_conversations
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- tutor_usage: idem
drop policy if exists tutor_usage_self_read on public.tutor_usage;
create policy tutor_usage_self_read on public.tutor_usage
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists tutor_usage_self_write on public.tutor_usage;
create policy tutor_usage_self_write on public.tutor_usage
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- tutor_files: solo gestionado por la función serverless (service_role bypassea RLS).
-- No damos política pública: los anon/authenticated no la leen.
-- Se necesita revoke explícito para que ni siquiera authenticated tenga acceso.
revoke all on public.tutor_files from anon, authenticated;
