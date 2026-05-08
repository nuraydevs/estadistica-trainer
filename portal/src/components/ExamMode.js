// Modo examen: 3 pantallas (selección → activo → corrección).
// Flujo: /api/exam/start → /api/exam/submit (por pregunta) → /api/exam/finish.
// Auto-save en localStorage de cada respuesta para recuperación.

import { supabase } from '../lib/supabase.js';
import { renderMath } from '../lib/math-render.js';

const PRESETS = {
  completo: { label: 'Simulacro completo', minutes: 120, description: 'Como el examen real. Te corrijo igual de duro.' },
  parcial:  { label: 'Simulacro parcial',  minutes: 45,  description: 'Centrado en tus puntos flojos.' },
  panico:   { label: 'Modo pánico',        minutes: 30,  description: 'Solo lo que cae siempre. Máxima rentabilidad.' }
};

async function api(path, opts = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Sin sesión');
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || body.error || `HTTP ${res.status}`);
    err.code = body.error;
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export function mountExamMode(host, { subject, profile, examDate, daysToExam, onExit }) {
  const root = document.createElement('div');
  root.className = 'exam-overlay';
  host.appendChild(root);

  const state = {
    screen: 'select',                   // select | taking | reviewing
    sessionId: null,
    questions: [],
    answers: {},                         // qid → text
    currentIdx: 0,
    timeLimitMs: 0,
    startedAt: 0,
    questionStartAt: 0,
    timerId: null,
    correctionResult: null,
    history: []
  };

  const panic = daysToExam != null && daysToExam >= 0 && daysToExam <= 7;

  renderSelect();

  // ── Pantalla 1: selección ───────────────────────────────
  async function renderSelect() {
    state.screen = 'select';
    root.innerHTML = `
      <div class="exam-screen exam-select">
        <header class="exam-screen__head">
          <button class="btn btn--sm" data-action="exit">← Volver</button>
          <h1>Modo examen — ${escapeHtml(subject.name)}</h1>
          ${daysToExam != null && daysToExam >= 0
            ? `<span class="muted">Examen en ${daysToExam} días</span>`
            : '<span></span>'}
        </header>
        ${panic ? `<div class="exam-bar__panic" style="margin-bottom: var(--space-4); padding: 8px 12px; border: 1px solid var(--warning); border-radius: var(--radius); background: var(--warning-subtle); color: var(--warning);">⚡ Quedan ${daysToExam} días para tu examen ordinaria. Modo pánico recomendado.</div>` : ''}
        <div class="exam-cards">
          ${cardHtml('completo', false)}
          ${cardHtml('parcial', false, profile?.total_exercises_done ? null : 'Resuelve algunos ejercicios primero')}
          ${cardHtml('panico', panic)}
        </div>
        <div id="exam-history" style="margin-top: var(--space-5);"></div>
      </div>
    `;
    root.querySelector('[data-action="exit"]').addEventListener('click', exit);
    root.querySelectorAll('.exam-card').forEach((card) => {
      const disabled = card.dataset.disabled === 'true';
      if (disabled) return;
      card.addEventListener('click', () => begin(card.dataset.type));
    });

    // History (últimos 5)
    try {
      const { sessions } = await api(`/api/exam/history?subject=${encodeURIComponent(subject.slug)}`, { method: 'GET' });
      state.history = sessions || [];
      renderHistory();
    } catch {}
  }

  function cardHtml(type, highlighted, disabledReason = null) {
    const preset = PRESETS[type];
    return `
      <button type="button" class="exam-card${highlighted ? ' exam-card--highlight' : ''}${disabledReason ? ' exam-card--disabled' : ''}"
              data-type="${type}" ${disabledReason ? 'data-disabled="true"' : ''}>
        <h3>${preset.label}${highlighted ? ' ⚡' : ''}</h3>
        <p class="muted">${preset.description}</p>
        <div class="exam-card__meta">
          <span>${preset.minutes} min</span>
          <span>${type === 'completo' ? '4-5' : type === 'parcial' ? '2' : '3'} ejercicios</span>
        </div>
        ${disabledReason ? `<p class="dim" style="font-size: 11px; margin-top: 4px;">${disabledReason}</p>` : ''}
      </button>
    `;
  }

  function renderHistory() {
    const host = root.querySelector('#exam-history');
    if (!host) return;
    const finished = state.history.filter((s) => s.status === 'finished').slice(0, 5);
    if (!finished.length) { host.innerHTML = ''; return; }
    host.innerHTML = `
      <h3 style="margin: 0 0 var(--space-2); font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Tus simulacros anteriores</h3>
      <ul class="exam-history-list">
        ${finished.map((s) => `
          <li class="exam-history-row" data-id="${s.id}">
            <span>${formatDate(s.finishedAt)}</span>
            <span>${PRESETS[s.examType]?.label || s.examType}</span>
            <span><strong>${formatScore(s.score)}</strong> / 10</span>
            <span class="exam-verdict-badge exam-verdict-badge--${s.verdict || 'sin_evaluar'}">${verdictLabel(s.verdict)}</span>
          </li>
        `).join('')}
      </ul>
    `;
    host.querySelectorAll('[data-id]').forEach((row) => row.addEventListener('click', () => openHistoryDetail(row.dataset.id)));
  }

  async function openHistoryDetail(sessionId) {
    try {
      const { session, answers } = await api(`/api/exam/detail?sessionId=${sessionId}`, { method: 'GET' });
      const meta = session.metadata || {};
      state.correctionResult = {
        sessionId: session.id,
        score: session.score,
        verdict: meta.verdict || 'sin_evaluar',
        conceptsToReview: meta.concepts_to_review || [],
        answers: answers.map((a) => ({
          questionId: a.question_id,
          statement: a.question_statement,
          points: a.max_score,
          concept: a.concept,
          userAnswer: a.user_answer,
          timeSpent: a.time_spent_seconds,
          correction: a.ai_correction
        }))
      };
      renderReview(true);
    } catch (err) {
      alert('No se pudo cargar el examen: ' + err.message);
    }
  }

  // ── Pantalla 2: examen en marcha ────────────────────────
  async function begin(examType) {
    state.screen = 'taking';
    root.innerHTML = `<div class="exam-screen"><p class="muted">Preparando examen…</p></div>`;
    try {
      const r = await api('/api/exam/start', { method: 'POST', body: JSON.stringify({ subject: subject.slug, examType }) });
      state.sessionId = r.sessionId;
      state.questions = r.questions || [];
      state.timeLimitMs = (r.timeLimitMinutes || PRESETS[examType].minutes) * 60 * 1000;
      state.startedAt = new Date(r.startedAt).getTime();
      state.currentIdx = 0;
      // Restaurar respuestas si existen en localStorage
      const stored = readStored(state.sessionId);
      state.answers = stored || {};
      state.questions.forEach((q) => { if (state.answers[q.id] == null) state.answers[q.id] = ''; });
    } catch (err) {
      const reason = err?.body?.message || err.message;
      root.innerHTML = `<div class="exam-screen"><h2>No se pudo iniciar</h2>
        <p class="muted">${escapeHtml(reason)}</p>
        <button class="btn" data-action="back">Volver</button></div>`;
      root.querySelector('[data-action="back"]').addEventListener('click', renderSelect);
      return;
    }

    state.questionStartAt = Date.now();
    renderTaking();
    state.timerId = setInterval(tickTimer, 1000);
  }

  function renderTaking() {
    const q = state.questions[state.currentIdx];
    if (!q) return;
    const remaining = Math.max(0, state.timeLimitMs - (Date.now() - state.startedAt));
    const progress = ((state.currentIdx + 1) / state.questions.length) * 100;
    const timerCls = remaining < state.timeLimitMs * 0.1 ? 'exam-timer--danger' :
                     remaining < state.timeLimitMs * 0.5 ? 'exam-timer--warning' : '';

    root.innerHTML = `
      <div class="exam-screen exam-taking">
        <header class="exam-screen__head exam-screen__head--sticky">
          <div>
            <div class="exam-progress">Pregunta ${state.currentIdx + 1} de ${state.questions.length}</div>
            <div class="exam-progress-bar"><div class="exam-progress-bar__fill" style="width: ${progress}%"></div></div>
          </div>
          <span class="exam-timer ${timerCls}" data-timer>${formatTime(remaining)}</span>
          <button class="btn btn--sm btn--danger" data-action="abandon">Abandonar</button>
        </header>
        <article class="exam-question">
          <div class="exam-question__meta">
            <span class="subject-tag">${escapeHtml(q.concept || '')}</span>
            <span class="dim">${q.points} pts</span>
          </div>
          <div class="exam-question__statement">${escapeHtml(q.statement)}</div>
          <textarea class="exam-answer" placeholder="Escribe aquí tu resolución paso a paso…"></textarea>
        </article>
        <footer class="exam-screen__foot">
          ${state.currentIdx > 0 ? '<button class="btn" data-action="prev">← Anterior</button>' : '<span></span>'}
          ${state.currentIdx < state.questions.length - 1
            ? '<button class="btn btn--primary" data-action="next">Siguiente →</button>'
            : '<button class="btn btn--primary" data-action="finish">Terminar examen</button>'}
        </footer>
      </div>
    `;

    // Render LaTeX en el statement
    renderMath(root.querySelector('.exam-question__statement'));

    const ta = root.querySelector('textarea');
    ta.value = state.answers[q.id] || '';
    let saveTimer = null;
    ta.addEventListener('input', () => {
      state.answers[q.id] = ta.value;
      writeStored(state.sessionId, state.answers);
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => persistAnswer(q), 1500);
    });
    setTimeout(() => ta.focus(), 30);

    root.querySelector('[data-action="abandon"]').addEventListener('click', abandon);
    root.querySelector('[data-action="prev"]')?.addEventListener('click', () => goPrev(q));
    root.querySelector('[data-action="next"]')?.addEventListener('click', () => goNext(q));
    root.querySelector('[data-action="finish"]')?.addEventListener('click', () => confirmFinish(q));
  }

  function goPrev(currentQ) {
    persistAnswer(currentQ).catch(() => {});
    state.currentIdx -= 1;
    state.questionStartAt = Date.now();
    renderTaking();
  }
  function goNext(currentQ) {
    persistAnswer(currentQ).catch(() => {});
    state.currentIdx += 1;
    state.questionStartAt = Date.now();
    renderTaking();
  }

  async function persistAnswer(q) {
    if (!state.sessionId || !q) return;
    const elapsed = Math.max(0, Math.round((Date.now() - state.questionStartAt) / 1000));
    try {
      await api('/api/exam/submit', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: state.sessionId,
          questionId: q.id,
          userAnswer: state.answers[q.id] || '',
          timeSpent: elapsed
        })
      });
    } catch (err) {
      console.warn('[exam] submit fail', err.message);
    }
  }

  function tickTimer() {
    const remaining = Math.max(0, state.timeLimitMs - (Date.now() - state.startedAt));
    const el = root.querySelector('[data-timer]');
    if (el) {
      el.textContent = formatTime(remaining);
      el.classList.toggle('exam-timer--warning', remaining < state.timeLimitMs * 0.5 && remaining >= state.timeLimitMs * 0.1);
      el.classList.toggle('exam-timer--danger', remaining < state.timeLimitMs * 0.1);
    }
    if (remaining <= 0) {
      clearInterval(state.timerId);
      autoFinish();
    }
  }

  async function abandon() {
    if (!confirm('¿Abandonar el examen? Se perderán las respuestas.')) return;
    clearInterval(state.timerId);
    clearStored(state.sessionId);
    exit();
  }

  function confirmFinish(currentQ) {
    if (!confirm('¿Seguro? No podrás modificar las respuestas después.')) return;
    persistAnswer(currentQ).then(() => finish()).catch(() => finish());
  }

  async function autoFinish() {
    // Persist current
    const q = state.questions[state.currentIdx];
    if (q) await persistAnswer(q).catch(() => {});
    finish();
  }

  async function finish() {
    clearInterval(state.timerId);
    state.screen = 'reviewing';
    root.innerHTML = `<div class="exam-screen exam-correcting">
      <h2>Corrigiendo tu examen con IA…</h2>
      <p class="muted">Puede tardar 30-60 segundos.</p>
      <div class="tutor-typing"><span></span><span></span><span></span></div>
    </div>`;
    try {
      const r = await api('/api/exam/finish', { method: 'POST', body: JSON.stringify({ sessionId: state.sessionId }) });
      state.correctionResult = r;
      clearStored(state.sessionId);
      renderReview();
    } catch (err) {
      root.innerHTML = `<div class="exam-screen"><h2>Error al corregir</h2>
        <p class="muted">${escapeHtml(err.message || '')}</p>
        <button class="btn" data-action="exit">Volver</button></div>`;
      root.querySelector('[data-action="exit"]').addEventListener('click', exit);
    }
  }

  // ── Pantalla 3: revisión ────────────────────────────────
  function renderReview(fromHistory = false) {
    const r = state.correctionResult;
    const verdict = r.verdict || 'sin_evaluar';
    const verdictText = verdictNarrative(verdict, r.score);
    const verdictIcon = verdictIconChar(verdict);

    root.innerHTML = `
      <div class="exam-screen exam-review">
        <header class="exam-screen__head">
          <button class="btn btn--sm" data-action="exit">← Volver</button>
          <h1>${fromHistory ? 'Detalle del simulacro' : 'Resultados'}</h1>
          <span></span>
        </header>
        <div class="exam-score-card exam-score-card--${verdict}">
          <div class="exam-score-card__icon">${verdictIcon}</div>
          <div class="exam-score-card__value">${formatScore(r.score)}<span class="dim"> / 10</span></div>
          <div class="exam-score-card__verdict">${verdictLabel(verdict).toUpperCase()}</div>
          <div class="exam-score-card__narrative">${escapeHtml(verdictText)}</div>
        </div>

        <div class="exam-questions">
          ${(r.answers || []).map((a, i) => buildAnswerHtml(i, a)).join('')}
        </div>

        ${r.conceptsToReview?.length ? `
          <section class="exam-review-section">
            <h3>Conceptos a repasar</h3>
            <div class="subject-tags">
              ${r.conceptsToReview.map((c) => `<span class="subject-tag">${escapeHtml(c)}</span>`).join('')}
            </div>
          </section>` : ''}

        <div class="exam-review-actions">
          <button class="btn" data-action="exit">Volver al inicio</button>
          ${!fromHistory ? '<button class="btn" data-action="another">Hacer otro simulacro</button>' : ''}
          ${r.conceptsToReview?.length ? '<button class="btn btn--primary" data-action="ask-tutor">Pedir explicación al tutor</button>' : ''}
        </div>
      </div>
    `;

    renderMath(root);

    root.querySelectorAll('.exam-answer-toggle').forEach((btn) => {
      btn.addEventListener('click', () => btn.parentElement.classList.toggle('exam-answer-block--open'));
    });
    root.querySelectorAll('[data-action="exit"]').forEach((b) => b.addEventListener('click', exit));
    root.querySelector('[data-action="another"]')?.addEventListener('click', renderSelect);
    root.querySelector('[data-action="ask-tutor"]')?.addEventListener('click', () => {
      const concepts = (r.conceptsToReview || []).join(', ');
      const message = `Acabo de hacer un simulacro y he fallado en: ${concepts}. Explícame mis errores y dame un ejercicio fácil de cada uno para recuperar el concepto.`;
      exit();
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('open-tutor-with-context', { detail: { concept: concepts, message } }));
      }, 100);
    });
  }

  function buildAnswerHtml(idx, a) {
    const corr = a.correction || {};
    const earned = Number(corr.total_earned ?? a.score ?? 0);
    const max = Number(corr.total_max ?? a.points ?? 0);
    const stepsHtml = (corr.steps || []).map((s) => {
      const icon = s.status === 'correct' ? '✓' : s.status === 'partial' ? '◐' : '✗';
      const cls = s.status === 'correct' ? 'good' : s.status === 'partial' ? 'partial' : 'bad';
      return `
        <div class="exam-step exam-step--${cls}">
          <div class="exam-step__title">${icon} <strong>Paso ${s.n || ''}</strong> ${s.title ? '— ' + escapeHtml(s.title) : ''}
            <span class="dim">(${formatScore(s.earned)} / ${formatScore(s.max)})</span>
          </div>
          <div class="exam-step__feedback">${escapeHtml(s.feedback || '')}</div>
        </div>
      `;
    }).join('');

    return `
      <article class="exam-answer-block exam-answer-block--open">
        <button type="button" class="exam-answer-toggle">
          <span>Ejercicio ${idx + 1} — ${escapeHtml(a.concept || '')}</span>
          <span><strong>${formatScore(earned)}</strong> / ${formatScore(max)}</span>
        </button>
        <div class="exam-answer-body">
          <div class="exam-block exam-block--statement">
            <strong>Enunciado</strong>
            <div>${escapeHtml(a.statement || '')}</div>
          </div>
          <div class="exam-block exam-block--user">
            <strong>Tu respuesta</strong>
            <pre>${escapeHtml(a.userAnswer || '[en blanco]')}</pre>
          </div>
          <div class="exam-block exam-block--correction">
            <strong>Corrección paso a paso</strong>
            ${stepsHtml || '<p class="muted">Sin desglose disponible.</p>'}
            ${corr.summary ? `<div class="exam-step__summary">${escapeHtml(corr.summary)}</div>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function exit() {
    clearInterval(state.timerId);
    try { root.remove(); } catch {}
    onExit?.();
  }

  return {
    unmount() {
      clearInterval(state.timerId);
      try { root.remove(); } catch {}
    }
  };
}

// ── helpers ──────────────────────────────────────────────────

const STORAGE_PREFIX = 'exam-answers-';
function readStored(sessionId) {
  if (!sessionId) return null;
  try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + sessionId) || 'null'); }
  catch { return null; }
}
function writeStored(sessionId, answers) {
  if (!sessionId) return;
  try { localStorage.setItem(STORAGE_PREFIX + sessionId, JSON.stringify(answers)); } catch {}
}
function clearStored(sessionId) {
  if (!sessionId) return;
  try { localStorage.removeItem(STORAGE_PREFIX + sessionId); } catch {}
}

function formatTime(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatScore(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toFixed(2);
}

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function verdictLabel(v) {
  return ({ aprobado: 'Aprobado', notable: 'Notable', sobresaliente: 'Sobresaliente', suspenso: 'Suspenso' })[v] || 'Sin evaluar';
}

function verdictIconChar(v) {
  return ({ aprobado: '✓', notable: '✓✓', sobresaliente: '★', suspenso: '✗' })[v] || '·';
}

function verdictNarrative(verdict, score) {
  const s = Number(score);
  if (verdict === 'sobresaliente') return `Excelente. En el examen real tu nota sería de sobresaliente.`;
  if (verdict === 'notable') return `Buen trabajo. En el examen real esto sería un notable.`;
  if (verdict === 'aprobado') {
    if (s >= 6) return `Aprobado holgado. En el examen real esto sería un aprobado claro.`;
    return `Aprobado raspado. En el examen real estarías cerca del límite.`;
  }
  return `En el examen real esto sería un suspenso. Repasa los conceptos marcados antes del examen real.`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
