// "Lo que más cuesta a tus compañeros" — top conceptos fallados.

import { supabase } from '../lib/supabase.js';

export async function mountCommunityInsights(host, { subjectSlug }) {
  const root = document.createElement('section');
  root.className = 'community-insights';
  root.innerHTML = '<p class="muted">Cargando…</p>';
  host.appendChild(root);

  const top = await fetchTopFails(subjectSlug);
  render(top);

  function render(entries) {
    if (!entries.length) {
      root.innerHTML = `<p class="muted">Aún no hay suficientes datos de la comunidad.</p>`;
      return;
    }
    root.innerHTML = `
      <h3>Lo que más cuesta a tus compañeros</h3>
      <ul class="ci-list">
        ${entries.map((e, i) => `
          <li class="ci-item">
            <span class="ci-pos">${i + 1}.</span>
            <span class="ci-concept">${escapeHtml(e.concept)}</span>
            <span class="ci-rate">${e.failRate}% lo falla</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  return {
    unmount() { try { root.remove(); } catch {} }
  };
}

async function fetchTopFails(subjectSlug) {
  const { data } = await supabase
    .from('exercise_attempts')
    .select('concept, result')
    .eq('subject_slug', subjectSlug);
  if (!data?.length) return [];

  const counts = new Map();
  for (const a of data) {
    if (!a.concept) continue;
    const c = a.concept.trim();
    if (!c) continue;
    if (!counts.has(c)) counts.set(c, { total: 0, failed: 0 });
    const e = counts.get(c);
    e.total += 1;
    if (a.result !== 'correct') e.failed += 1;
  }
  return Array.from(counts.entries())
    .filter(([, e]) => e.total >= 3) // mín 3 intentos para no ruido
    .map(([concept, e]) => ({ concept, failRate: Math.round((e.failed / e.total) * 100), total: e.total }))
    .sort((a, b) => b.failRate - a.failRate)
    .slice(0, 5);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
