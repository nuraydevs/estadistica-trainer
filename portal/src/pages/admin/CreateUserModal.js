import { supabase } from '../../lib/supabase.js';
import { SUBJECTS } from '../../lib/subjects.js';

export function openCreateUserModal({ onCreated } = {}) {
  const initialPassword = generatePassword();
  const checkboxes = SUBJECTS.map((s) => `
    <label class="checkbox-row">
      <input type="checkbox" value="${s.slug}" ${s.available ? '' : 'disabled'} />
      ${s.name} ${s.available ? '' : '<span class="dim">(no disponible aún)</span>'}
    </label>
  `).join('');

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal modal--wide" role="dialog" aria-modal="true">
      <h2>Nuevo alumno</h2>
      <form class="grid-form">
        <label class="field">
          <span>Nombre completo</span>
          <input name="fullName" required autocomplete="off" />
        </label>
        <label class="field">
          <span>Email</span>
          <input name="email" type="email" required autocomplete="off" />
        </label>
        <label class="field">
          <span>Password temporal</span>
          <div class="input-row">
            <input name="password" value="${initialPassword}" required minlength="6" />
            <button type="button" class="btn btn--sm" data-action="regen">↻</button>
          </div>
        </label>
        <fieldset class="field">
          <legend>Asignaturas a desbloquear</legend>
          <div class="checkbox-group">${checkboxes}</div>
        </fieldset>
        <label class="field">
          <span>Método de pago</span>
          <select name="paymentMethod">
            <option value="efectivo">Efectivo</option>
            <option value="bizum">Bizum</option>
            <option value="transferencia">Transferencia</option>
            <option value="otros">Otros</option>
          </select>
        </label>
        <label class="field">
          <span>Importe cobrado (€)</span>
          <input name="amount" type="number" step="0.01" min="0" placeholder="0.00" />
        </label>
        <label class="field field--span2">
          <span>Notas</span>
          <textarea name="notes" rows="2" placeholder="Opcional"></textarea>
        </label>
      </form>
      <div class="actions">
        <button class="btn" data-action="cancel">Cancelar</button>
        <button class="btn btn--primary" data-action="submit">Crear alumno</button>
      </div>
      <div class="notice notice-create" hidden></div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const form = backdrop.querySelector('form');
  const passwordInput = form.querySelector('input[name="password"]');
  const noticeEl = backdrop.querySelector('.notice-create');

  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('[data-action="cancel"]').addEventListener('click', close);
  backdrop.querySelector('[data-action="regen"]').addEventListener('click', () => {
    passwordInput.value = generatePassword();
  });

  backdrop.querySelector('[data-action="submit"]').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const paymentMethod = form.paymentMethod.value;
    const amountRaw = form.amount.value.trim();
    const amount = amountRaw ? Number(amountRaw) : null;
    const notes = form.notes.value.trim();
    const subjects = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);

    const submitBtn = e.currentTarget;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando…';

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email,
          fullName,
          password,
          subjects,
          payment: amount && amount > 0 ? { amount, method: paymentMethod, notes } : null
        })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || body.error || 'No se pudo crear el alumno.');
      }

      // Pintamos credenciales y un botón "Copiar"
      const url = window.location.origin;
      const subjectsLabel = subjects.length
        ? subjects.map((s) => SUBJECTS.find((x) => x.slug === s)?.name || s).join(', ')
        : 'Ninguna';
      const credentials = `Acceso: ${url}
Email: ${email}
Password: ${password}
Asignaturas: ${subjectsLabel}`;

      noticeEl.hidden = false;
      noticeEl.classList.add('notice--success');
      noticeEl.innerHTML = `
        <div><strong>Alumno creado.</strong></div>
        <pre class="cred-block">${escapeHtml(credentials)}</pre>
        <button type="button" class="btn btn--sm" data-action="copy">Copiar credenciales</button>
      `;
      noticeEl.querySelector('[data-action="copy"]').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(credentials);
          noticeEl.querySelector('[data-action="copy"]').textContent = '✓ Copiado';
        } catch {}
      });
      submitBtn.textContent = 'Cerrar';
      submitBtn.onclick = () => { close(); onCreated?.(); };
      submitBtn.disabled = false;
      onCreated?.();
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crear alumno';
      noticeEl.hidden = false;
      noticeEl.classList.remove('notice--success');
      noticeEl.textContent = err.message || 'Error desconocido';
    }
  });
}

function generatePassword(len = 8) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
