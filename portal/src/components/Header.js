// Header global del portal con nav + avatar dropdown.

import { avatarHtml } from './AvatarPicker.js';

export function render({ profile, socialProfile, view, onGoHub, onGoCommunity, onGoAdmin, onLogout, onEditProfile }) {
  const header = document.createElement('header');
  header.className = 'portal-header';

  const brandLabel = view === 'subject'
    ? '← Volver al hub'
    : 'Portal Universitario';

  const navHtml = view === 'subject' ? '' : `
    <nav class="portal-header__tabs">
      <button class="portal-tab${view === 'hub' ? ' portal-tab--active' : ''}" data-action="hub">Hub</button>
      <button class="portal-tab${view === 'community' ? ' portal-tab--active' : ''}" data-action="community">Comunidad</button>
      ${profile?.is_admin ? `<button class="portal-tab${view === 'admin' ? ' portal-tab--active' : ''}" data-action="admin">Admin</button>` : ''}
    </nav>
  `;

  const greeting = socialProfile?.display_name?.trim() || profile?.full_name?.trim() || profile?.email || '';

  header.innerHTML = `
    <div class="portal-header__brand">
      <button type="button" data-action="brand">${brandLabel}</button>
    </div>
    ${navHtml}
    <div class="portal-header__nav">
      <button class="avatar-trigger" data-action="avatar-menu" aria-haspopup="true" aria-expanded="false">
        ${avatarHtml(socialProfile, greeting, 28)}
        <span class="avatar-trigger__name">${escapeHtml(greeting)}</span>
        <span class="dim">▾</span>
      </button>
    </div>
    <div class="avatar-dropdown" hidden>
      <button class="avatar-dropdown__item" data-action="edit-profile">Editar perfil</button>
      <button class="avatar-dropdown__item" data-action="logout">Cerrar sesión</button>
    </div>
  `;

  const dropdown = header.querySelector('.avatar-dropdown');
  const trigger = header.querySelector('[data-action="avatar-menu"]');

  function closeDropdown() {
    dropdown.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }
  function openDropdown() {
    dropdown.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown.hidden) openDropdown(); else closeDropdown();
  });
  document.addEventListener('click', closeDropdown);

  header.querySelector('[data-action="brand"]').addEventListener('click', onGoHub);
  header.querySelector('[data-action="hub"]')?.addEventListener('click', onGoHub);
  header.querySelector('[data-action="community"]')?.addEventListener('click', onGoCommunity);
  header.querySelector('[data-action="admin"]')?.addEventListener('click', onGoAdmin);
  header.querySelector('[data-action="edit-profile"]').addEventListener('click', () => { closeDropdown(); onEditProfile?.(); });
  header.querySelector('[data-action="logout"]').addEventListener('click', () => { closeDropdown(); onLogout?.(); });

  return header;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
