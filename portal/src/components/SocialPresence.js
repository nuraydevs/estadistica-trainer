// Panel lateral colapsable "Estudiando ahora" en una asignatura.
// Usa Supabase Realtime presence channel — actualiza al instante.

import { subscribePresence, fetchProfile, saveProfile } from '../lib/presence.js';
import { avatarHtml } from './AvatarPicker.js';

const ACTIVE_MS = 5 * 60 * 1000;
const IDLE_MS = 30 * 60 * 1000;

export function mountSocialPresence(host, { userId, subject, currentSectionGetter }) {
  const root = document.createElement('aside');
  root.className = 'social-panel';
  host.appendChild(root);

  let myProfile = null;
  let collapsed = false;
  let presenceList = [];
  let controller = null;

  init();

  async function init() {
    myProfile = await fetchProfile().catch(() => null);
    controller = subscribePresence({
      subject: subject.slug,
      profile: { user_id: userId, ...(myProfile || {}) },
      getSection: currentSectionGetter,
      isVisible: myProfile?.show_online_status !== false,
      onSync: (state) => { presenceList = state; render(); }
    });
    // Refresca sección cada 30s
    const t = setInterval(() => {
      const sec = currentSectionGetter ? currentSectionGetter() : '';
      controller?.updateSection?.(sec);
    }, 30000);
    root._timer = t;
    render();
  }

  function render() {
    const sec = currentSectionGetter ? currentSectionGetter() : '';
    const visible = (presenceList || []).filter((p) => p && (p.user_id !== userId ? true : true));
    const all = visible;
    const others = all.filter((p) => p.user_id !== userId);
    const meEntry = all.find((p) => p.user_id === userId) || (myProfile?.show_online_status !== false ? {
      user_id: userId,
      display_name: myProfile?.display_name || 'Tú',
      avatar_type: myProfile?.avatar_type,
      avatar_url: myProfile?.avatar_url,
      avatar_banned: myProfile?.avatar_banned,
      section: sec
    } : null);

    const list = meEntry ? [meEntry, ...others] : others;
    const count = list.length;

    if (collapsed) {
      root.innerHTML = `
        <button type="button" class="social-toggle" data-action="expand" title="Estudiando ahora">
          <span class="dot dot--active"></span><span class="muted">${count}</span>
        </button>`;
      root.querySelector('[data-action="expand"]').addEventListener('click', () => { collapsed = false; render(); });
      root.classList.add('social-panel--collapsed');
      return;
    }
    root.classList.remove('social-panel--collapsed');

    const isMyVisible = myProfile?.show_online_status !== false;

    root.innerHTML = `
      <div class="social-panel__head">
        <div>
          <strong>Estudiando ahora</strong>
          <span class="muted">· ${count}</span>
        </div>
        <button type="button" class="tutor-iconbtn" data-action="collapse" title="Colapsar">»</button>
      </div>

      <label class="social-panel__toggle">
        <input type="checkbox" ${isMyVisible ? 'checked' : ''} data-action="toggle-vis">
        Mostrarme online
      </label>

      ${count === 0 ? '<div class="social-panel__empty">Eres el único estudiando ahora. Comparte la app con tus compañeros.</div>' : ''}

      <ul class="social-panel__list">
        ${list.map((p) => itemHtml(p, sec, userId)).join('')}
      </ul>
    `;

    root.querySelector('[data-action="collapse"]').addEventListener('click', () => { collapsed = true; render(); });
    root.querySelector('[data-action="toggle-vis"]').addEventListener('change', async (e) => {
      const next = !!e.target.checked;
      try {
        myProfile = await saveProfile({
          display_name: myProfile?.display_name || '',
          bio: myProfile?.bio || '',
          avatar_type: myProfile?.avatar_type || 'none',
          avatar_url: myProfile?.avatar_url || null,
          show_in_ranking: myProfile?.show_in_ranking !== false,
          show_online_status: next
        });
        await controller?.setVisibility?.(next);
        render();
      } catch {}
    });
  }

  function itemHtml(p, mySection, myUserId) {
    const isMe = p.user_id === myUserId;
    const name = isMe ? 'Tú' : (p.display_name || 'Anónimo');
    const section = p.section || (isMe ? mySection : 'Estudiando…');
    const same = !isMe && section && mySection && section === mySection;
    const status = activityStatus(p.ts || p.last_seen);
    return `
      <li class="social-item${same ? ' social-item--match' : ''}${isMe ? ' social-item--me' : ''}">
        <span class="social-item__avatar">
          ${avatarHtml(p, name, 28)}
          <span class="dot dot--${status}"></span>
        </span>
        <div class="social-item__info">
          <div class="social-item__name">${escapeHtml(name)}</div>
          <div class="social-item__section dim">${escapeHtml(section || '')}</div>
        </div>
      </li>
    `;
  }

  function activityStatus(ts) {
    const t = ts ? (typeof ts === 'number' ? ts : new Date(ts).getTime()) : Date.now();
    const diff = Date.now() - t;
    if (diff <= ACTIVE_MS) return 'active';
    if (diff <= IDLE_MS) return 'idle';
    return 'offline';
  }

  return {
    unmount() {
      if (root._timer) clearInterval(root._timer);
      controller?.stop?.();
      try { root.remove(); } catch {}
    }
  };
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
