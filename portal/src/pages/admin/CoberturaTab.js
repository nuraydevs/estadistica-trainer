// Tab "Cobertura" en Admin: listado de subject_materials por asignatura,
// botones de re-extracción, slider 0-100% para coverage_pct, feedback pendiente.

import { supabase } from '../../lib/supabase.js';
import { SUBJECTS } from '../../lib/subjects.js';

export async function render(container) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'admin-cobertura';
  wrap.innerHTML = `
    <p class="muted">Estado del temario por asignatura. Re-extrae con IA si actualizas un PDF.</p>
    <div id="cob-content"></div>
    <h3 class="admin-tutor__title" style="margin-top: var(--space-5)">Feedback pendiente</h3>
    <div id="cob-feedback"></div>
  `;
  container.appendChild(wrap);

  await populateMaterials(wrap.querySelector('#cob-content'));
  await populateFeedback(wrap.querySelector('#cob-feedback'));
}

async function populateMaterials(host) {
  host.innerHTML = '<p class="muted">Cargando…</p>';
  const { data: materials } = await supabase
    .from('subject_materials')
    .select('id, subject_slug, type, tema, title, pdf_url, pdf_storage_path, html_content, coverage_pct, last_verified_at, updated_at')
    .order('subject_slug').order('tema');

  if (!materials?.length) {
    host.innerHTML = '<div class="admin-empty">No hay materiales. Aplica la migración 0008 y carga seeds.</div>';
    return;
  }

  const grouped = new Map();
  for (const m of materials) {
    if (!grouped.has(m.subject_slug)) grouped.set(m.subject_slug, []);
    grouped.get(m.subject_slug).push(m);
  }

  host.innerHTML = '';
  for (const [slug, list] of grouped) {
    const subjectName = SUBJECTS.find((s) => s.slug === slug)?.name || slug;
    const section = document.createElement('section');
    section.className = 'cobertura-subject';
    section.innerHTML = `<h3>${escapeHtml(subjectName)}</h3>`;
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
      <thead><tr>
        <th>Material</th><th>Tipo</th><th>HTML</th><th>Cobertura</th><th>Última verificación</th><th></th>
      </tr></thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    list.forEach((m) => tbody.appendChild(buildRow(m, () => populateMaterials(host))));
    section.appendChild(table);
    host.appendChild(section);
  }
}

function buildRow(material, onChange) {
  const tr = document.createElement('tr');
  const has = !!material.html_content;
  tr.innerHTML = `
    <td>
      <strong>${escapeHtml(material.title)}</strong>
      <div class="dim" style="font-size: 11px;">${material.pdf_url ? `<a href="${escapeAttr(material.pdf_url)}" target="_blank" rel="noopener">ver PDF</a>` : '— sin PDF'}</div>
    </td>
    <td>${escapeHtml(material.type)}</td>
    <td>${has ? `<span style="color: var(--success);">✓ ${material.html_content.length.toLocaleString()} chars</span>` : '<span class="dim">—</span>'}</td>
    <td>
      <input type="range" min="0" max="100" value="${material.coverage_pct ?? 0}" data-coverage style="width: 120px; vertical-align: middle;" />
      <span data-cov-label>${material.coverage_pct ?? 0}%</span>
    </td>
    <td class="dim" style="font-size: 12px;">${material.last_verified_at ? formatDate(material.last_verified_at) : 'nunca'}</td>
    <td>
      <button class="btn btn--sm" data-action="extract">${has ? 'Re-extraer' : 'Extraer'}</button>
    </td>
  `;

  const slider = tr.querySelector('[data-coverage]');
  const label = tr.querySelector('[data-cov-label]');
  let savedTimer = null;
  slider.addEventListener('input', () => {
    label.textContent = slider.value + '%';
    clearTimeout(savedTimer);
    savedTimer = setTimeout(async () => {
      await supabase.from('subject_materials').update({
        coverage_pct: parseInt(slider.value, 10),
        updated_at: new Date().toISOString()
      }).eq('id', material.id);
    }, 400);
  });

  tr.querySelector('[data-action="extract"]').addEventListener('click', async (e) => {
    if (!confirm('Esto puede tardar 15-60s y consume cuota Gemini Pro. ¿Continuar?')) return;
    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = 'Procesando…';
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/admin/extract-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ materialId: material.id })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert('Error: ' + (body.message || body.error || res.status));
      } else {
        alert(`Extraído: ${body.htmlLength?.toLocaleString?.() || '?'} chars`);
        onChange();
      }
    } finally {
      btn.disabled = false; btn.textContent = 'Re-extraer';
    }
  });

  return tr;
}

async function populateFeedback(host) {
  host.innerHTML = '<p class="muted">Cargando…</p>';
  const { data: feedback } = await supabase
    .from('content_feedback')
    .select('id, user_id, subject_slug, material_id, feedback, created_at')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(30);

  if (!feedback?.length) {
    host.innerHTML = '<div class="admin-empty">Sin feedback pendiente.</div>';
    return;
  }

  const userIds = Array.from(new Set(feedback.map((f) => f.user_id).filter(Boolean)));
  const matIds = Array.from(new Set(feedback.map((f) => f.material_id).filter(Boolean)));
  const [{ data: users }, { data: mats }] = await Promise.all([
    userIds.length ? supabase.from('users').select('id, email, full_name').in('id', userIds) : { data: [] },
    matIds.length ? supabase.from('subject_materials').select('id, title').in('id', matIds) : { data: [] }
  ]);
  const userMap = new Map((users || []).map((u) => [u.id, u]));
  const matMap = new Map((mats || []).map((m) => [m.id, m]));

  host.innerHTML = '';
  feedback.forEach((f) => {
    const u = userMap.get(f.user_id) || {};
    const m = matMap.get(f.material_id) || {};
    const card = document.createElement('article');
    card.className = 'alert-card';
    card.innerHTML = `
      <div class="alert-card__head">
        <strong>${escapeHtml(u.full_name || u.email || 'Anónimo')}</strong>
        <span class="dim">${new Date(f.created_at).toLocaleDateString('es-ES')}</span>
      </div>
      <div class="alert-card__type">${escapeHtml(m.title || f.subject_slug)}</div>
      <p>${escapeHtml(f.feedback)}</p>
      <div class="actions">
        <button class="btn btn--sm" data-action="resolve">Marcar resuelta</button>
      </div>
    `;
    card.querySelector('[data-action="resolve"]').addEventListener('click', async () => {
      await supabase.from('content_feedback').update({
        resolved: true,
        resolved_at: new Date().toISOString()
      }).eq('id', f.id);
      populateFeedback(host);
    });
    host.appendChild(card);
  });
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
function escapeAttr(s) { return escapeHtml(s); }
function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}
