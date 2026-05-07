import { fetchProgress, saveProgress, debounce } from '../lib/progress.js';
import { startSessionTracking } from '../lib/session-ping.js';
import { mountTutor } from '../components/Tutor.js';

export async function render(container, { subject, profile, onBack }) {
  container.innerHTML = '';

  if (!subject.available || !subject.loader) {
    const screen = document.createElement('div');
    screen.className = 'screen-msg';
    screen.innerHTML = `
      <h2>${subject.name}</h2>
      <p>Esta asignatura aún no está disponible. Pronto añadiremos contenido.</p>
      <button class="btn">Volver al hub</button>
    `;
    screen.querySelector('button').addEventListener('click', () => onBack?.());
    container.appendChild(screen);
    return { unmount() {} };
  }

  // Loading
  const loading = document.createElement('div');
  loading.className = 'screen-msg';
  loading.innerHTML = '<p class="muted">Cargando…</p>';
  container.appendChild(loading);

  const userId = profile.id;
  let initialState = null;
  try {
    initialState = await fetchProgress(userId, subject.slug);
  } catch (err) {
    console.warn('[SubjectView] no se pudo leer progreso de Supabase', err);
  }

  let mod;
  try {
    mod = await subject.loader();
  } catch (err) {
    console.error('[SubjectView] error cargando módulo', err);
    container.innerHTML = '';
    const errScreen = document.createElement('div');
    errScreen.className = 'screen-msg';
    errScreen.innerHTML = `
      <h2>Error al cargar la asignatura</h2>
      <p>Vuelve a intentarlo.</p>
      <button class="btn">Volver al hub</button>
    `;
    errScreen.querySelector('button').addEventListener('click', () => onBack?.());
    container.appendChild(errScreen);
    return { unmount() {} };
  }

  // Limpiamos loading y montamos contenedor del sub-app
  container.innerHTML = '';
  const shell = document.createElement('div');
  shell.id = 'app';
  shell.dataset.portalManaged = 'true';
  container.appendChild(shell);

  // Guardado debounce 2s a Supabase
  const debouncedSave = debounce((state) => {
    saveProgress(userId, subject.slug, state).catch((err) => {
      console.warn('[SubjectView] save fallo, queda en localStorage', err);
    });
  }, 2000);

  const onStateChanged = (event) => {
    if (event?.detail) debouncedSave(event.detail);
  };
  document.addEventListener('estadistica-state-changed', onStateChanged);

  let instance = null;
  try {
    instance = mod.mount(shell, { initialState });
  } catch (err) {
    console.error('[SubjectView] error montando sub-app', err);
  }

  // Session tracking (anti-sharing)
  let sessionTracker = null;
  startSessionTracking(subject.slug)
    .then((tracker) => { sessionTracker = tracker; })
    .catch((err) => console.warn('[SubjectView] no se pudo registrar sesión', err));

  // Tutor flotante (sólo si la asignatura tiene material asociado)
  let tutor = null;
  try {
    tutor = mountTutor(document.body, {
      subject: { slug: subject.slug, name: subject.name },
      isAdmin: !!profile.is_admin,
      getContext: () => {
        try { return instance?.getCurrentContext?.() || ''; }
        catch { return ''; }
      }
    });
  } catch (err) {
    console.warn('[SubjectView] no se pudo montar el tutor', err);
  }

  return {
    unmount() {
      document.removeEventListener('estadistica-state-changed', onStateChanged);
      debouncedSave.flush?.();
      try { sessionTracker?.stop?.(); } catch {}
      try { tutor?.unmount?.(); } catch {}
      try { instance?.unmount?.(); } catch {}
      container.innerHTML = '';
    }
  };
}
