// Sección "Tutor IA" del panel admin: métricas, top usuarios, top preguntas,
// tokens del mes, coste, toggle pause y log de alertas.

import { supabase } from '../../lib/supabase.js';
import { SUBJECTS } from '../../lib/subjects.js';

// Pricing Gemini 1.5 Flash (por 1M tokens, USD)
const PRICING = { input: 0.075, output: 0.30 };
// Heurística: input ~80% / output ~20% (no podemos separar exacto sin guardar el desglose)
const INPUT_RATIO = 0.8;

export async function render(container) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'admin-tutor';
  wrap.innerHTML = `
    <h2 class="admin-tutor__title">Tutor IA</h2>
    <p class="muted admin-tutor__sub">Uso, alertas y configuración del tutor Gemini.</p>
    <div class="admin-tutor__grid"></div>
    <div class="admin-tutor__alerts"></div>
  `;
  container.appendChild(wrap);

  const grid = wrap.querySelector('.admin-tutor__grid');
  const alertsWrap = wrap.querySelector('.admin-tutor__alerts');

  await populate(grid, alertsWrap);
}

async function populate(grid, alertsWrap) {
  grid.innerHTML = '<p class="muted">Cargando métricas…</p>';
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';

  const [usageToday, usageMonth, settings, alerts] = await Promise.all([
    supabase.from('tutor_usage').select('user_id, subject_slug, questions_count, tokens_used').eq('date', today),
    supabase.from('tutor_usage').select('tokens_used').gte('date', monthStart),
    supabase.from('tutor_settings').select('*').eq('id', 'default').maybeSingle(),
    supabase.from('tutor_alerts').select('id, level, message, created_at, acknowledged_at').order('created_at', { ascending: false }).limit(20)
  ]);

  const todayRows = usageToday.data ?? [];
  const totalToday = todayRows.reduce((acc, r) => acc + (r.questions_count || 0), 0);
  const tokensMonth = (usageMonth.data ?? []).reduce((acc, r) => acc + (r.tokens_used || 0), 0);
  const settingsRow = settings.data || {
    paused: false,
    daily_global_limit: 800,
    daily_user_limit: 50,
    alert_threshold_percent: 70
  };

  // Coste estimado del mes (asumiendo split 80/20 input/output)
  const inputTokens = tokensMonth * INPUT_RATIO;
  const outputTokens = tokensMonth * (1 - INPUT_RATIO);
  const costUsd = (inputTokens / 1_000_000) * PRICING.input + (outputTokens / 1_000_000) * PRICING.output;
  const costEur = costUsd * 0.92; // conversión orientativa

  // Top usuarios y top asignaturas (necesitamos el email del usuario)
  const userIds = Array.from(new Set(todayRows.map((r) => r.user_id)));
  let userMap = new Map();
  if (userIds.length) {
    const { data: usersData } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds);
    userMap = new Map((usersData ?? []).map((u) => [u.id, u]));
  }
  const usagePerUser = new Map();
  for (const r of todayRows) {
    usagePerUser.set(r.user_id, (usagePerUser.get(r.user_id) || 0) + (r.questions_count || 0));
  }
  const topUsers = Array.from(usagePerUser.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([uid, count]) => ({
      label: userMap.get(uid)?.full_name?.trim() || userMap.get(uid)?.email || uid,
      count
    }));

  // Top preguntas frecuentes (del mes en curso)
  const topQuestions = await fetchTopQuestions(monthStart);

  // ── Render ────────────────────────────────────────────────
  const pct = Math.min(100, Math.round((totalToday / settingsRow.daily_global_limit) * 100));
  const pctClass = pct >= 80 ? 'admin-tutor__bar--danger' : pct >= settingsRow.alert_threshold_percent ? 'admin-tutor__bar--warn' : '';

  grid.innerHTML = `
    <div class="admin-card admin-card--span2">
      <div class="admin-card__head">
        <span class="admin-card__title">Uso global hoy</span>
        <span class="admin-card__big">${totalToday} <span class="dim">/ ${settingsRow.daily_global_limit}</span></span>
      </div>
      <div class="admin-tutor__bar ${pctClass}">
        <div class="admin-tutor__bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="admin-card__meta">
        ${pct}% — alerta a partir de ${settingsRow.alert_threshold_percent}%
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card__title">Estado</div>
      <div class="admin-card__big">${settingsRow.paused ? '⏸ Pausado' : '✓ Activo'}</div>
      <button class="btn btn--sm" data-action="toggle-pause">${settingsRow.paused ? 'Reactivar' : 'Pausar'}</button>
    </div>

    <div class="admin-card">
      <div class="admin-card__title">Tokens este mes</div>
      <div class="admin-card__big">${formatTokens(tokensMonth)}</div>
      <div class="admin-card__meta">≈ ${formatMoney(costEur)} (${formatMoney(costUsd, '$')})</div>
    </div>

    <div class="admin-card">
      <div class="admin-card__title">Top 5 usuarios hoy</div>
      ${topUsers.length
        ? '<ol class="admin-tutor__rank">' + topUsers.map((u) => `
            <li><span>${escapeHtml(u.label)}</span><span class="dim">${u.count}</span></li>
          `).join('') + '</ol>'
        : '<div class="muted admin-card__meta">Sin uso aún.</div>'}
    </div>

    <div class="admin-card admin-card--span2">
      <div class="admin-card__title">Top 5 preguntas (mes)</div>
      ${topQuestions.length
        ? '<ol class="admin-tutor__rank">' + topQuestions.map((q) => `
            <li><span>${escapeHtml(q.label)}</span><span class="dim">×${q.count}</span></li>
          `).join('') + '</ol>'
        : '<div class="muted admin-card__meta">Sin preguntas aún.</div>'}
    </div>
  `;

  // Bind toggle-pause
  grid.querySelector('[data-action="toggle-pause"]').addEventListener('click', async () => {
    const next = !settingsRow.paused;
    const { error } = await supabase
      .from('tutor_settings')
      .update({ paused: next, updated_at: new Date().toISOString() })
      .eq('id', 'default');
    if (error) {
      alert('No se pudo cambiar el estado: ' + error.message);
      return;
    }
    await populate(grid, alertsWrap);
  });

  // Alertas
  const alertRows = alerts.data ?? [];
  if (!alertRows.length) {
    alertsWrap.innerHTML = '<div class="muted admin-card__meta">Sin alertas registradas.</div>';
  } else {
    alertsWrap.innerHTML = `
      <h3 class="admin-tutor__alerts-title">Historial de alertas</h3>
      <ul class="admin-tutor__alerts-list">
        ${alertRows.map((a) => `
          <li class="admin-tutor__alert admin-tutor__alert--${escapeHtml(a.level)}">
            <span class="admin-tutor__alert-time">${formatRelative(a.created_at)}</span>
            <span>${escapeHtml(a.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }
}

async function fetchTopQuestions(monthStart) {
  // Lee conversaciones actualizadas en el mes y agrupa los mensajes user
  const { data } = await supabase
    .from('tutor_conversations')
    .select('subject_slug, messages, updated_at')
    .gte('updated_at', monthStart);
  if (!data) return [];

  const counter = new Map(); // normalizedQuestion -> { label, count, subject }
  for (const conv of data) {
    const msgs = Array.isArray(conv.messages) ? conv.messages : [];
    for (const m of msgs) {
      if (m?.role !== 'user' || !m?.content) continue;
      const norm = normalize(m.content);
      if (!norm || norm.length < 6) continue;
      const slug = conv.subject_slug;
      const subjectName = SUBJECTS.find((s) => s.slug === slug)?.name || slug;
      const key = `${slug}|${norm}`;
      const prev = counter.get(key);
      if (prev) prev.count += 1;
      else counter.set(key, { label: `[${subjectName}] ${truncate(m.content.trim(), 80)}`, count: 1 });
    }
  }
  return Array.from(counter.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function normalize(s) {
  return String(s).toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 120);
}

function truncate(s, n) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

function formatTokens(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function formatMoney(x, sym = '€') {
  if (!Number.isFinite(x)) return '—';
  if (x < 0.01) return `${sym}<0.01`;
  return `${sym}${x.toFixed(2)}`;
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
