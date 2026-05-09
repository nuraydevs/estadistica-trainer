import { getExerciseStatus, setExerciseStatus, resetExercise } from '../utils/storage.js';
import { renderMath } from '@portal/lib/math-render.js';

const RESULT_EVENT = 'estadistica-exercise-result';
const startTimes = new Map(); // exercise.id → timestamp
const tickerByContainer = new WeakMap();

function dispatchResult(exercise, status, result) {
  try {
    const concept = exercise.types?.[exercise.correctType] || exercise.concept || 'general';
    const startedAt = startTimes.get(exercise.id);
    const elapsed = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : 0;
    document.dispatchEvent(new CustomEvent(RESULT_EVENT, {
      detail: {
        exercise_id: exercise.id,
        concept,
        result,
        hints_used: status.hintsUsed || 0,
        time_spent_seconds: elapsed
      }
    }));
    startTimes.delete(exercise.id);
  } catch {}
}

export function render(container, { exercise, index, state, onChange }) {
  // Limpia ticker previo si lo había (rerender)
  const prev = tickerByContainer.get(container);
  if (prev) { clearInterval(prev); tickerByContainer.delete(container); }

  container.innerHTML = '';
  const status = getExerciseStatus(state, exercise.id);

  if (status.status === 'pending' && !startTimes.has(exercise.id)) {
    startTimes.set(exercise.id, Date.now());
  }

  const card = document.createElement('article');
  card.className = 'exercise-card';
  card.dataset.status = status.status;

  card.appendChild(buildHeader(exercise, index, status));
  card.appendChild(buildStatement(exercise));

  if (status.status === 'pending') {
    card.appendChild(buildTypeStep(exercise, state, status, onChange));
    if (typeHasBeenSolved(status, exercise)) {
      card.appendChild(buildAnswerStep(exercise, state, status, onChange));
    }
  } else {
    card.appendChild(buildResultBanner(exercise, status));
    card.appendChild(buildSolution(exercise, status));
    card.appendChild(buildResetRow(exercise, state, onChange));
  }

  container.appendChild(card);

  // KaTeX render para enunciado, pistas, solución
  renderMath(container);

  // Timer sutil arriba a la derecha mientras está pending
  if (status.status === 'pending') {
    const timerId = setInterval(() => {
      const start = startTimes.get(exercise.id);
      if (!start) return;
      const el = container.querySelector('[data-timer]');
      if (el) el.textContent = formatElapsed(Date.now() - start);
    }, 1000);
    tickerByContainer.set(container, timerId);
  }
}

// ── Header ───────────────────────────────────────────────────

function buildHeader(exercise, index, status) {
  const head = document.createElement('header');
  head.className = 'exercise-card__head';

  const concept = exercise.types?.[exercise.correctType] || exercise.concept || '';
  const statusBadge = status.status === 'done'
    ? '<span class="status-badge status-badge--done">✓ Resuelto</span>'
    : status.status === 'failed'
      ? '<span class="status-badge status-badge--failed">✗ Fallado</span>'
      : '<span class="status-badge status-badge--pending">Pendiente</span>';

  const startedAt = startTimes.get(exercise.id);
  const timerHtml = status.status === 'pending'
    ? `<span class="exercise-timer dim" data-timer>${formatElapsed(startedAt ? Date.now() - startedAt : 0)}</span>`
    : '';

  head.innerHTML = `
    <div class="exercise-card__title">
      <h3>Ejercicio ${index + 1}${concept ? ' · ' + escapeHtml(concept) : ''}</h3>
      <div class="exercise-card__source dim">${escapeHtml(exercise.sourceNote || '')}</div>
    </div>
    <div class="exercise-card__meta">
      ${timerHtml}
      ${statusBadge}
    </div>
  `;
  return head;
}

// ── Enunciado ────────────────────────────────────────────────

function buildStatement(exercise) {
  const section = document.createElement('section');
  section.className = 'exercise-statement';

  const parts = splitStatement(exercise.statement);
  parts.forEach((part) => {
    const m = part.match(/^\(([a-z])\)\s*(.+)$/i);
    if (m) {
      const wrap = document.createElement('div');
      wrap.className = 'exercise-statement__part';
      wrap.innerHTML = `<span class="exercise-statement__label">${m[1]})</span> ${escapeHtml(m[2])}`;
      section.appendChild(wrap);
    } else {
      const p = document.createElement('p');
      p.textContent = part;
      section.appendChild(p);
    }
  });
  return section;
}

// ── Paso 1: tipo ─────────────────────────────────────────────

function buildTypeStep(exercise, state, status, onChange) {
  const wrap = document.createElement('section');
  wrap.className = 'exercise-step exercise-step--task';

  wrap.innerHTML = `
    <div class="step-number">1</div>
    <div class="step-body">
      <h4 class="step-title">¿Qué tipo de ejercicio es?</h4>
      <div class="type-grid"></div>
      <div class="step-feedback"></div>
    </div>
  `;

  const grid = wrap.querySelector('.type-grid');
  const fbHost = wrap.querySelector('.step-feedback');
  const solved = typeHasBeenSolved(status, exercise);

  exercise.types.forEach((typeLabel, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'type-btn';
    btn.textContent = typeLabel;

    const tried = status.typeAttempts.includes(idx);
    const isCorrect = idx === exercise.correctType;

    if (tried && isCorrect) btn.classList.add('type-btn--correct');
    else if (tried) btn.classList.add('type-btn--wrong');
    if (solved && !isCorrect) btn.disabled = true;

    btn.addEventListener('click', () => {
      const attempts = status.typeAttempts.includes(idx)
        ? status.typeAttempts
        : [...status.typeAttempts, idx];
      setExerciseStatus(state, exercise.id, { typeAttempts: attempts });
      onChange();
    });

    grid.appendChild(btn);
  });

  if (solved) {
    fbHost.innerHTML = `<div class="feedback feedback--success"><strong>✓ Correcto.</strong> ${escapeHtml(exercise.typeExplanation || '')}</div>`;
  } else if (status.typeAttempts.length > 0) {
    fbHost.innerHTML = `<div class="feedback feedback--wrong"><strong>✗ No es ese tipo.</strong> Pista: ${escapeHtml(exercise.hints[0] || '')}</div>`;
  }

  return wrap;
}

// ── Paso 2: respuesta ────────────────────────────────────────

function buildAnswerStep(exercise, state, status, onChange) {
  const wrap = document.createElement('section');
  wrap.className = 'exercise-step exercise-step--task';
  wrap.innerHTML = `
    <div class="step-number">2</div>
    <div class="step-body">
      <h4 class="step-title">Resuelve</h4>
      <div class="answer-host"></div>
      <div class="exercise-actions"></div>
      <div class="hints-host"></div>
    </div>
  `;

  const answerHost = wrap.querySelector('.answer-host');
  const actionsHost = wrap.querySelector('.exercise-actions');
  const hintsHost = wrap.querySelector('.hints-host');

  if (exercise.answer !== null) {
    buildNumericAnswer(answerHost, actionsHost, exercise, state, status, onChange);
  } else {
    buildTextAnswer(answerHost, actionsHost, exercise, state, onChange);
  }

  // Botones de pista y solución agrupados con la acción primaria
  buildHintsRow(actionsHost, hintsHost, exercise, state, status, onChange);
  buildShowSolutionBtn(actionsHost, exercise, state, onChange);

  return wrap;
}

function buildNumericAnswer(host, actionsHost, exercise, state, status, onChange) {
  host.innerHTML = `
    <label class="answer-label">
      <span class="answer-label__text">Tu respuesta:</span>
      <input type="number" step="any" class="answer-input" placeholder="Número" />
    </label>
  `;
  const input = host.querySelector('input');
  const lastAttempt = status.answerAttempts[status.answerAttempts.length - 1];
  if (typeof lastAttempt === 'number') input.value = lastAttempt;

  const checkBtn = document.createElement('button');
  checkBtn.type = 'button';
  checkBtn.className = 'btn btn--primary';
  checkBtn.textContent = 'Comprobar';
  checkBtn.addEventListener('click', () => {
    const val = parseFloat(input.value);
    if (Number.isNaN(val)) return;
    const attempts = [...status.answerAttempts, val];
    if (Math.abs(val - exercise.answer) <= exercise.tolerance) {
      const next = { ...status, answerAttempts: attempts, status: 'done' };
      setExerciseStatus(state, exercise.id, { answerAttempts: attempts, status: 'done' });
      dispatchResult(exercise, next, 'correct');
    } else {
      setExerciseStatus(state, exercise.id, { answerAttempts: attempts });
    }
    onChange();
  });
  actionsHost.appendChild(checkBtn);

  // Mostrar feedback inline si hubo intentos
  if (typeof lastAttempt === 'number' && Math.abs(lastAttempt - exercise.answer) > exercise.tolerance) {
    const fb = document.createElement('div');
    fb.className = 'feedback feedback--wrong';
    fb.textContent = 'Repasa los pasos y vuelve a probar.';
    host.appendChild(fb);
  }
}

function buildTextAnswer(host, actionsHost, exercise, state, onChange) {
  host.innerHTML = `
    <p class="muted answer-label__text">Razonamiento esperado:</p>
    <p>${escapeHtml(exercise.textAnswer || '')}</p>
  `;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary';
  btn.textContent = 'Lo tengo';
  btn.addEventListener('click', () => {
    const status = getExerciseStatus(state, exercise.id);
    setExerciseStatus(state, exercise.id, { status: 'done' });
    dispatchResult(exercise, status, 'correct');
    onChange();
  });
  actionsHost.appendChild(btn);
}

function buildHintsRow(actionsHost, hintsHost, exercise, state, status, onChange) {
  const used = status.hintsUsed;
  const remaining = (exercise.hints?.length || 0) - used;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--ghost';
  btn.textContent = remaining > 0 ? `Pista (${remaining})` : 'Sin más pistas';
  btn.disabled = remaining <= 0;
  btn.addEventListener('click', () => {
    setExerciseStatus(state, exercise.id, { hintsUsed: used + 1 });
    onChange();
  });
  actionsHost.appendChild(btn);

  // Pintar pistas usadas en cards separadas
  for (let i = 0; i < used; i++) {
    const hint = document.createElement('div');
    hint.className = 'exercise-hint';
    hint.innerHTML = `<span class="exercise-hint__icon">💡</span><div><strong>Pista ${i + 1}</strong><br>${escapeHtml(exercise.hints[i] || '')}</div>`;
    hintsHost.appendChild(hint);
  }
}

function buildShowSolutionBtn(actionsHost, exercise, state, onChange) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--danger';
  btn.textContent = 'Ver solución';
  btn.addEventListener('click', () => {
    const status = getExerciseStatus(state, exercise.id);
    setExerciseStatus(state, exercise.id, { status: 'failed', solutionShown: true });
    dispatchResult(exercise, status, 'gave_up');
    onChange();
  });
  actionsHost.appendChild(btn);
}

// ── Resultado banner + Solución ──────────────────────────────

function buildResultBanner(exercise, status) {
  const banner = document.createElement('div');
  if (status.status === 'done') {
    banner.className = 'result-banner result-banner--ok';
    banner.innerHTML = `<span>✓</span><strong>CORRECTO</strong>`;
  } else {
    banner.className = 'result-banner result-banner--fail';
    banner.innerHTML = `<span>✗</span><strong>${status.solutionShown ? 'SIN RESOLVER' : 'INCORRECTO'}</strong>`;
  }
  return banner;
}

function buildSolution(exercise, status) {
  const wrap = document.createElement('section');
  wrap.className = 'exercise-solution';

  const header = document.createElement('h4');
  header.className = 'exercise-solution__title';
  header.textContent = 'SOLUCIÓN PASO A PASO';
  wrap.appendChild(header);

  exercise.solution.forEach((step, idx) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'exercise-step exercise-step--solution';
    stepEl.innerHTML = `
      <div class="step-number">${idx + 1}</div>
      <div class="step-body">
        <h4 class="step-title">${stepTitleFromHtml(step)}</h4>
        <div class="step-content">${step}</div>
      </div>
    `;
    wrap.appendChild(stepEl);
  });

  if (exercise.answer !== null) {
    const final = document.createElement('div');
    final.className = `exercise-result-final${status.status === 'failed' ? ' failed' : ''}`;
    final.innerHTML = `
      <div class="exercise-result-final__label">RESULTADO</div>
      <div class="exercise-result-final__value">${exercise.answer}</div>
    `;
    wrap.appendChild(final);
  }

  return wrap;
}

function buildResetRow(exercise, state, onChange) {
  const row = document.createElement('div');
  row.className = 'exercise-actions exercise-actions--reset';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--ghost';
  btn.textContent = 'Reintentar desde cero';
  btn.addEventListener('click', () => {
    resetExercise(state, exercise.id);
    startTimes.delete(exercise.id);
    onChange();
  });
  row.appendChild(btn);
  return row;
}

// ── helpers ──────────────────────────────────────────────────

function splitStatement(text) {
  return String(text || '')
    .split(/(?=\([a-z]\)\s)/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function stepTitleFromHtml(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentence = text.split(/[.:]/)[0];
  return sentence.length > 70 ? sentence.slice(0, 67) + '…' : sentence || 'Resolver';
}

function typeHasBeenSolved(status, exercise) {
  return status.typeAttempts.includes(exercise.correctType);
}

function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `⏱ ${m}:${String(s).padStart(2, '0')}`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
