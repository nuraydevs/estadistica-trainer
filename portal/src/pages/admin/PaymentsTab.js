import { supabase } from '../../lib/supabase.js';
import { SUBJECTS } from '../../lib/subjects.js';

export async function render(container) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'admin-tab-payments';
  wrap.innerHTML = `
    <div class="admin-toolbar">
      <select id="pay-month"></select>
      <select id="pay-subject">
        <option value="">Todas las asignaturas</option>
        ${SUBJECTS.map((s) => `<option value="${s.slug}">${s.name}</option>`).join('')}
      </select>
      <select id="pay-method">
        <option value="">Todos los métodos</option>
        <option value="efectivo">Efectivo</option>
        <option value="bizum">Bizum</option>
        <option value="transferencia">Transferencia</option>
        <option value="otros">Otros</option>
      </select>
      <button class="btn btn--sm" id="pay-export">Exportar CSV</button>
    </div>
    <div id="pay-summary" class="admin-pay-summary"></div>
    <div id="pay-list"></div>
  `;
  container.appendChild(wrap);

  const monthSel = wrap.querySelector('#pay-month');
  const subjectSel = wrap.querySelector('#pay-subject');
  const methodSel = wrap.querySelector('#pay-method');
  const exportBtn = wrap.querySelector('#pay-export');
  const summaryEl = wrap.querySelector('#pay-summary');
  const listEl = wrap.querySelector('#pay-list');

  // Construir selector de mes (últimos 12 meses)
  const now = new Date();
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    monthOptions.push({ key, label });
  }
  monthSel.innerHTML = '<option value="all">Todo el historial</option>' +
    monthOptions.map((m, i) => `<option value="${m.key}" ${i === 0 ? 'selected' : ''}>${m.label}</option>`).join('');

  let cached = [];

  async function refresh() {
    listEl.innerHTML = '<p class="muted">Cargando…</p>';
    const month = monthSel.value;
    const subject = subjectSel.value;
    const method = methodSel.value;

    let query = supabase
      .from('payments')
      .select('id, amount, currency, payment_method, subject_slug, notes, created_at, user_id, registered_by')
      .order('created_at', { ascending: false });

    if (month !== 'all') {
      const start = month + '-01T00:00:00.000Z';
      const startDate = new Date(start);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1).toISOString();
      query = query.gte('created_at', start).lt('created_at', endDate);
    }
    if (subject) query = query.eq('subject_slug', subject);
    if (method) query = query.eq('payment_method', method);

    const { data: payments, error } = await query;
    if (error) {
      listEl.innerHTML = `<div class="admin-empty">Error: ${escapeHtml(error.message)}</div>`;
      return;
    }
    cached = payments || [];

    const userIds = Array.from(new Set(cached.map((p) => p.user_id)));
    let userMap = new Map();
    if (userIds.length) {
      const { data: users } = await supabase.from('users').select('id, email, full_name').in('id', userIds);
      userMap = new Map((users || []).map((u) => [u.id, u]));
    }

    // Resumen
    const total = cached.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    summaryEl.innerHTML = `
      <div class="admin-card">
        <div class="admin-card__title">Total recaudado</div>
        <div class="admin-card__big">${total.toFixed(2)} €</div>
        <div class="admin-card__meta">${cached.length} pagos</div>
      </div>
    `;

    if (!cached.length) {
      listEl.innerHTML = '<div class="admin-empty">Sin pagos para esos filtros.</div>';
      return;
    }

    listEl.innerHTML = '';
    listEl.appendChild(buildTable(cached, userMap));
  }

  monthSel.addEventListener('change', refresh);
  subjectSel.addEventListener('change', refresh);
  methodSel.addEventListener('change', refresh);

  exportBtn.addEventListener('click', () => exportCsv(cached));

  await refresh();
}

function buildTable(rows, userMap) {
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Alumno</th>
        <th>Asignatura</th>
        <th>Importe</th>
        <th>Método</th>
        <th>Notas</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  rows.forEach((p) => {
    const u = userMap.get(p.user_id) || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(p.created_at)}</td>
      <td>
        <div>${escapeHtml(u.full_name || '—')}</div>
        <div class="dim" style="font-size: 12px;">${escapeHtml(u.email || p.user_id)}</div>
      </td>
      <td>${p.subject_slug ? slugToName(p.subject_slug) : '<span class="dim">—</span>'}</td>
      <td><strong>${Number(p.amount).toFixed(2)} ${p.currency === 'EUR' ? '€' : escapeHtml(p.currency)}</strong></td>
      <td>${escapeHtml(p.payment_method)}</td>
      <td><span class="dim">${escapeHtml(p.notes || '')}</span></td>
    `;
    tbody.appendChild(tr);
  });
  return table;
}

function exportCsv(rows) {
  if (!rows.length) return;
  const header = ['fecha', 'email', 'nombre', 'asignatura', 'importe', 'moneda', 'metodo', 'notas'];
  const lines = [header.join(',')];
  // Necesitamos los emails — los pedimos
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  supabase
    .from('users')
    .select('id, email, full_name')
    .in('id', userIds)
    .then(({ data: users }) => {
      const map = new Map((users || []).map((u) => [u.id, u]));
      rows.forEach((p) => {
        const u = map.get(p.user_id) || {};
        lines.push([
          new Date(p.created_at).toISOString(),
          csvEscape(u.email || p.user_id),
          csvEscape(u.full_name || ''),
          csvEscape(p.subject_slug || ''),
          Number(p.amount).toFixed(2),
          p.currency,
          csvEscape(p.payment_method),
          csvEscape(p.notes || '')
        ].join(','));
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pagos_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
}

function csvEscape(s) {
  const v = String(s ?? '');
  if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
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
