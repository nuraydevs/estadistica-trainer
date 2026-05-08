// Página "Comunidad" — sub-tabs: Ranking · Online ahora · Comunidad

import { supabase } from '../lib/supabase.js';
import { fetchOnlineList, fetchProfile } from '../lib/presence.js';
import { avatarHtml } from '../components/AvatarPicker.js';
import { SUBJECTS } from '../lib/subjects.js';

const SUB_TABS = [
  { id: 'ranking', label: 'Ranking' },
  { id: 'online', label: 'Online ahora' },
  { id: 'community', label: 'Comunidad' }
];

const RANKING_TABS = [
  { id: 'weekly_exercises', label: 'Esta semana' },
  { id: 'monthly_exercises', label: 'Mes' },
  { id: 'total_exercises', label: 'Total' },
  { id: 'streak', label: 'Racha' },
  { id: 'exam_scores', label: 'Exámenes' }
];

export async function render(container, { profile } = {}) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'community-page';
  wrap.innerHTML = `
    <h1>Comunidad</h1>
    <p class="muted" style="margin-bottom: var(--space-4);">Estudiar acompañado motiva. Aquí tienes a tus compañeros.</p>
    <nav class="hub-tabs"></nav>
    <div id="comm-content"></div>
  `;
  container.appendChild(wrap);

  const tabsNav = wrap.querySelector('.hub-tabs');
  const content = wrap.querySelector('#comm-content');
  let active = 'ranking';

  function buildTabs() {
    tabsNav.innerHTML = SUB_TABS.map((t) => `
      <button class="hub-tab${t.id === active ? ' hub-tab--active' : ''}" data-tab="${t.id}">${t.label}</button>
    `).join('');
    tabsNav.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
      active = b.dataset.tab; buildTabs(); renderActive();
    }));
  }

  async function renderActive() {
    content.innerHTML = '<p class="muted">Cargando…</p>';
    if (active === 'ranking') await renderRanking(content, profile);
    else if (active === 'online') await renderOnline(content);
    else await renderInsights(content);
  }

  buildTabs();
  await renderActive();
}

// ── RANKING ──────────────────────────────────────────────────

async function renderRanking(container, profile) {
  container.innerHTML = `
    <div class="ranking__head">
      <select id="rk-subject">
        <option value="">Todas las asignaturas</option>
        ${SUBJECTS.map((s) => `<option value="${s.slug}">${s.name}</option>`).join('')}
      </select>
    </div>
    <nav class="ranking__tabs"></nav>
    <div id="rk-body"></div>
  `;

  const subjectSel = container.querySelector('#rk-subject');
  const tabsEl = container.querySelector('.ranking__tabs');
  const body = container.querySelector('#rk-body');
  let activeType = 'weekly_exercises';
  let subject = '';

  function buildTabs() {
    tabsEl.innerHTML = RANKING_TABS.map((t) => `
      <button class="ranking-tab${t.id === activeType ? ' ranking-tab--active' : ''}" data-type="${t.id}">${t.label}</button>
    `).join('');
    tabsEl.querySelectorAll('[data-type]').forEach((b) => b.addEventListener('click', () => {
      activeType = b.dataset.type; buildTabs(); refresh();
    }));
  }

  subjectSel.addEventListener('change', () => { subject = subjectSel.value; refresh(); });

  async function refresh() {
    body.innerHTML = '<p class="muted">Calculando…</p>';
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/social/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: activeType, subject: subject || null, limit: 20 })
      });
      const json = await res.json();
      body.innerHTML = '';
      if (!json.entries?.length) {
        body.innerHTML = '<div class="admin-empty">Aún no hay datos para este ranking.</div>';
        return;
      }
      body.appendChild(buildList(json, profile));
    } catch (err) {
      body.innerHTML = `<div class="admin-empty">Error: ${escapeHtml(err.message || '')}</div>`;
    }
  }

  buildTabs();
  await refresh();
}

function buildList({ entries, me, type }, profile) {
  const ol = document.createElement('ol');
  ol.className = 'ranking-list';
  const myInTop = entries.find((e) => e.is_self);

  entries.forEach((e) => {
    ol.appendChild(buildRow(e, type));
  });

  // Si no estoy en top, mostrar mi posición debajo
  if (!myInTop && me) {
    const sep = document.createElement('div');
    sep.className = 'ranking-separator';
    sep.textContent = '···';
    ol.appendChild(sep);
    const mine = {
      position: me.position,
      user_id: profile?.id,
      display_name: 'Tú',
      avatar_type: 'none',
      avatar_url: null,
      value: me.value,
      is_self: true
    };
    ol.appendChild(buildRow(mine, type));
  }
  return ol;
}

function buildRow(e, type) {
  const li = document.createElement('li');
  li.className = 'ranking-row' + (e.position <= 3 ? ' ranking-row--podium' : '') + (e.is_self ? ' ranking-row--me' : '');
  const value = formatValue(e.value, type);
  const subjectBadge = e.subject_slug ? `<span class="subject-tag">${escapeHtml(SUBJECTS.find((s) => s.slug === e.subject_slug)?.name || e.subject_slug)}</span>` : '';
  li.innerHTML = `
    <span class="ranking-pos">${e.position}</span>
    ${avatarHtml(e, e.display_name, 28)}
    <span class="ranking-name">${escapeHtml(e.display_name || 'Anónimo')}</span>
    <span>${subjectBadge}</span>
    <span class="ranking-metric">${value}</span>
  `;
  return li;
}

function formatValue(v, type) {
  if (type === 'streak') return `${v} días`;
  if (type === 'exam_scores') return `${Number(v).toFixed(2)} / 10`;
  return `${v} ejercicios`;
}

// ── ONLINE AHORA ─────────────────────────────────────────────

async function renderOnline(container) {
  container.innerHTML = '<p class="muted">Cargando presencia…</p>';
  const all = await fetchOnlineList();
  const grouped = new Map();
  for (const p of all) {
    const key = p.subject || 'general';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(p);
  }
  if (!all.length) {
    container.innerHTML = '<div class="admin-empty">Nadie está online ahora mismo.</div>';
    return;
  }
  container.innerHTML = '';
  for (const [slug, list] of grouped) {
    const sec = document.createElement('section');
    sec.style.marginBottom = 'var(--space-4)';
    const subjName = SUBJECTS.find((s) => s.slug === slug)?.name || slug;
    sec.innerHTML = `<h3 style="margin: 0 0 var(--space-2)">${escapeHtml(subjName)} · ${list.length}</h3>`;
    const ul = document.createElement('ul');
    ul.className = 'social-panel__list';
    ul.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
    list.forEach((p) => {
      const li = document.createElement('li');
      li.className = 'social-item';
      li.innerHTML = `
        <span class="social-item__avatar">${avatarHtml(p, p.display_name || '?', 28)}<span class="dot dot--active"></span></span>
        <div class="social-item__info">
          <div class="social-item__name">${escapeHtml(p.display_name || 'Anónimo')}</div>
          <div class="social-item__section dim">${escapeHtml(p.section || '')}</div>
        </div>
      `;
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    container.appendChild(sec);
  }
}

// ── COMUNIDAD (insights) ─────────────────────────────────────

async function renderInsights(container) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.gap = 'var(--space-4)';
  for (const s of SUBJECTS.filter((x) => x.available)) {
    const card = document.createElement('section');
    card.className = 'community-insights';
    card.innerHTML = `<h3>${escapeHtml(s.name)} · cargando…</h3>`;
    wrap.appendChild(card);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/social/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: s.slug })
      });
      const json = await res.json();
      const list = json.hardest || [];
      if (!list.length) {
        card.innerHTML = `<h3>${escapeHtml(s.name)}</h3><p class="muted">Aún no hay suficientes datos de la comunidad.</p>`;
      } else {
        card.innerHTML = `
          <h3>${escapeHtml(s.name)} · lo que más cuesta</h3>
          <ul class="ci-list">
            ${list.map((e, i) => `
              <li class="ci-item">
                <span class="ci-pos">${i + 1}.</span>
                <span class="ci-concept">${escapeHtml(e.concept)}</span>
                <span class="ci-rate">${e.fail_rate}% lo falla</span>
              </li>
            `).join('')}
          </ul>
        `;
      }
    } catch (err) {
      card.innerHTML = `<h3>${escapeHtml(s.name)}</h3><p class="muted">Error: ${escapeHtml(err.message || '')}</p>`;
    }
  }
  container.appendChild(wrap);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
