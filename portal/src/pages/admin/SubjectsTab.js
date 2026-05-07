// Configuración de fechas de examen por asignatura.
// Disponible en panel admin → tab "Asignaturas".

import { supabase } from '../../lib/supabase.js';
import { SUBJECTS } from '../../lib/subjects.js';

export async function render(container) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'admin-tab-subjects';
  wrap.innerHTML = `
    <p class="muted">Fecha de examen oficial por asignatura. El "Modo pánico" se activa
    automáticamente cuando faltan 7 días o menos.</p>
    <div id="subjects-list"></div>
  `;
  container.appendChild(wrap);
  await populate(wrap.querySelector('#subjects-list'));
}

async function populate(listEl) {
  listEl.innerHTML = '<p class="muted">Cargando…</p>';
  const { data: rows } = await supabase
    .from('subjects')
    .select('slug, exam_date, notes, updated_at');
  const map = new Map((rows || []).map((r) => [r.slug, r]));

  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Asignatura</th>
        <th>Fecha del examen</th>
        <th>Días restantes</th>
        <th>Notas</th>
        <th></th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  SUBJECTS.forEach((s) => {
    const row = map.get(s.slug) || {};
    tbody.appendChild(buildRow(s, row));
  });

  listEl.innerHTML = '';
  listEl.appendChild(table);
}

function buildRow(subject, row) {
  const tr = document.createElement('tr');
  const examDate = row.exam_date || '';
  const days = examDate ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000) : null;
  const daysLabel = days != null
    ? days < 0 ? '<span class="dim">pasado</span>' : days <= 7 ? `<strong style="color: var(--danger);">${days} d (pánico)</strong>` : `${days} d`
    : '<span class="dim">—</span>';

  tr.innerHTML = `
    <td><strong>${escapeHtml(subject.name)}</strong> <span class="dim">${escapeHtml(subject.slug)}</span></td>
    <td><input type="date" value="${examDate}" data-date /></td>
    <td>${daysLabel}</td>
    <td><input type="text" value="${escapeHtml(row.notes || '')}" placeholder="Opcional" data-notes /></td>
    <td><button class="btn btn--sm btn--primary" data-save>Guardar</button></td>
  `;

  tr.querySelector('[data-save]').addEventListener('click', async () => {
    const date = tr.querySelector('[data-date]').value || null;
    const notes = tr.querySelector('[data-notes]').value.trim() || null;
    const { error } = await supabase
      .from('subjects')
      .upsert(
        { slug: subject.slug, exam_date: date, notes, updated_at: new Date().toISOString() },
        { onConflict: 'slug' }
      );
    if (error) {
      alert('Error: ' + error.message);
      return;
    }
    const days = date ? Math.ceil((new Date(date).getTime() - Date.now()) / 86400000) : null;
    tr.querySelector('td:nth-child(3)').innerHTML = days != null
      ? days < 0 ? '<span class="dim">pasado</span>' : days <= 7 ? `<strong style="color: var(--danger);">${days} d (pánico)</strong>` : `${days} d`
      : '<span class="dim">—</span>';
  });

  return tr;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
