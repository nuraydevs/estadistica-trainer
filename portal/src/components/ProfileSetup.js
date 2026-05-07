// Modal de personalización de perfil. Se abre al primer login y desde header.

import { upsertProfile, fetchUserProfile, GENERATED_AVATARS } from '../lib/presence.js';

export async function openProfileSetup({ userId, fullName, email }) {
  const existing = await fetchUserProfile(userId);
  const initial = existing || {
    display_name: fullName || email,
    avatar_type: 'none',
    avatar_url: null,
    show_in_ranking: true,
    show_online_status: true,
    bio: ''
  };

  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal modal--wide" role="dialog" aria-modal="true">
        <div class="modal__head">
          <h2>Personaliza tu perfil</h2>
          <button class="tutor-iconbtn" data-action="close" aria-label="Cerrar">✕</button>
        </div>
        <p class="muted" style="font-size: 13px; margin-bottom: var(--space-3);">Visible para otros alumnos.
        Puedes desactivar la visibilidad en cualquier momento.</p>

        <div class="grid-form">
          <label class="field">
            <span>Nombre que mostrar</span>
            <input name="display_name" maxlength="40" />
          </label>
          <label class="field">
            <span>Bio (opcional, máx 100)</span>
            <input name="bio" maxlength="100" placeholder="1.º IEIA UAL · Almería" />
          </label>
        </div>

        <div class="field">
          <span>Avatar</span>
          <div class="avatar-options">
            <label class="avatar-option">
              <input type="radio" name="avatar_type" value="none" />
              <span class="avatar avatar--init">${(initial.display_name || 'A')[0].toUpperCase()}</span>
              <span class="avatar-option__label">Solo inicial</span>
            </label>
            <label class="avatar-option">
              <input type="radio" name="avatar_type" value="generated" />
              <span class="avatar-option__label">Generado</span>
            </label>
          </div>
          <div class="avatar-grid" id="avatar-grid"></div>
        </div>

        <div class="field" style="margin-top: var(--space-3);">
          <label class="checkbox-row">
            <input type="checkbox" name="show_in_ranking" />
            Mostrarme en el ranking
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="show_online_status" />
            Mostrar que estoy online cuando estudio
          </label>
        </div>

        <p class="dim" style="font-size: 11px; margin-top: var(--space-3);">
          Tu nombre y avatar son visibles para otros alumnos. Contenido inapropiado → baneo permanente.
        </p>

        <div class="actions">
          <button class="btn" data-action="later">Ahora no</button>
          <button class="btn btn--primary" data-action="save">Guardar</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const form = backdrop.querySelector('.modal');
    form.querySelector('[name="display_name"]').value = initial.display_name || '';
    form.querySelector('[name="bio"]').value = initial.bio || '';
    form.querySelector('[name="show_in_ranking"]').checked = !!initial.show_in_ranking;
    form.querySelector('[name="show_online_status"]').checked = !!initial.show_online_status;
    form.querySelectorAll('[name="avatar_type"]').forEach((r) => {
      r.checked = r.value === (initial.avatar_type || 'none');
    });

    // Avatar grid
    const grid = form.querySelector('#avatar-grid');
    GENERATED_AVATARS.forEach((emoji) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'avatar-cell';
      cell.textContent = emoji;
      if (initial.avatar_type === 'generated' && initial.avatar_url === emoji) {
        cell.classList.add('avatar-cell--active');
      }
      cell.addEventListener('click', () => {
        form.querySelector('[name="avatar_type"][value="generated"]').checked = true;
        form.querySelectorAll('.avatar-cell').forEach((c) => c.classList.remove('avatar-cell--active'));
        cell.classList.add('avatar-cell--active');
        cell.dataset.selected = 'true';
      });
      grid.appendChild(cell);
    });

    const close = (result) => { backdrop.remove(); resolve(result); };
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(null); });
    form.querySelector('[data-action="close"]').addEventListener('click', () => close(null));
    form.querySelector('[data-action="later"]').addEventListener('click', () => close(null));
    form.querySelector('[data-action="save"]').addEventListener('click', async () => {
      const display_name = form.querySelector('[name="display_name"]').value.trim() || (fullName || email);
      const bio = form.querySelector('[name="bio"]').value.trim();
      const show_in_ranking = form.querySelector('[name="show_in_ranking"]').checked;
      const show_online_status = form.querySelector('[name="show_online_status"]').checked;
      const avatar_type = form.querySelector('[name="avatar_type"]:checked')?.value || 'none';
      const selectedCell = form.querySelector('.avatar-cell--active');
      const avatar_url = avatar_type === 'generated' && selectedCell ? selectedCell.textContent : null;

      try {
        const saved = await upsertProfile(userId, {
          display_name, bio, show_in_ranking, show_online_status, avatar_type, avatar_url
        });
        close(saved);
      } catch (err) {
        alert('No se pudo guardar: ' + (err.message || ''));
      }
    });
  });
}
