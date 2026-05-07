-- ============================================================
-- Tutor — circuit breaker, alertas y settings
-- Ejecutar después de 0002_tutor.sql
-- ============================================================

-- 1) Settings globales del tutor (singleton: id='default')
create table if not exists public.tutor_settings (
  id text primary key,
  paused boolean not null default false,
  daily_global_limit integer not null default 800,
  daily_user_limit integer not null default 50,
  alert_threshold_percent integer not null default 70,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id)
);

insert into public.tutor_settings (id) values ('default') on conflict (id) do nothing;

drop trigger if exists tutor_settings_touch_updated_at on public.tutor_settings;
create trigger tutor_settings_touch_updated_at
  before update on public.tutor_settings
  for each row execute function public.touch_updated_at();

-- 2) Log de alertas del circuit breaker
create table if not exists public.tutor_alerts (
  id uuid primary key default gen_random_uuid(),
  level text not null,                 -- 'warning' | 'critical' | 'info'
  message text not null,
  value integer,
  threshold integer,
  context jsonb,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tutor_alerts_created_at_idx
  on public.tutor_alerts (created_at desc);

-- ============================================================
-- RLS
-- ============================================================
alter table public.tutor_settings enable row level security;
alter table public.tutor_alerts enable row level security;

-- tutor_settings: cualquier usuario authenticated puede leer "paused"
-- (lo necesita la serverless con la service_role, pero también el admin
-- desde el cliente). Sólo admin escribe.
drop policy if exists tutor_settings_read on public.tutor_settings;
create policy tutor_settings_read on public.tutor_settings
  for select using (auth.uid() is not null);

drop policy if exists tutor_settings_admin_write on public.tutor_settings;
create policy tutor_settings_admin_write on public.tutor_settings
  for all using (public.is_admin())
  with check (public.is_admin());

-- tutor_alerts: sólo admin lee/escribe. La serverless usa service_role.
drop policy if exists tutor_alerts_admin_all on public.tutor_alerts;
create policy tutor_alerts_admin_all on public.tutor_alerts
  for all using (public.is_admin())
  with check (public.is_admin());
