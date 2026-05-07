import { supabase } from '../../lib/supabase.js';
import { openStudentDetail } from './StudentDetail.js';

export async function render(container) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'admin-tab-alerts';
  wrap.innerHTML = `
    <p class="muted">Alertas de uso sospechoso pendientes de revisar.</p>
    <div id="alerts-list"></div>
  `;
  container.appendChild(wrap);

  const listEl = wrap.querySelector('#alerts-list');

  async function refresh() {
    listEl.innerHTML = '<p class="muted">Cargando…</p>';
    const { data: alerts } = await supabase
      .from('session_alerts')
      .select('id, alert_type, details, created_at, user_id')
      .eq('reviewed', false)
      .order('created_at', { ascending: false });

    if (!alerts?.length) {
      listEl.innerHTML = '<div class="admin-empty">Sin alertas pendientes 🎉</div>';
      return;
    }

    const userIds = Array.from(new Set(alerts.map((a) => a.user_id)));
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, active, suspicious')
      .in('id', userIds);
    const userMap = new Map((users || []).map((u) => [u.id, u]));

    listEl.innerHTML = '';
    alerts.forEach((a) => {
      const u = userMap.get(a.user_id) || { email: a.user_id };
      listEl.appendChild(buildCard(a, u, refresh));
    });
  }

  await refresh();
}

function buildCard(alert, user, refresh) {
  const card = document.createElement('article');
  card.className = 'alert-card';
  const description = describeAlert(alert);
  card.innerHTML = `
    <div class="alert-card__head">
      <div>
        <strong>${escapeHtml(user.full_name || user.email)}</strong>
        <span class="dim"> · ${escapeHtml(user.email)}</span>
      </div>
      <span class="dim">${formatRelative(alert.created_at)}</span>
    </div>
    <div class="alert-card__type">${alertLabel(alert.alert_type)}</div>
    <div class="alert-card__desc">${description}</div>
    <details class="alert-card__details"><summary>Detalles técnicos</summary><pre>${escapeHtml(JSON.stringify(alert.details, null, 2))}</pre></details>
    <div class="actions">
      <button class="btn btn--sm" data-action="view">Ver alumno</button>
      <button class="btn btn--sm" data-action="review">Marcar revisada</button>
      <button class="btn btn--sm btn--danger" data-action="deactivate">Desactivar cuenta</button>
    </div>
  `;

  card.querySelector('[data-action="view"]').addEventListener('click', () => {
    openStudentDetail({ user, onChange: refresh });
  });
  card.querySelector('[data-action="review"]').addEventListener('click', async () => {
    await supabase.from('session_alerts').update({
      reviewed: true,
      reviewed_at: new Date().toISOString()
    }).eq('id', alert.id);
    refresh();
  });
  card.querySelector('[data-action="deactivate"]').addEventListener('click', async () => {
    if (!confirm('¿Desactivar la cuenta de este alumno?')) return;
    await supabase.from('users').update({ active: false }).eq('id', user.id);
    await supabase.from('session_alerts').update({
      reviewed: true,
      reviewed_at: new Date().toISOString()
    }).eq('id', alert.id);
    refresh();
  });

  return card;
}

function alertLabel(type) {
  return ({
    multiple_ips: 'Múltiples IPs',
    concurrent_sessions: 'Sesiones simultáneas',
    unusual_hours: 'Horas inusuales',
    too_fast: 'Cambio rápido de ubicación'
  })[type] || type;
}

function describeAlert(a) {
  const d = a.details || {};
  if (a.alert_type === 'multiple_ips') {
    return `Accedió desde ${d.ips?.length || '?'} IPs distintas en los últimos ${d.window_minutes || 120} minutos.`;
  }
  if (a.alert_type === 'concurrent_sessions') {
    return `${d.count || 2} sesiones activas simultáneamente con dispositivos distintos.`;
  }
  if (a.alert_type === 'unusual_hours') {
    return `Acceso a las ${String(d.hour_madrid).padStart(2, '0')}:00 (Europe/Madrid). Horario inusual.`;
  }
  if (a.alert_type === 'too_fast') {
    return 'Cambio de ubicación demasiado rápido entre sesiones.';
  }
  return 'Alerta sin descripción.';
}

function formatRelative(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export async function getPendingAlertsCount() {
  const { count } = await supabase
    .from('session_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('reviewed', false);
  return count ?? 0;
}
