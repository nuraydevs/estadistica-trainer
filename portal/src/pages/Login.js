import { signIn } from '../lib/auth.js';

export function render(container, { onLoggedIn }) {
  container.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'login-screen';

  const card = document.createElement('div');
  card.className = 'login-card';
  card.innerHTML = `
    <h1>Portal Universitario</h1>
    <p class="subtitle">Accede con tu correo y contraseña.</p>
    <form>
      <div class="field">
        <label for="login-email">Email</label>
        <input id="login-email" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="login-password">Contraseña</label>
        <input id="login-password" type="password" autocomplete="current-password" required />
      </div>
      <button type="submit" class="btn btn--primary">Entrar</button>
      <div class="login-error" hidden></div>
    </form>
    <div class="login-help">
      ¿No tienes cuenta? Las cuentas las crean los administradores.
      Escríbenos a <a href="mailto:replika.agency@gmail.com">replika.agency@gmail.com</a>.
    </div>
  `;
  screen.appendChild(card);
  container.appendChild(screen);

  const form = card.querySelector('form');
  const emailEl = card.querySelector('#login-email');
  const passwordEl = card.querySelector('#login-password');
  const submitBtn = card.querySelector('button[type="submit"]');
  const errorEl = card.querySelector('.login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    errorEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando…';
    try {
      await signIn(emailEl.value.trim(), passwordEl.value);
      onLoggedIn?.();
    } catch (err) {
      const msg = err?.message || 'No se pudo iniciar sesión.';
      errorEl.textContent = msg.includes('Invalid')
        ? 'Email o contraseña incorrectos.'
        : msg;
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
    }
  });

  setTimeout(() => emailEl.focus(), 0);
}
