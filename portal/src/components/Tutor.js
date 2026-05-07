import { askTutor, fetchConversation, clearConversation, fetchTodayUsage } from '../lib/gemini.js';

const DAILY_LIMIT_DEFAULT = 50;

/**
 * Monta el tutor flotante. Devuelve { unmount, setContextProvider }.
 *
 * @param {HTMLElement} container - normalmente document.body
 * @param {object} options
 *   subject: { slug, name }
 *   isAdmin: boolean
 *   getContext: () => string  (devuelve la sección/tema activo)
 */
export function mountTutor(container, { subject, isAdmin = false, getContext }) {
  const state = {
    open: false,
    sending: false,
    messages: [],
    questionsToday: 0,
    dailyLimit: isAdmin ? null : DAILY_LIMIT_DEFAULT,
    error: null,
    getContext: typeof getContext === 'function' ? getContext : () => ''
  };

  const root = document.createElement('div');
  root.className = 'tutor-root';
  container.appendChild(root);

  const fab = document.createElement('button');
  fab.className = 'tutor-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Abrir tutor');
  fab.innerHTML = chatIconSvg();
  root.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'tutor-panel';
  panel.hidden = true;
  root.appendChild(panel);

  fab.addEventListener('click', () => {
    state.open = !state.open;
    if (state.open) openPanel();
    else closePanel();
  });

  // Carga inicial del historial y uso (no bloquea la UI)
  Promise.all([
    fetchConversation(subject.slug).catch(() => []),
    fetchTodayUsage(subject.slug).catch(() => ({ questionsToday: 0 }))
  ]).then(([msgs, usage]) => {
    state.messages = msgs.map((m) => ({ role: m.role, content: m.content }));
    state.questionsToday = usage.questionsToday;
    if (state.open) renderPanel();
  });

  function openPanel() {
    panel.hidden = false;
    root.classList.add('tutor-root--open');
    renderPanel();
    setTimeout(() => panel.querySelector('textarea')?.focus(), 30);
  }

  function closePanel() {
    panel.hidden = true;
    root.classList.remove('tutor-root--open');
  }

  function renderPanel() {
    panel.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'tutor-panel__header';
    header.innerHTML = `
      <div>
        <div class="tutor-panel__title">Tutor · ${escapeHtml(subject.name)}</div>
        <div class="tutor-panel__sub">Basado en tu temario oficial</div>
      </div>
      <div class="tutor-panel__actions">
        <button type="button" class="tutor-iconbtn" data-action="reset" title="Nueva conversación">↺</button>
        <button type="button" class="tutor-iconbtn" data-action="close" title="Cerrar">✕</button>
      </div>
    `;
    panel.appendChild(header);

    // Lista
    const list = document.createElement('div');
    list.className = 'tutor-panel__list';
    panel.appendChild(list);

    if (!state.messages.length) {
      const empty = document.createElement('div');
      empty.className = 'tutor-empty';
      empty.innerHTML = `
        <p><strong>Pregúntame sobre el temario.</strong></p>
        <p class="muted">Respondo solo con tu material oficial.
        Si no está en los PDFs, te lo digo.</p>
      `;
      list.appendChild(empty);
    } else {
      state.messages.forEach((m) => list.appendChild(buildBubble(m)));
    }

    if (state.sending) list.appendChild(buildTyping());

    // Error
    if (state.error) {
      const err = document.createElement('div');
      err.className = 'tutor-error';
      err.textContent = state.error;
      panel.appendChild(err);
    }

    // Input
    const inputWrap = document.createElement('div');
    inputWrap.className = 'tutor-panel__input';
    const usageLabel = state.dailyLimit
      ? `${state.questionsToday}/${state.dailyLimit} preguntas hoy`
      : `${state.questionsToday} preguntas hoy · sin límite`;
    inputWrap.innerHTML = `
      <textarea rows="1" placeholder="Pregunta sobre el temario..." ${state.sending ? 'disabled' : ''}></textarea>
      <button type="button" class="btn btn--primary btn--sm tutor-send" disabled>Enviar</button>
      <div class="tutor-counter muted">${usageLabel}</div>
    `;
    panel.appendChild(inputWrap);

    // Wire
    header.querySelector('[data-action="close"]').addEventListener('click', () => {
      state.open = false;
      closePanel();
    });
    header.querySelector('[data-action="reset"]').addEventListener('click', async () => {
      if (state.sending) return;
      if (!state.messages.length) return;
      if (!confirm('¿Borrar la conversación?')) return;
      state.messages = [];
      state.error = null;
      await clearConversation(subject.slug);
      renderPanel();
    });

    const ta = inputWrap.querySelector('textarea');
    const sendBtn = inputWrap.querySelector('.tutor-send');
    autoGrow(ta);
    ta.addEventListener('input', () => {
      autoGrow(ta);
      sendBtn.disabled = !ta.value.trim() || state.sending;
    });
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) doSend(ta.value.trim());
      }
    });
    sendBtn.addEventListener('click', () => {
      if (!ta.value.trim()) return;
      doSend(ta.value.trim());
    });

    // scroll al final
    requestAnimationFrame(() => { list.scrollTop = list.scrollHeight; });
  }

  async function doSend(question) {
    state.error = null;
    state.sending = true;
    state.messages.push({ role: 'user', content: question });
    renderPanel();

    try {
      const ctx = (state.getContext?.() || '').toString();
      // Pasamos los últimos 6 mensajes como historial, EXCLUYENDO el mensaje
      // que acabamos de añadir (la pregunta actual va en el `question` field).
      const history = state.messages.slice(-7, -1);
      const result = await askTutor({
        question,
        subject: subject.slug,
        context: ctx,
        history
      });
      state.messages.push({ role: 'model', content: result.answer });
      state.questionsToday = result.questionsToday ?? state.questionsToday + 1;
      if (result.dailyLimit !== undefined) state.dailyLimit = result.dailyLimit;
    } catch (err) {
      // Si Gemini falla, eliminamos la pregunta del historial visible para que se pueda reintentar
      const lastIsUser = state.messages.at(-1)?.role === 'user';
      if (lastIsUser) state.messages.pop();
      state.error = humanizeError(err);
    } finally {
      state.sending = false;
      renderPanel();
    }
  }

  return {
    setSubject(newSubject) {
      subject = newSubject;
      state.messages = [];
      state.error = null;
      Promise.all([
        fetchConversation(newSubject.slug).catch(() => []),
        fetchTodayUsage(newSubject.slug).catch(() => ({ questionsToday: 0 }))
      ]).then(([msgs, usage]) => {
        state.messages = msgs.map((m) => ({ role: m.role, content: m.content }));
        state.questionsToday = usage.questionsToday;
        if (state.open) renderPanel();
      });
    },
    setContextProvider(fn) {
      if (typeof fn === 'function') state.getContext = fn;
    },
    unmount() {
      try { root.remove(); } catch {}
    }
  };
}

// ── helpers ──────────────────────────────────────────────────

function buildBubble({ role, content }) {
  const wrap = document.createElement('div');
  wrap.className = `tutor-msg tutor-msg--${role === 'model' ? 'tutor' : 'user'}`;
  const bubble = document.createElement('div');
  bubble.className = 'tutor-bubble';
  bubble.textContent = content;
  wrap.appendChild(bubble);
  return wrap;
}

function buildTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'tutor-msg tutor-msg--tutor';
  wrap.innerHTML = `<div class="tutor-bubble tutor-typing"><span></span><span></span><span></span></div>`;
  return wrap;
}

function chatIconSvg() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`;
}

function autoGrow(ta) {
  ta.style.height = 'auto';
  const max = 4 * 22; // ~4 líneas
  ta.style.height = Math.min(ta.scrollHeight, max) + 'px';
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function humanizeError(err) {
  const code = err?.code || '';
  if (code === 'LIMIT_USER' || code === 'daily_limit') {
    return err?.message || 'Has agotado tus preguntas de hoy. Vuelve mañana — el límite se resetea a las 00:00.';
  }
  if (code === 'LIMIT_GLOBAL') {
    return 'El tutor está descansando un momento. Inténtalo en unas horas.';
  }
  if (code === 'tutor_paused') {
    return 'El tutor está pausado por el administrador. Inténtalo más tarde.';
  }
  if (code === 'subject_locked') return 'No tienes acceso a esta asignatura.';
  if (code === 'unauthorized') return 'Sesión caducada. Vuelve a iniciar sesión.';
  if (code === 'gemini_error' || code === 'gemini_unreachable') {
    return 'El tutor no está disponible ahora. Inténtalo en un momento.';
  }
  if (err?.message?.includes('Failed to fetch')) {
    return 'Sin conexión. Revisa tu internet.';
  }
  return err?.message || 'Error desconocido.';
}
