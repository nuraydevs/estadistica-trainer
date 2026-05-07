// Panel lateral discreto: "Estudiando ahora" en la asignatura.

import { fetchOnlineUsers, avatarHtml, fetchUserProfile, upsertProfile } from '../lib/presence.js';

export function mountSocialPresence(host, { userId, subject, currentSectionGetter }) {
  const root = document.createElement('aside');
  root.className = 'social-panel';
  host.appendChild(root);

  let users = [];
  let myProfile = null;
  let pollId = null;

  init();

  async function init() {
    myProfile = await fetchUserProfile(userId).catch(() => null);
    users = await fetchOnlineUsers(subject.slug).catch(() => []);
    render();
    pollId = setInterval(refresh, 30000);
  }

  async function refresh() {
    users = await fetchOnlineUsers(subject.slug).catch(() => users);
    render();
  }

  function render() {
    const visible = users;
    const isMyVisible = myProfile?.show_online_status !== false;
    const myInList = visible.find((u) => u.user_id === userId);

    const others = visible.filter((u) => u.user_id !== userId);
    const myselfRow = myInList || (isMyVisible
      ? {
          user_id: userId,
          subject_slug: subject.slug,
          current_section: currentSectionGetter ? currentSectionGetter() : '',
          profile: myProfile
        }
      : null);

    const all = myselfRow ? [myselfRow, ...others] : others;

    root.innerHTML = `
      <div class="social-panel__head">
        <strong>Estudiando ahora</strong>
        <span class="muted">· ${all.length} ${all.length === 1 ? 'compañero' : 'compañeros'}</span>
        <label class="social-panel__toggle">
          <input type="checkbox" ${isMyVisible ? 'checked' : ''} data-action="toggle-visibility" />
          Visible
        </label>
      </div>
      ${all.length === 0 ? '<div class="social-panel__empty">Eres el único estudiando ahora. Comparte la app con tus compañeros.</div>' : ''}
      <ul class="social-panel__list">
        ${all.map((u) => itemHtml(u, currentSectionGetter)).join('')}
      </ul>
    `;

    root.querySelector('[data-action="toggle-visibility"]')?.addEventListener('change', async (e) => {
      const next = e.target.checked;
      try {
        myProfile = await upsertProfile(userId, { show_online_status: next });
        refresh();
      } catch {}
    });
  }

  function itemHtml(u, getMySection) {
    const profile = u.profile || {};
    const name = u.user_id === userId ? 'Tú' : (profile.display_name || 'Alguien anónimo');
    const section = u.user_id === userId && getMySection ? getMySection() : (u.current_section || 'Estudiando…');
    const sameSection = u.user_id !== userId && currentSectionGetter && section === currentSectionGetter();
    return `
      <li class="social-item${sameSection ? ' social-item--match' : ''}">
        ${avatarHtml(profile, name)}
        <div class="social-item__info">
          <div class="social-item__name">${escapeHtml(name)}</div>
          <div class="social-item__section dim">${escapeHtml(section || '')}</div>
        </div>
      </li>
    `;
  }

  return {
    refresh,
    unmount() {
      if (pollId) clearInterval(pollId);
      try { root.remove(); } catch {}
    }
  };
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
