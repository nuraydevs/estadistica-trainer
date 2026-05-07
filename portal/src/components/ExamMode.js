// Modo examen: 3 pantallas (selección → activo → corrección).
// Se monta como overlay full-screen sobre la asignatura.

import { EXAM_PRESETS, startExamSession, abandonExamSession, correctExam, daysUntilExam } from '../lib/exam-mode.js';
import { supabase } from '../lib/supabase.js';

export function mountExamMode(host, { subject, profile, examDate, getQuestions, onExit }) {
  const root = document.createElement('div');
  root.className = 'exam-overlay';
  host.appendChild(root);

  const state = {
    screen: 'select',           // 'select' | 'taking' | 'reviewing'
    examType: null,
    questions: [],
    answers: {},                // questionId -> text
    currentIdx: 0,
    examSessionId: null,
    timeLimitMs: 0,
    startedAt: 0,
    timerId: null,
    correctionResult: null
  };

  const days = daysUntilExam(examDate);
  const panicActive = days != null && days >= 0 && days <= 7;

  renderSelect();

  // ── Pantalla 1: selección ─────────────────────────────────
  function renderSelect() {
    state.screen = 'select';
    root.innerHTML = `
      <div class="exam-screen exam-select">
        <header class="exam-screen__head">
          <button class="btn btn--sm" data-action="exit">← Volver</button>
          <h1>Modo examen — ${escapeHtml(subject.name)}</h1>
          ${days != null ? `<span class="muted">Examen en ${days} días</span>` : '<span></span>'}
        </header>
        <div class="exam-cards">
          ${cardHtml('completo', false)}
          ${cardHtml('parcial', false)}
          ${cardHtml('panico', panicActive)}
        </div>
      </div>
    `;
    root.querySelector('[data-action="exit"]').addEventListener('click', exit);
    root.querySelectorAll('.exam-card').forEach((card) => {
      card.addEventListener('click', () => begin(card.dataset.type));
    });
  }

  function cardHtml(type, highlighted) {
    const preset = EXAM_PRESETS[type];
    return `
      <button type="button" class="exam-card${highlighted ? ' exam-card--highlight' : ''}" data-type="${type}">
        <h3>${preset.label}${highlighted ? ' ⚡' : ''}</h3>
        <p class="muted">${preset.description}</p>
        <div class="exam-card__meta">
          <span>${preset.minutes} min</span>
          <span>${preset.count} ejercicios</span>
        </div>
      </button>
    `;
  }

  // ── Pantalla 2: examen en marcha ──────────────────────────
  async function begin(examType) {
    state.examType = examType;
    state.screen = 'taking';
    root.innerHTML = `<div class="exam-screen"><p class="muted">Preparando examen…</p></div>`;

    try {
      state.questions = await getQuestions(examType, profile);
    } catch (err) {
      console.error('[exam] getQuestions', err);
      root.innerHTML = `<div class="exam-screen"><p>No se pudo cargar el examen.</p>
        <button class="btn" data-action="back">Volver</button></div>`;
      root.querySelector('[data-action="back"]').addEventListener('click', renderSelect);
      return;
    }

    if (!state.questions?.length) {
      root.innerHTML = `<div class="exam-screen"><p>Esta asignatura aún no tiene banco de ejercicios.</p>
        <button class="btn" data-action="back">Volver</button></div>`;
      root.querySelector('[data-action="back"]').addEventListener('click', renderSelect);
      return;
    }

    const preset = EXAM_PRESETS[examType];
    state.timeLimitMs = preset.minutes * 60 * 1000;
    state.startedAt = Date.now();
    state.questions.forEach((q) => { state.answers[q.questionId] = ''; });
    state.currentIdx = 0;

    try {
      let userId = profile?.user_id || profile?.id || null;
      if (!userId) {
        const { data } = await supabase.auth.getSession();
        userId = data?.session?.user?.id;
      }
      state.examSessionId = await startExamSession({
        userId,
        subjectSlug: subject.slug,
        examType,
        timeLimitMinutes: preset.minutes
      });
    } catch (err) {
      console.warn('[exam] startExamSession', err);
    }

    renderTaking();
    state.timerId = setInterval(tickTimer, 1000);
  }

  function renderTaking() {
    const q = state.questions[state.currentIdx];
    const remaining = Math.max(0, state.timeLimitMs - (Date.now() - state.startedAt));

    root.innerHTML = `
      <div class="exam-screen exam-taking">
        <header class="exam-screen__head">
          <span class="exam-progress">Pregunta ${state.currentIdx + 1} de ${state.questions.length}</span>
          <span class="exam-timer" data-timer>${formatTime(remaining)}</span>
          <button class="btn btn--sm btn--danger" data-action="abandon">Abandonar</button>
        </header>
        <div class="exam-question">
          <div class="exam-question__statement">${escapeHtml(q.statement)}</div>
          <textarea class="exam-answer" placeholder="Escribe aquí tu resolución paso a paso…"></textarea>
        </div>
        <footer class="exam-screen__foot">
          ${state.currentIdx > 0 ? '<button class="btn" data-action="prev">← Anterior</button>' : '<span></span>'}
          ${state.currentIdx < state.questions.length - 1
            ? '<button class="btn btn--primary" data-action="next">Siguiente pregunta →</button>'
            : '<button class="btn btn--primary" data-action="finish">Terminar examen</button>'}
        </footer>
      </div>
    `;

    const ta = root.querySelector('textarea');
    ta.value = state.answers[q.questionId] || '';
    ta.addEventListener('input', () => { state.answers[q.questionId] = ta.value; });
    setTimeout(() => ta.focus(), 30);

    root.querySelector('[data-action="abandon"]').addEventListener('click', abandon);
    root.querySelector('[data-action="prev"]')?.addEventListener('click', () => { state.currentIdx--; renderTaking(); });
    root.querySelector('[data-action="next"]')?.addEventListener('click', () => { state.currentIdx++; renderTaking(); });
    root.querySelector('[data-action="finish"]')?.addEventListener('click', finish);
  }

  function tickTimer() {
    const remaining = Math.max(0, state.timeLimitMs - (Date.now() - state.startedAt));
    const el = root.querySelector('[data-timer]');
    if (el) el.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(state.timerId);
      finish();
    }
  }

  async function abandon() {
    if (!confirm('¿Abandonar el examen? Se perderá lo escrito.')) return;
    clearInterval(state.timerId);
    if (state.examSessionId) await abandonExamSession(state.examSessionId);
    exit();
  }

  async function finish() {
    clearInterval(state.timerId);
    state.screen = 'reviewing';
    root.innerHTML = `<div class="exam-screen exam-correcting">
      <h2>Corrigiendo tu examen con IA…</h2>
      <p class="muted">Puede tardar 15-30 segundos.</p>
      <div class="tutor-typing"><span></span><span></span><span></span></div>
    </div>`;

    try {
      const payload = {
        examSessionId: state.examSessionId,
        answers: state.questions.map((q) => ({
          questionId: q.questionId,
          question: q.statement,
          userAnswer: state.answers[q.questionId] || '',
          maxScore: q.maxScore || 2.5
        }))
      };
      state.correctionResult = await correctExam(payload);
      renderReview();
    } catch (err) {
      root.innerHTML = `<div class="exam-screen"><h2>Error al corregir</h2>
        <p>${escapeHtml(err.message || '')}</p>
        <button class="btn" data-action="exit">Volver</button></div>`;
      root.querySelector('[data-action="exit"]').addEventListener('click', exit);
    }
  }

  // ── Pantalla 3: revisión ──────────────────────────────────
  function renderReview() {
    const result = state.correctionResult;
    const verdict = result.verdict || 'sin_evaluar';
    const verdictText = ({
      sobresaliente: 'En el examen real esto sería SOBRESALIENTE.',
      notable: 'En el examen real esto sería NOTABLE.',
      aprobado: 'En el examen real esto sería APROBADO.',
      suspenso: 'En el examen real esto sería SUSPENSO.',
      sin_evaluar: ''
    })[verdict];
    const verdictClass = verdict === 'suspenso' ? 'exam-verdict--bad' : 'exam-verdict--good';

    const corrections = result.corrections || [];
    const byId = new Map(corrections.map((c) => [c.questionId, c]));

    root.innerHTML = `
      <div class="exam-screen exam-review">
        <header class="exam-screen__head">
          <button class="btn btn--sm" data-action="exit">← Volver</button>
          <h1>Corrección</h1>
          <span></span>
        </header>
        <div class="exam-score">
          <div class="exam-score__big">${formatScore(result.score)}<span class="dim"> / 10</span></div>
          <div class="exam-verdict ${verdictClass}">${verdictText}</div>
        </div>
        <div class="exam-questions">
          ${state.questions.map((q, i) => buildCorrectionHtml(i, q, byId.get(q.questionId), state.answers[q.questionId])).join('')}
        </div>
        ${result.conceptsToReview?.length ? `
          <section class="exam-review-section">
            <h3>Conceptos a repasar</h3>
            <div class="subject-tags">
              ${result.conceptsToReview.map((c) => `<span class="subject-tag">${escapeHtml(c)}</span>`).join('')}
            </div>
            <button class="btn btn--primary" data-action="practice" style="margin-top: var(--space-3)">
              Practicar estos conceptos con el tutor
            </button>
          </section>` : ''}
      </div>
    `;

    root.querySelector('[data-action="exit"]').addEventListener('click', exit);
    root.querySelector('[data-action="practice"]')?.addEventListener('click', () => {
      const concepts = result.conceptsToReview || [];
      // Cierra el examen y abre el tutor con el primer concepto
      exit();
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('open-tutor-with-context', {
          detail: { concept: concepts.join(', ') }
        }));
      }, 100);
    });
  }

  function buildCorrectionHtml(idx, q, corr, userAnswer) {
    if (!corr) return '';
    const stepsHtml = (corr.steps || []).map((s) => {
      const icon = s.status === 'correct' ? '✓' : s.status === 'partial' ? '◐' : '✗';
      const cls = s.status === 'correct' ? 'good' : s.status === 'partial' ? 'partial' : 'bad';
      return `
        <div class="exam-step exam-step--${cls}">
          <div class="exam-step__title">
            ${icon} <strong>Paso ${s.step}</strong> — ${escapeHtml(s.description || '')}
            <span class="dim">(${formatScore(s.points_earned)} / ${formatScore(s.points_max)})</span>
          </div>
          <div class="exam-step__feedback">${escapeHtml(s.feedback || '')}</div>
        </div>
      `;
    }).join('');

    return `
      <article class="exam-question-review">
        <h3>Ejercicio ${idx + 1}</h3>
        <div class="exam-block exam-block--statement">
          <strong>Enunciado:</strong>
          <div>${escapeHtml(q.statement)}</div>
        </div>
        <div class="exam-block exam-block--user">
          <strong>Tu respuesta:</strong>
          <pre>${escapeHtml(userAnswer || '[en blanco]')}</pre>
        </div>
        <div class="exam-block exam-block--correction">
          <strong>Corrección:</strong>
          ${stepsHtml || '<p class="muted">Sin desglose disponible.</p>'}
          <div class="exam-step__summary">${escapeHtml(corr.summary || '')}</div>
          <div class="exam-step__total">Puntuación: <strong>${formatScore(corr.total_earned)} / ${formatScore(corr.total_max)}</strong></div>
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

function formatTime(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatScore(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toFixed(2);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
