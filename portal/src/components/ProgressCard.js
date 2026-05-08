// Tarjeta de progreso personal para una asignatura.
// Colapsada: una línea ("3 días seguidos · 24 ejercicios · 71% acierto · Punto flojo: Bayes")
// Expandida: panel lateral con racha visual + conceptos rotos + ranking

import { getProfile, successRate, getWeakConcepts, getBrokenConcepts } from '../lib/learning-profile.js';
import { supabase } from '../lib/supabase.js';

export async function mountProgressCard(container, { userId, subject }) {
  if (!userId || !subject) return { unmount() {} };

  const root = document.createElement('div');
  root.className = 'progress-card';
  container.appendChild(root);

  let profile = await getProfile(userId, subject.slug);
  let expanded = false;
  renderCollapsed();

  let panel = null;

  function renderCollapsed() {
    const sr = successRate(profile);
    const weak = getWeakConcepts(profile, 1)[0];
    const broken = getBrokenConcepts(profile)[0];
    const flojo = broken || weak;

    const parts = [];
    if (profile.streak_days >= 1) parts.push(`<span class="pc-streak">🔥 ${profile.streak_days} día${profile.streak_days === 1 ? '' : 's'} seguidos</span>`);
    if (profile.total_exercises_done > 0) parts.push(`<span>${profile.total_exercises_done} ejercicios</span>`);
    if (sr !== null) parts.push(`<span>${sr}% de acierto</span>`);
    if (flojo) parts.push(`<span class="pc-weak">Punto flojo: ${escapeHtml(flojo)}</span>`);

    if (!parts.length) {
      root.innerHTML = `<button type="button" class="progress-card__btn">
        <span class="dim">Aún sin actividad — empieza un ejercicio para construir tu perfil.</span>
      </button>`;
    } else {
      root.innerHTML = `
        <button type="button" class="progress-card__btn">
          ${parts.join(' · ')}
          <span class="progress-card__chevron">▾</span>
        </button>
      `;
    }
    root.querySelector('button')?.addEventListener('click', toggle);
  }

  async function toggle() {
    expanded = !expanded;
    if (expanded) {
      panel = document.createElement('aside');
      panel.className = 'progress-panel';
      panel.innerHTML = '<div class="progress-panel__loading">Cargando…</div>';
      document.body.appendChild(panel);
      // refresca perfil por si hubo cambios
      profile = await getProfile(userId, subject.slug);
      const insights = await loadInsights(userId, subject.slug);
      panel.innerHTML = panelHtml(profile, insights);
      panel.querySelector('[data-action="close"]').addEventListener('click', toggle);
      panel.querySelectorAll('[data-practice]').forEach((b) => {
        b.addEventListener('click', () => {
          // Disparamos un evento para que el tutor lo capte
          const concept = b.dataset.practice;
          document.dispatchEvent(new CustomEvent('open-tutor-with-context', { detail: { concept } }));
          toggle();
        });
      });
    } else if (panel) {
      panel.remove();
      panel = null;
    }
  }

  return {
    async refresh() {
      profile = await getProfile(userId, subject.slug);
      renderCollapsed();
    },
    unmount() {
      try { panel?.remove(); } catch {}
      try { root.remove(); } catch {}
    }
  };
}

async function loadInsights(userId, subjectSlug) {
  // Últimas 4 semanas de actividad para el calendario tipo GitHub
  const since = new Date(Date.now() - 28 * 86400000).toISOString();
  const { data } = await supabase
    .from('exercise_attempts')
    .select('attempted_at, result, time_spent_seconds')
    .eq('user_id', userId)
    .eq('subject_slug', subjectSlug)
    .gte('attempted_at', since);

  const byDay = new Map();
  let totalTime = 0;
  let countTime = 0;
  (data || []).forEach((a) => {
    const day = a.attempted_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
    if (a.time_spent_seconds > 0 && a.time_spent_seconds < 1800) {
      totalTime += a.time_spent_seconds;
      countTime += 1;
    }
  });
  const days = [];
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: byDay.get(key) || 0, isToday: key === today });
  }
  const avgTimeSec = countTime ? Math.round(totalTime / countTime) : 0;
  return { days, avgTimeSec };
}

function formatHour(h) {
  if (h == null || h === '' || isNaN(h)) return '—';
  return `${String(h).padStart(2, '0')}:00`;
}

function formatDuration(seconds) {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function panelHtml(profile, insights) {
  const sr = successRate(profile);
  const broken = getBrokenConcepts(profile);
  const weak = (profile.concepts_weak || []).map((w) => w.concept || w);
  const mastered = profile.concepts_mastered || [];

  const heatmap = insights.days.map((d) => {
    const intensity = d.count === 0 ? 0 : d.count <= 2 ? 1 : d.count <= 5 ? 2 : 3;
    const label = `${d.date}: ${d.count} intentos`;
    const cls = `heat-cell heat-cell--${intensity}${d.isToday ? ' heat-cell--today' : ''}`;
    return `<div class="${cls}" title="${label}"></div>`;
  }).join('');

  return `
    <div class="progress-panel__head">
      <h3>Tu progreso</h3>
      <button class="tutor-iconbtn" data-action="close" aria-label="Cerrar">✕</button>
    </div>
    <div class="progress-panel__body">
      <section class="progress-section">
        <div class="progress-stat">
          <span class="progress-stat__value">🔥 ${profile.streak_days || 0}</span>
          <span class="progress-stat__label">días seguidos</span>
        </div>
        <div class="progress-stat">
          <span class="progress-stat__value">${profile.total_exercises_done || 0}</span>
          <span class="progress-stat__label">ejercicios</span>
        </div>
        <div class="progress-stat">
          <span class="progress-stat__value">${sr !== null ? sr + '%' : '—'}</span>
          <span class="progress-stat__label">acierto</span>
        </div>
      </section>

      <section class="progress-section">
        <h4>Actividad últimas 4 semanas</h4>
        <div class="heatmap heatmap--4w">${heatmap}</div>
      </section>

      <section class="progress-section progress-section--inline">
        <div>
          <span class="progress-stat__label">Mejor hora</span>
          <span class="progress-stat__value progress-stat__value--sm">${formatHour(profile.best_hour)}</span>
        </div>
        <div>
          <span class="progress-stat__label">Tiempo medio</span>
          <span class="progress-stat__value progress-stat__value--sm">${formatDuration(insights.avgTimeSec)}</span>
        </div>
      </section>

      ${broken.length ? `
        <section class="progress-section">
          <h4 style="color: var(--danger);">Conceptos rotos</h4>
          <ul class="progress-list">
            ${broken.map((c) => `
              <li><span>${escapeHtml(c)}</span>
                <button class="btn btn--sm" data-practice="${escapeHtml(c)}">Practicar con tutor</button>
              </li>
            `).join('')}
          </ul>
        </section>` : ''}

      ${weak.length ? `
        <section class="progress-section">
          <h4 style="color: var(--warning);">Conceptos frágiles</h4>
          <ul class="progress-list">
            ${weak.map((c) => `
              <li><span>${escapeHtml(c)}</span>
                <button class="btn btn--sm" data-practice="${escapeHtml(c)}">Practicar</button>
              </li>
            `).join('')}
          </ul>
        </section>` : ''}

      ${mastered.length ? `
        <section class="progress-section">
          <h4 style="color: var(--success);">Conceptos dominados</h4>
          <div class="subject-tags">
            ${mastered.map((c) => `<span class="subject-tag" style="background: var(--success-subtle); color: var(--success); border-color: var(--success-subtle);">${escapeHtml(c)}</span>`).join('')}
          </div>
        </section>` : ''}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
