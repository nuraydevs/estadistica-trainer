import { supabase } from '../../lib/supabase.js';
import { SUBJECTS } from '../../lib/subjects.js';
import { openCreateUserModal } from './CreateUserModal.js';
import { openStudentDetail } from './StudentDetail.js';

export async function render(container) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'admin-tab-students';
  wrap.innerHTML = `
    <div class="admin-toolbar">
      <input type="search" id="students-search" placeholder="Buscar por nombre o email…" class="admin-search" />
      <div class="admin-filters">
        <button class="btn btn--sm" data-filter="all">Todos</button>
        <button class="btn btn--sm" data-filter="active">Activos</button>
        <button class="btn btn--sm" data-filter="suspicious">⚠ Sospechosos</button>
        <button class="btn btn--sm" data-filter="inactive">Inactivos +30d</button>
      </div>
      <button class="btn btn--primary" id="students-new">+ Nuevo alumno</button>
    </div>
    <div id="students-list"></div>
  `;
  container.appendChild(wrap);

  const listEl = wrap.querySelector('#students-list');
  const searchEl = wrap.querySelector('#students-search');
  const filterBtns = wrap.querySelectorAll('[data-filter]');
  let activeFilter = 'all';
  filterBtns[0].classList.add('btn--primary');

  let cachedUsers = [];

  async function refresh() {
    listEl.innerHTML = '<p class="muted" style="padding: var(--space-4)">Cargando…</p>';
    cachedUsers = await fetchAllUsers();
    renderList();
  }

  function renderList() {
    const q = searchEl.value.trim().toLowerCase();
    const now = Date.now();
    const inactiveCutoff = now - 30 * 24 * 60 * 60 * 1000;
    let rows = cachedUsers;
    if (activeFilter === 'active') rows = rows.filter((u) => u.active);
    else if (activeFilter === 'suspicious') rows = rows.filter((u) => u.suspicious);
    else if (activeFilter === 'inactive') rows = rows.filter((u) => !u.last_seen_at || new Date(u.last_seen_at).getTime() < inactiveCutoff);
    if (q) rows = rows.filter((u) => `${u.email} ${u.full_name || ''}`.toLowerCase().includes(q));

    if (!rows.length) {
      listEl.innerHTML = '<div class="admin-empty">Sin resultados.</div>';
      return;
    }

    listEl.innerHTML = '';
    listEl.appendChild(buildTable(rows, refresh));
  }

  searchEl.addEventListener('input', renderList);
  filterBtns.forEach((b) => b.addEventListener('click', () => {
    activeFilter = b.dataset.filter;
    filterBtns.forEach((x) => x.classList.remove('btn--primary'));
    b.classList.add('btn--primary');
    renderList();
  }));

  wrap.querySelector('#students-new').addEventListener('click', () => {
    openCreateUserModal({ onCreated: refresh });
  });

  await refresh();
}

async function fetchAllUsers() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, full_name, is_admin, active, suspicious, last_ip, last_seen_at, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[admin] fetchAllUsers', error);
    return [];
  }
  const { data: subs } = await supabase.from('user_subjects').select('user_id, subject_slug');
  const subsByUser = new Map();
  (subs ?? []).forEach((row) => {
    if (!subsByUser.has(row.user_id)) subsByUser.set(row.user_id, []);
    subsByUser.get(row.user_id).push(row.subject_slug);
  });
  return users.map((u) => ({ ...u, subjects: subsByUser.get(u.id) ?? [] }));
}

function buildTable(users, refresh) {
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Alumno</th>
        <th>Asignaturas</th>
        <th>Último acceso</th>
        <th>IP</th>
        <th>Estado</th>
        <th></th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  users.forEach((u) => tbody.appendChild(buildRow(u, refresh)));
  return table;
}

function buildRow(user, refresh) {
  const tr = document.createElement('tr');
  if (user.suspicious) tr.classList.add('admin-row--suspicious');

  const subjectTags = (user.subjects || [])
    .map((slug) => `<span class="subject-tag">${slugToName(slug)}</span>`)
    .join('') || '<span class="dim">—</span>';

  const stateBadge = user.active
    ? user.suspicious
      ? '<span style="color: var(--danger); font-weight: 600;">⚠ Sospechoso</span>'
      : '<span class="muted">Activo</span>'
    : '<span style="color: var(--text-tertiary);">Desactivado</span>';
  const adminBadge = user.is_admin ? ' · <strong>admin</strong>' : '';

  tr.innerHTML = `
    <td>
      <div>${escapeHtml(user.full_name || '—')}</div>
      <div class="dim" style="font-size: 12px;">${escapeHtml(user.email)}</div>
    </td>
    <td><div class="subject-tags">${subjectTags}</div></td>
    <td>${formatDateTime(user.last_seen_at) || '<span class="dim">nunca</span>'}</td>
    <td><code class="admin-ip">${escapeHtml(user.last_ip || '—')}</code></td>
    <td>${stateBadge}${adminBadge}</td>
    <td>
      <div class="actions">
        <button class="btn btn--sm" data-action="detail">Ver detalle</button>
        <button class="btn btn--sm" data-action="toggle">${user.active ? 'Desactivar' : 'Activar'}</button>
      </div>
    </td>
  `;

  tr.querySelector('[data-action="detail"]').addEventListener('click', () =>
    openStudentDetail({ user, onChange: refresh })
  );
  tr.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
    if (!confirm(user.active ? '¿Desactivar este alumno?' : '¿Reactivar este alumno?')) return;
    await supabase.from('users').update({ active: !user.active }).eq('id', user.id);
    refresh();
  });
  return tr;
}

function slugToName(slug) {
  return SUBJECTS.find((s) => s.slug === slug)?.name || slug;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function formatDateTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return iso;
  }
}
