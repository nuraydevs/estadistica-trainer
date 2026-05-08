// Modal de personalización de perfil — abre la 1ª vez (no bloqueante) y desde header.

import { saveProfile, fetchProfile, uploadAvatar } from '../lib/presence.js';
import { GENERATED_AVATARS, avatarSvgById, initialAvatar } from './AvatarPicker.js';

export async function openProfileSetup({ userId, fullName, email }) {
  const existing = await fetchProfile().catch(() => null);
  const initial = existing || {
    user_id: userId,
    display_name: fullName || email || '',
    avatar_type: 'none',
    avatar_url: null,
    show_in_ranking: true,
    show_online_status: true,
    bio: ''
  };

  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = buildHtml(initial);
    document.body.appendChild(backdrop);

    const modal = backdrop.querySelector('.modal');
    const nameInput = modal.querySelector('[name="display_name"]');
    const bioInput = modal.querySelector('[name="bio"]');
    const fileInput = modal.querySelector('[name="photo"]');
    const noticeEl = modal.querySelector('.profile-notice');
    const previewEl = modal.querySelector('.profile-preview');
    const errEl = modal.querySelector('.profile-error');

    let chosen = {
      avatar_type: initial.avatar_type || 'none',
      avatar_url: initial.avatar_url || null
    };

    function setError(msg) {
      if (!msg) { errEl.hidden = true; errEl.textContent = ''; return; }
      errEl.hidden = false;
      errEl.textContent = msg;
    }

    function refreshPreview() {
      const name = nameInput.value || initial.display_name || 'A';
      let svg;
      if (chosen.avatar_type === 'photo' && chosen.avatar_url) {
        previewEl.innerHTML = `<img src="${chosen.avatar_url}" width="64" height="64" style="object-fit:cover;border-radius:999px;">`;
        return;
      }
      if (chosen.avatar_type === 'generated' && chosen.avatar_url) {
        svg = avatarSvgById(chosen.avatar_url);
      }
      if (!svg) svg = initialAvatar(name, 64);
      previewEl.innerHTML = svg;
    }

    nameInput.addEventListener('input', refreshPreview);

    // Tipo de avatar (radio)
    modal.querySelectorAll('input[name="avatar_type"]').forEach((r) => {
      r.addEventListener('change', () => {
        chosen.avatar_type = r.value;
        if (r.value === 'none') {
          chosen.avatar_url = null;
        }
        modal.querySelector('.avatar-grid').hidden = r.value !== 'generated';
        modal.querySelector('.avatar-photo-row').hidden = r.value !== 'photo';
        refreshPreview();
      });
    });

    // Grid de SVG
    const grid = modal.querySelector('.avatar-grid');
    GENERATED_AVATARS.forEach((a) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'avatar-cell';
      cell.dataset.id = a.id;
      cell.innerHTML = a.svg;
      if (chosen.avatar_url === a.id) cell.classList.add('avatar-cell--active');
      cell.addEventListener('click', () => {
        chosen.avatar_url = a.id;
        chosen.avatar_type = 'generated';
        modal.querySelector('input[value="generated"]').checked = true;
        grid.querySelectorAll('.avatar-cell').forEach((c) => c.classList.remove('avatar-cell--active'));
        cell.classList.add('avatar-cell--active');
        refreshPreview();
      });
      grid.appendChild(cell);
    });

    // Foto
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen supera los 2 MB.');
        return;
      }
      noticeEl.hidden = false;
      noticeEl.textContent = 'Subiendo y comprimiendo…';
      try {
        const url = await uploadAvatar(file, userId);
        chosen.avatar_type = 'photo';
        chosen.avatar_url = url;
        modal.querySelector('input[value="photo"]').checked = true;
        refreshPreview();
        noticeEl.textContent = '✓ Foto lista';
      } catch (err) {
        setError('No se pudo subir: ' + (err.message || ''));
        noticeEl.hidden = true;
      }
    });

    refreshPreview();

    const close = (val) => { backdrop.remove(); resolve(val); };
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(null); });
    modal.querySelector('[data-action="close"]').addEventListener('click', () => close(null));
    modal.querySelector('[data-action="later"]').addEventListener('click', () => close(null));

    modal.querySelector('[data-action="save"]').addEventListener('click', async (e) => {
      setError('');
      const display_name = nameInput.value.trim();
      if (!display_name) { setError('Pon un nombre para mostrar.'); return; }
      const bio = bioInput.value.trim();
      const show_in_ranking = modal.querySelector('[name="show_in_ranking"]').checked;
      const show_online_status = modal.querySelector('[name="show_online_status"]').checked;
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        const saved = await saveProfile({
          display_name,
          bio,
          avatar_type: chosen.avatar_type,
          avatar_url: chosen.avatar_url,
          show_in_ranking,
          show_online_status
        });
        close(saved);
      } catch (err) {
        const detail = err?.payload?.detail || err?.message || 'Error desconocido';
        setError('No se pudo guardar: ' + detail);
        btn.disabled = false;
        btn.textContent = 'Guardar perfil';
      }
    });

    setTimeout(() => nameInput.focus(), 30);
  });
}

function buildHtml(p) {
  return `
    <div class="modal modal--wide" role="dialog" aria-modal="true">
      <div class="modal__head">
        <h2>Personaliza tu perfil</h2>
        <button class="tutor-iconbtn" data-action="close" aria-label="Cerrar">✕</button>
      </div>
      <p class="muted" style="font-size: 13px; margin-bottom: var(--space-3);">
        Visible para otros alumnos. Puedes desactivar la visibilidad cuando quieras.
      </p>

      <div style="display: grid; grid-template-columns: 80px 1fr; gap: var(--space-4); align-items: start;">
        <div class="profile-preview" style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;"></div>
        <div>
          <label class="field" style="margin-bottom:8px;">
            <span>Nombre que mostrar</span>
            <input name="display_name" maxlength="40" value="${escapeAttr(p.display_name || '')}" />
          </label>
          <label class="field" style="margin-bottom:0;">
            <span>Bio (opcional, máx 100)</span>
            <input name="bio" maxlength="100" value="${escapeAttr(p.bio || '')}" placeholder="1.º IEIA UAL · Almería" />
          </label>
        </div>
      </div>

      <div class="field" style="margin-top: var(--space-4);">
        <span>Avatar</span>
        <div class="avatar-options">
          <label class="avatar-option"><input type="radio" name="avatar_type" value="none" ${p.avatar_type === 'none' || !p.avatar_type ? 'checked' : ''}> Solo inicial</label>
          <label class="avatar-option"><input type="radio" name="avatar_type" value="generated" ${p.avatar_type === 'generated' ? 'checked' : ''}> Generado</label>
          <label class="avatar-option"><input type="radio" name="avatar_type" value="photo" ${p.avatar_type === 'photo' ? 'checked' : ''}> Subir foto</label>
        </div>
        <div class="avatar-grid" ${p.avatar_type !== 'generated' ? 'hidden' : ''}></div>
        <div class="avatar-photo-row" ${p.avatar_type !== 'photo' ? 'hidden' : ''} style="margin-top: var(--space-2);">
          <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" />
          <p class="muted" style="font-size:11px; margin-top: 4px;">JPG/PNG/WebP, máx 2 MB. Se comprime a 256×256.</p>
        </div>
      </div>

      <div class="field" style="margin-top: var(--space-3);">
        <label class="checkbox-row"><input type="checkbox" name="show_in_ranking" ${p.show_in_ranking !== false ? 'checked' : ''}> Mostrarme en el ranking</label>
        <label class="checkbox-row"><input type="checkbox" name="show_online_status" ${p.show_online_status !== false ? 'checked' : ''}> Mostrar mi presencia online</label>
      </div>

      <p class="muted" style="font-size: 11px; margin-top: var(--space-3);">
        Contenido inapropiado en avatar o nombre → baneo permanente.
      </p>

      <div class="profile-notice notice" hidden style="margin-top: var(--space-2);"></div>
      <div class="profile-error notice" hidden style="margin-top: var(--space-2); border-color: var(--danger); color: var(--danger); background: var(--danger-subtle);"></div>

      <div class="actions">
        <button class="btn" data-action="later">Ahora no</button>
        <button class="btn btn--primary" data-action="save">Guardar perfil</button>
      </div>
    </div>
  `;
}

function escapeAttr(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
