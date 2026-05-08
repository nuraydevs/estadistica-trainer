// Moderación de la capa social: lista de perfiles públicos + botones banear avatar / banear usuario.
// Cada acción se loguea en moderation_log via /api/admin/moderate.

import { supabase } from '../../lib/supabase.js';
import { avatarHtml } from '../../components/AvatarPicker.js';

async function moderate(action, userId, reason = null) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const res = await fetch('/api/admin/moderate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, action, reason })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || 'moderate_failed');
  }
}

export async function render(container) {
  container.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'admin-community';
  wrap.innerHTML = `
    <p class="muted">Lista de perfiles públicos. Banea avatar/cuenta si hay contenido inapropiado.</p>
    <div id="community-list"></div>
  `;
  container.appendChild(wrap);

  const listEl = wrap.querySelector('#community-list');
  await populate(listEl);
}

async function populate(listEl) {
  listEl.innerHTML = '<p class="muted">Cargando…</p>';
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, avatar_url, avatar_type, avatar_banned, ban_reason, warned_at, show_in_ranking, show_online_status, bio, updated_at');

  if (!profiles?.length) {
    listEl.innerHTML = '<div class="admin-empty">Aún no hay perfiles personalizados.</div>';
    return;
  }

  const userIds = profiles.map((p) => p.user_id);
  const { data: users } = await supabase
    .from('users')
    .select('id, email, full_name, active')
    .in('id', userIds);
  const userMap = new Map((users || []).map((u) => [u.id, u]));

  const list = document.createElement('div');
  list.className = 'community-grid';
  profiles.forEach((p) => {
    const u = userMap.get(p.user_id) || {};
    list.appendChild(buildCard(p, u, () => populate(listEl)));
  });
  listEl.innerHTML = '';
  listEl.appendChild(list);
}

function buildCard(profile, user, refresh) {
  const card = document.createElement('article');
  card.className = 'community-card' + (profile.avatar_banned ? ' community-card--banned' : '');
  card.innerHTML = `
    <div class="community-card__head">
      ${avatarHtml(profile, user.full_name || user.email)}
      <div>
        <div><strong>${escapeHtml(profile.display_name || user.full_name || user.email)}</strong></div>
        <div class="dim" style="font-size: 12px;">${escapeHtml(user.email || '')}</div>
        ${profile.bio ? `<div class="muted" style="font-size: 12px;">"${escapeHtml(profile.bio)}"</div>` : ''}
      </div>
    </div>
    <div class="community-card__meta dim">
      ${profile.show_in_ranking ? '✓ ranking' : '— ranking'} ·
      ${profile.show_online_status ? '✓ online' : '— online'}
      ${profile.avatar_banned ? `<br>⚠ avatar baneado: ${escapeHtml(profile.ban_reason || '')}` : ''}
    </div>
    <div class="community-card__actions">
      <button class="btn btn--sm" data-action="ban-avatar">${profile.avatar_banned ? 'Restaurar avatar' : 'Banear avatar'}</button>
      <button class="btn btn--sm btn--danger" data-action="ban-user" ${user.active === false ? 'disabled' : ''}>${user.active === false ? 'Cuenta desactivada' : 'Banear usuario'}</button>
    </div>
  `;

  card.querySelector('[data-action="ban-avatar"]').addEventListener('click', async () => {
    try {
      if (!profile.avatar_banned) {
        const reason = prompt('Razón del baneo del avatar:', 'Contenido inapropiado');
        if (reason === null) return;
        await moderate('avatar_banned', profile.user_id, reason);
      } else {
        await moderate('avatar_cleared', profile.user_id);
      }
      refresh();
    } catch (err) { alert('Error: ' + err.message); }
  });

  card.querySelector('[data-action="ban-user"]').addEventListener('click', async () => {
    if (user.active === false) return;
    if (!confirm('¿Banear (desactivar) la cuenta de este usuario?')) return;
    try {
      await moderate('user_banned', profile.user_id, prompt('Razón (opcional):', ''));
      refresh();
    } catch (err) { alert('Error: ' + err.message); }
  });

  return card;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
