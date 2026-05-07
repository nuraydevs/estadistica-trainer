-- ============================================================
-- Sessions tracking, alertas anti-sharing y pagos manuales
-- Ejecutar después de 0003_tutor_circuit_breaker.sql
-- ============================================================

-- 1) Columnas extra en users
alter table public.users add column if not exists last_ip text;
alter table public.users add column if not exists last_seen_at timestamptz;
alter table public.users add column if not exists total_sessions integer not null default 0;
alter table public.users add column if not exists suspicious boolean not null default false;

-- 2) Sesiones activas/recientes
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_token text not null unique,
  ip_address text,
  user_agent text,
  device_fingerprint text,
  subject_slug text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true
);

create index if not exists sessions_user_idx on public.sessions (user_id);
create index if not exists sessions_last_seen_idx on public.sessions (last_seen_at desc);
create index if not exists sessions_active_idx on public.sessions (user_id, is_active);

-- 3) Alertas de uso sospechoso
create table if not exists public.session_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  alert_type text not null,        -- multiple_ips | concurrent_sessions | unusual_hours | too_fast
  details jsonb not null default '{}'::jsonb,
  reviewed boolean not null default false,
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create index if not exists session_alerts_user_idx on public.session_alerts (user_id);
create index if not exists session_alerts_pending_idx on public.session_alerts (reviewed, created_at desc);

-- 4) Pagos manuales (efectivo, bizum, transferencia)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text not null default 'EUR',
  subject_slug text,
  payment_method text not null,    -- efectivo | bizum | transferencia | otros
  notes text,
  registered_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists payments_month_idx on public.payments (created_at desc);

-- ============================================================
-- RLS: las tres son sólo para admin desde el cliente.
-- La service_role (serverless) bypassea RLS.
-- ============================================================

alter table public.sessions enable row level security;
alter table public.session_alerts enable row level security;
alter table public.payments enable row level security;

drop policy if exists sessions_admin_all on public.sessions;
create policy sessions_admin_all on public.sessions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists session_alerts_admin_all on public.session_alerts;
create policy session_alerts_admin_all on public.session_alerts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists payments_admin_all on public.payments;
create policy payments_admin_all on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- El propio usuario puede leer sus pagos (factura/recibo) pero no editarlos.
drop policy if exists payments_self_read on public.payments;
create policy payments_self_read on public.payments
  for select using (user_id = auth.uid() or public.is_admin());
