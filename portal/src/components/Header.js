export function render({ profile, view, onGoHub, onGoAdmin, onLogout }) {
  const header = document.createElement('header');
  header.className = 'portal-header';

  const brandLabel = view === 'subject'
    ? '← Volver al hub'
    : 'Portal Universitario';

  header.innerHTML = `
    <div class="portal-header__brand">
      <button type="button">${brandLabel}</button>
    </div>
    <div class="portal-header__nav">
      <span class="portal-header__user">${escapeHtml(profile?.full_name?.trim() || profile?.email || '')}</span>
      ${profile?.is_admin ? '<button class="btn btn--sm" data-action="admin">Admin</button>' : ''}
      <button class="btn btn--sm" data-action="logout">Salir</button>
    </div>
  `;

  header.querySelector('.portal-header__brand button').addEventListener('click', onGoHub);
  header.querySelector('[data-action="logout"]')?.addEventListener('click', onLogout);
  header.querySelector('[data-action="admin"]')?.addEventListener('click', onGoAdmin);

  return header;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
