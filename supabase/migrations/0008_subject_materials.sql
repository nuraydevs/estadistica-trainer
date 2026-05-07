-- ============================================================
-- Material por asignatura (PDFs + HTML extraído) + feedback
-- Ejecutar después de 0007_social.sql
-- ============================================================

create table if not exists public.subject_materials (
  id uuid primary key default gen_random_uuid(),
  subject_slug text not null,
  type text not null check (type in ('teoria', 'ejercicios', 'examen_anterior')),
  tema integer,
  title text not null,
  pdf_url text,
  pdf_storage_path text,
  html_content text,
  total_pages integer,
  coverage_pct integer not null default 0,
  last_verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subject_materials_subject_idx
  on public.subject_materials (subject_slug, tema);

drop trigger if exists subject_materials_touch on public.subject_materials;
create trigger subject_materials_touch
  before update on public.subject_materials
  for each row execute function public.touch_updated_at();

-- Feedback de los alumnos sobre el contenido del temario
create table if not exists public.content_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  subject_slug text not null,
  material_id uuid references public.subject_materials(id) on delete set null,
  section_anchor text,
  feedback text not null check (length(feedback) <= 500),
  resolved boolean not null default false,
  resolved_by uuid references public.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists content_feedback_pending_idx
  on public.content_feedback (resolved, created_at desc);

-- ============================================================
-- RLS
-- ============================================================
alter table public.subject_materials enable row level security;
alter table public.content_feedback enable row level security;

drop policy if exists subject_materials_read on public.subject_materials;
create policy subject_materials_read on public.subject_materials
  for select using (auth.uid() is not null);

drop policy if exists subject_materials_admin_write on public.subject_materials;
create policy subject_materials_admin_write on public.subject_materials
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists content_feedback_self_insert on public.content_feedback;
create policy content_feedback_self_insert on public.content_feedback
  for insert with check (user_id = auth.uid());

drop policy if exists content_feedback_self_read on public.content_feedback;
create policy content_feedback_self_read on public.content_feedback
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists content_feedback_admin_update on public.content_feedback;
create policy content_feedback_admin_update on public.content_feedback
  for update using (public.is_admin()) with check (public.is_admin());
