import { supabase } from '../../lib/supabase.js';
import { SUBJECTS } from '../../lib/subjects.js';

export function openStudentDetail({ user, onChange }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal modal--wide" role="dialog" aria-modal="true">
      <div class="modal__head">
        <h2>${escapeHtml(user.full_name || user.email)}</h2>
        <button class="tutor-iconbtn" data-action="close" aria-label="Cerrar">✕</button>
      </div>
      <div class="student-detail">
        <p class="muted">${escapeHtml(user.email)} · alta ${formatDate(user.created_at)}</p>
        <div id="student-detail-body"><p class="muted">Cargando…</p></div>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('[data-action="close"]').addEventListener('click', close);

  const body = backdrop.querySelector('#student-detail-body');
  populate(body, user, onChange);
}

async function populate(body, user, onChange) {
  const [
    { data: subjectGrants },
    { data: payments },
    { data: sessions },
    { data: alerts },
    { data: tutorUsage },
    { data: profiles },
    { data: attempts }
  ] = await Promise.all([
    supabase.from('user_subjects').select('subject_slug, granted_at, granted_by').eq('user_id', user.id),
    supabase.from('payments').select('id, amount, currency, payment_method, subject_slug, notes, created_at, registered_by').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('sessions').select('ip_address, user_agent, subject_slug, started_at, last_seen_at, is_active').eq('user_id', user.id).order('started_at', { ascending: false }).limit(10),
    supabase.from('session_alerts').select('id, alert_type, details, created_at, reviewed').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('tutor_usage').select('subject_slug, questions_count, date').eq('user_id', user.id).gte('date', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)),
    supabase.from('learning_profile').select('subject_slug, concepts_mastered, concepts_weak, concepts_broken, total_exercises_done, total_exercises_failed, streak_days, last_study_date').eq('user_id', user.id),
    supabase.from('exercise_attempts').select('attempted_at, result').eq('user_id', user.id).gte('attempted_at', new Date(Date.now() - 14 * 86400000).toISOString())
  ]);

  const subjectsHtml = (subjectGrants || []).length
    ? '<ul class="detail-list">' +
      (subjectGrants || []).map((g) => `
        <li>
          <strong>${slugToName(g.subject_slug)}</strong>
          <span class="dim">desbloqueada ${formatDate(g.granted_at)}</span>
        </li>
      `).join('') +
      '</ul>'
    : '<p class="muted">Sin asignaturas activas.</p>';

  const paymentsHtml = (payments || []).length
    ? '<ul class="detail-list">' +
      (payments || []).map((p) => `
        <li>
          <strong>${formatMoney(p.amount, p.currency)}</strong>
          <span>${escapeHtml(p.payment_method)}${p.subject_slug ? ' · ' + slugToName(p.subject_slug) : ''}</span>
          <span class="dim">${formatDate(p.created_at)}</span>
        </li>
      `).join('') +
      '</ul>'
    : '<p class="muted">Sin pagos registrados.</p>';

  const sessionsHtml = (sessions || []).length
    ? '<ul class="detail-list detail-list--mono">' +
      (sessions || []).map((s) => `
        <li>
          <span>${formatDateTime(s.started_at)}</span>
          <code>${escapeHtml(s.ip_address || '—')}</code>
          <span class="dim">${slugToName(s.subject_slug)} · ${truncate(escapeHtml(s.user_agent || ''), 40)}</span>
        </li>
      `).join('') +
      '</ul>'
    : '<p class="muted">Sin sesiones registradas.</p>';

  const tutorWeek = (tutorUsage || []).reduce((acc, r) => acc + (r.questions_count || 0), 0);

  // Heatmap simple de actividad última semana (días con sesión)
  const days = buildLast7Days(sessions || []);
  const activityHtml = '<div class="activity-bars">' + days.map((d) => `
    <div class="activity-bar" title="${d.label}: ${d.count} sesiones">
      <div class="activity-bar__fill" style="height: ${Math.min(100, d.count * 20)}%"></div>
      <div class="activity-bar__label">${d.short}</div>
    </div>
  `).join('') + '</div>';

  const alertsHtml = (alerts || []).filter((a) => !a.reviewed).length
    ? `<div class="detail-section detail-section--danger">
        <h3>⚠ Alertas pendientes</h3>
        <ul class="detail-list">
          ${(alerts || []).filter((a) => !a.reviewed).map((a) => `
            <li>
              <strong>${alertLabel(a.alert_type)}</strong>
              <span class="dim">${formatDateTime(a.created_at)}</span>
              <details><summary>Detalles</summary><pre>${escapeHtml(JSON.stringify(a.details, null, 2))}</pre></details>
              <button class="btn btn--sm" data-action="review-alert" data-id="${a.id}">Marcar revisada</button>
            </li>
          `).join('')}
        </ul>
        <button class="btn btn--sm" data-action="clear-suspicious">Limpiar marca de sospechoso</button>
      </div>`
    : '';

  const subjectCheckboxes = SUBJECTS.map((s) => {
    const has = (subjectGrants || []).some((g) => g.subject_slug === s.slug);
    return `
      <label class="checkbox-row">
        <input type="checkbox" value="${s.slug}" ${has ? 'checked' : ''} ${s.available ? '' : 'disabled'} />
        ${s.name}${s.available ? '' : ' <span class="dim">(no disponible)</span>'}
      </label>
    `;
  }).join('');

  // ── Perfil de aprendizaje ──
  const learningHtml = (profiles || []).length
    ? '<div class="detail-grid">' + (profiles || []).map((p) => {
        const total = p.total_exercises_done || 0;
        const failed = p.total_exercises_failed || 0;
        const sr = total ? Math.round(((total - failed) / total) * 100) : 0;
        const broken = (p.concepts_broken || []);
        const mastered = (p.concepts_mastered || []);
        return `
          <div class="detail-section">
            <h3>${slugToName(p.subject_slug)}</h3>
            <div class="detail-list">
              <li><strong>🔥 ${p.streak_days || 0}</strong> días de racha</li>
              <li><strong>${total}</strong> ejercicios · <strong>${sr}%</strong> acierto</li>
              <li><span class="dim">Última sesión:</span> ${formatDate(p.last_study_date)}</li>
              ${broken.length ? `<li><span style="color: var(--danger);">Conceptos rotos:</span> ${broken.map(escapeHtml).join(', ')}</li>` : ''}
              ${mastered.length ? `<li><span style="color: var(--success);">Dominados:</span> ${mastered.map(escapeHtml).join(', ')}</li>` : ''}
            </div>
          </div>
        `;
      }).join('') + '</div>'
    : '<p class="muted">Aún sin actividad de aprendizaje.</p>';

  // Heatmap de últimas 2 semanas
  const heatDays = [];
  const byDay = new Map();
  (attempts || []).forEach((a) => {
    const d = a.attempted_at.slice(0, 10);
    byDay.set(d, (byDay.get(d) || 0) + 1);
  });
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    heatDays.push({ key, count: byDay.get(key) || 0 });
  }
  const heatHtml = '<div class="heatmap">' + heatDays.map((d) => {
    const intensity = d.count === 0 ? 0 : d.count <= 2 ? 1 : d.count <= 5 ? 2 : 3;
    return `<div class="heat-cell heat-cell--${intensity}" title="${d.key}: ${d.count}"></div>`;
  }).join('') + '</div>';

  body.innerHTML = `
    <div class="detail-grid">
      <div class="detail-section detail-section--span2">
        <h3>Perfil de aprendizaje</h3>
        ${learningHtml}
        <h4 style="margin-top: var(--space-3);">Actividad últimas 2 semanas</h4>
        ${heatHtml}
      </div>
      <div class="detail-section">
        <h3>Asignaturas</h3>
        ${subjectsHtml}
      </div>
      <div class="detail-section">
        <h3>Pagos</h3>
        ${paymentsHtml}
      </div>
      <div class="detail-section detail-section--span2">
        <h3>Actividad última semana</h3>
        <p class="muted" style="font-size: 12px;">Tutor: <strong>${tutorWeek}</strong> preguntas en 7 días.</p>
        ${activityHtml}
      </div>
      <div class="detail-section detail-section--span2">
        <h3>Últimas sesiones</h3>
        ${sessionsHtml}
      </div>
      ${alertsHtml}
      <div class="detail-section detail-section--span2">
        <h3>Gestión</h3>
        <div class="checkbox-group">${subjectCheckboxes}</div>
        <div class="detail-actions">
          <button class="btn btn--primary" data-action="save-subjects">Guardar asignaturas</button>
          <button class="btn" data-action="reset-password">Restablecer password</button>
          <button class="btn btn--danger" data-action="deactivate">${user.active ? 'Desactivar cuenta' : 'Reactivar cuenta'}</button>
        </div>
        <div class="notice" id="detail-notice" hidden></div>
      </div>
    </div>
  `;

  // Actions
  body.querySelectorAll('[data-action="review-alert"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await supabase.from('session_alerts').update({ reviewed: true, reviewed_at: new Date().toISOString() }).eq('id', id);
      onChange?.();
      populate(body, user, onChange);
    });
  });

  body.querySelector('[data-action="clear-suspicious"]')?.addEventListener('click', async () => {
    await supabase.from('users').update({ suspicious: false }).eq('id', user.id);
    onChange?.();
    populate(body, { ...user, suspicious: false }, onChange);
  });

  body.querySelector('[data-action="save-subjects"]').addEventListener('click', async () => {
    const checked = Array.from(body.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
    const current = (subjectGrants || []).map((g) => g.subject_slug);
    const toAdd = checked.filter((s) => !current.includes(s));
    const toRemove = current.filter((s) => !checked.includes(s));

    if (toAdd.length) {
      await supabase.from('user_subjects').insert(toAdd.map((slug) => ({ user_id: user.id, subject_slug: slug })));
    }
    if (toRemove.length) {
      await supabase.from('user_subjects').delete().eq('user_id', user.id).in('subject_slug', toRemove);
    }
    notify(body, 'Asignaturas actualizadas.');
    onChange?.();
    populate(body, user, onChange);
  });

  body.querySelector('[data-action="reset-password"]').addEventListener('click', async () => {
    const password = prompt('Nuevo password (mín 6 caracteres):', generatePassword());
    if (!password || password.length < 6) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: user.id, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      notify(body, 'Error: ' + (err.message || err.error || 'no se pudo cambiar.'));
      return;
    }
    notify(body, `Password actualizado: ${password}`);
  });

  body.querySelector('[data-action="deactivate"]').addEventListener('click', async () => {
    const next = !user.active;
    if (next === false && !confirm('¿Seguro? El alumno no podrá acceder hasta que lo reactives.')) return;
    await supabase.from('users').update({ active: next }).eq('id', user.id);
    notify(body, next ? 'Cuenta reactivada.' : 'Cuenta desactivada.');
    onChange?.();
    populate(body, { ...user, active: next }, onChange);
  });
}

// ── helpers ──────────────────────────────────────────────────

function alertLabel(type) {
  return ({
    multiple_ips: 'Múltiples IPs en poco tiempo',
    concurrent_sessions: 'Sesiones simultáneas',
    unusual_hours: 'Acceso a horas inusuales',
    too_fast: 'Cambio de ubicación demasiado rápido'
  })[type] || type;
}

function buildLast7Days(sessions) {
  const days = [];
  const now = new Date();
  const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const label = d.toLocaleDateString('es-ES');
    const short = labels[d.getDay()];
    const count = sessions.filter((s) => sameDay(new Date(s.started_at), d)).length;
    days.push({ label, short, count });
  }
  return days;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function notify(body, msg) {
  const el = body.querySelector('#detail-notice');
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
  setTimeout(() => { el.hidden = true; }, 3500);
}

function generatePassword(len = 8) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function slugToName(slug) {
  return SUBJECTS.find((s) => s.slug === slug)?.name || slug;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function formatMoney(amount, cur = 'EUR') {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(2) + ' ' + (cur === 'EUR' ? '€' : cur);
}

function truncate(s, n) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}
