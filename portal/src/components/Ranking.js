// Ranking semanal: Esta semana / Racha / Exámenes.

import { supabase } from '../lib/supabase.js';
import { avatarHtml } from '../lib/presence.js';
import { SUBJECTS } from '../lib/subjects.js';

const TABS = [
  { id: 'week', label: 'Esta semana' },
  { id: 'streak', label: 'Racha' },
  { id: 'exams', label: 'Exámenes' }
];

export async function renderRanking(container, { currentUserId } = {}) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'ranking';
  wrap.innerHTML = `
    <div class="ranking__head">
      <h2>Comunidad</h2>
      <select id="rk-subject">
        <option value="">Todas las asignaturas</option>
        ${SUBJECTS.map((s) => `<option value="${s.slug}">${s.name}</option>`).join('')}
      </select>
    </div>
    <nav class="ranking__tabs">
      ${TABS.map((t, i) => `<button class="ranking-tab${i === 0 ? ' ranking-tab--active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}
    </nav>
    <div id="ranking-content"></div>
  `;
  container.appendChild(wrap);

  let activeTab = 'week';
  let activeSubject = '';

  const subjectSel = wrap.querySelector('#rk-subject');
  subjectSel.addEventListener('change', () => { activeSubject = subjectSel.value; refresh(); });

  wrap.querySelectorAll('.ranking-tab').forEach((b) => {
    b.addEventListener('click', () => {
      activeTab = b.dataset.tab;
      wrap.querySelectorAll('.ranking-tab').forEach((x) => x.classList.remove('ranking-tab--active'));
      b.classList.add('ranking-tab--active');
      refresh();
    });
  });

  const contentEl = wrap.querySelector('#ranking-content');

  async function refresh() {
    contentEl.innerHTML = '<p class="muted">Cargando…</p>';
    let entries = [];
    let metricLabel = '';
    if (activeTab === 'week') ({ entries, metricLabel } = await rankWeek(activeSubject));
    else if (activeTab === 'streak') ({ entries, metricLabel } = await rankStreak(activeSubject));
    else ({ entries, metricLabel } = await rankExams(activeSubject));
    contentEl.innerHTML = '';
    contentEl.appendChild(buildTable(entries, metricLabel, currentUserId));
  }

  await refresh();
}

async function rankWeek(subjectSlug) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  let query = supabase
    .from('exercise_attempts')
    .select('user_id, subject_slug')
    .gte('attempted_at', since);
  if (subjectSlug) query = query.eq('subject_slug', subjectSlug);
  const { data } = await query;

  const counter = new Map();
  (data || []).forEach((a) => counter.set(a.user_id, (counter.get(a.user_id) || 0) + 1));
  const entries = await enrichEntries(counter, 'subject_slug');
  return { entries, metricLabel: 'ejercicios' };
}

async function rankStreak(subjectSlug) {
  let query = supabase.from('learning_profile').select('user_id, streak_days, subject_slug');
  if (subjectSlug) query = query.eq('subject_slug', subjectSlug);
  const { data } = await query;

  const counter = new Map();
  (data || []).forEach((p) => {
    const prev = counter.get(p.user_id) || 0;
    if ((p.streak_days || 0) > prev) counter.set(p.user_id, p.streak_days);
  });
  const entries = await enrichEntries(counter);
  return { entries, metricLabel: 'días seguidos' };
}

async function rankExams(subjectSlug) {
  let query = supabase.from('exam_sessions').select('user_id, score, subject_slug').eq('status', 'finished');
  if (subjectSlug) query = query.eq('subject_slug', subjectSlug);
  const { data } = await query;

  // Mejor nota por usuario
  const counter = new Map();
  (data || []).forEach((s) => {
    const prev = counter.get(s.user_id) || 0;
    if ((s.score || 0) > prev) counter.set(s.user_id, s.score);
  });
  const entries = await enrichEntries(counter);
  return { entries, metricLabel: 'mejor nota' };
}

async function enrichEntries(counter) {
  if (!counter.size) return [];
  const userIds = Array.from(counter.keys());
  const [{ data: profiles }, { data: privacy }] = await Promise.all([
    supabase.from('user_profiles').select('user_id, display_name, avatar_url, avatar_type, avatar_banned, show_in_ranking').in('user_id', userIds),
    supabase.from('users').select('id, full_name').in('id', userIds)
  ]);
  const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
  const userMap = new Map((privacy || []).map((u) => [u.id, u]));

  const entries = userIds
    .map((uid) => {
      const profile = profileMap.get(uid) || {};
      // Si el usuario optó por no aparecer, lo excluimos
      if (profile.show_in_ranking === false) return null;
      const fallback = userMap.get(uid)?.full_name || 'Anónimo';
      return {
        userId: uid,
        profile,
        displayName: profile.display_name || fallback,
        value: counter.get(uid)
      };
    })
    .filter(Boolean);

  entries.sort((a, b) => b.value - a.value);
  return entries.slice(0, 10);
}

function buildTable(entries, metricLabel, currentUserId) {
  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'admin-empty';
    empty.textContent = 'Sin datos para este ranking.';
    return empty;
  }
  const ol = document.createElement('ol');
  ol.className = 'ranking-list';
  entries.forEach((e, idx) => {
    const li = document.createElement('li');
    li.className = 'ranking-row' + (idx < 3 ? ' ranking-row--podium' : '') + (e.userId === currentUserId ? ' ranking-row--me' : '');
    li.innerHTML = `
      <span class="ranking-pos">${idx + 1}</span>
      ${avatarHtml(e.profile, e.displayName)}
      <span class="ranking-name">${escapeHtml(e.displayName)}</span>
      <span class="ranking-metric">${formatValue(e.value, metricLabel)}</span>
    `;
    ol.appendChild(li);
  });
  return ol;
}

function formatValue(v, label) {
  if (label === 'mejor nota') return `${Number(v).toFixed(2)} / 10`;
  return `${v} ${label}`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
