import { getExerciseStatus, setExerciseStatus, resetExercise } from '../utils/storage.js';

const RESULT_EVENT = 'estadistica-exercise-result';
const startTimes = new Map(); // id -> timestamp

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
  container.innerHTML = '';
  const status = getExerciseStatus(state, exercise.id);

  // Si el ejercicio está pendiente y no tenemos start time, inícialo
  if (status.status === 'pending' && !startTimes.has(exercise.id)) {
    startTimes.set(exercise.id, Date.now());
  }

  const card = document.createElement('article');
  card.className = 'exercise';
  card.dataset.status = status.status;

  card.appendChild(buildHeader(exercise, index, status));
  card.appendChild(buildStatement(exercise));

  if (status.status === 'pending') {
    card.appendChild(buildTypeStep(exercise, state, status, onChange));
    if (typeHasBeenSolved(status, exercise)) {
      card.appendChild(buildAnswerStep(exercise, state, status, onChange));
    }
  } else {
    card.appendChild(buildSolution(exercise, status));
    card.appendChild(buildResetRow(exercise, state, onChange));
  }

  container.appendChild(card);
}

function buildHeader(exercise, index, status) {
  const head = document.createElement('header');
  head.className = 'exercise__head';

  const left = document.createElement('div');
  left.className = 'exercise__title';
  left.innerHTML = `
    <strong>Ejercicio ${index + 1}</strong>
    <span class="exercise__source">${exercise.sourceNote}</span>
  `;

  const badge = document.createElement('span');
  badge.className = 'status-badge status-badge--' + status.status;
  badge.textContent = labelForStatus(status.status);

  head.appendChild(left);
  head.appendChild(badge);
  return head;
}

function buildStatement(exercise) {
  const section = document.createElement('section');
  section.className = 'exercise-section';
  section.innerHTML = '<div class="section-label">Enunciado</div>';

  const stmt = document.createElement('div');
  stmt.className = 'statement statement--formatted';
  splitStatement(exercise.statement).forEach((part) => {
    const p = document.createElement('p');
    p.textContent = part;
    stmt.appendChild(p);
  });

  section.appendChild(stmt);
  return section;
}

function buildTypeStep(exercise, state, status, onChange) {
  const wrap = document.createElement('section');
  wrap.className = 'step';
  const title = document.createElement('h4');
  title.textContent = 'Paso 1 · ¿Qué tipo de ejercicio es?';
  wrap.appendChild(title);

  const row = document.createElement('div');
  row.className = 'type-row';

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

    row.appendChild(btn);
  });

  wrap.appendChild(row);

  if (solved) {
    const ok = document.createElement('p');
    ok.className = 'feedback feedback--success';
    ok.innerHTML = `<strong>✓ Correcto.</strong> ${exercise.typeExplanation}`;
    wrap.appendChild(ok);
  } else if (status.typeAttempts.length > 0) {
    const fail = document.createElement('p');
    fail.className = 'feedback feedback--wrong';
    fail.innerHTML = `<strong>✗ No es ese tipo.</strong> Pista: ${exercise.hints[0]}`;
    wrap.appendChild(fail);
  }

  return wrap;
}

function buildAnswerStep(exercise, state, status, onChange) {
  const wrap = document.createElement('section');
  wrap.className = 'step';
  const title = document.createElement('h4');
  title.textContent = 'Paso 2 · Resuelve';
  wrap.appendChild(title);

  if (exercise.answer !== null) {
    wrap.appendChild(buildNumericAnswer(exercise, state, status, onChange));
  } else {
    wrap.appendChild(buildTextAnswer(exercise, state, onChange));
  }

  wrap.appendChild(buildHintsBlock(exercise, state, status, onChange));
  wrap.appendChild(buildShowSolutionRow(exercise, state, onChange));

  return wrap;
}

function buildNumericAnswer(exercise, state, status, onChange) {
  const row = document.createElement('div');
  row.className = 'answer-row';

  const input = document.createElement('input');
  input.type = 'number';
  input.step = 'any';
  input.placeholder = 'Tu respuesta numérica';
  input.className = 'answer-input';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary';
  btn.textContent = 'Comprobar';

  const fb = document.createElement('p');
  fb.className = 'feedback';

  const lastAttempt = status.answerAttempts[status.answerAttempts.length - 1];
  if (typeof lastAttempt === 'number') {
    input.value = lastAttempt;
    if (Math.abs(lastAttempt - exercise.answer) <= exercise.tolerance) {
      fb.classList.add('feedback--success');
      fb.innerHTML = `<strong>✓ Correcto.</strong> Pulsa "Comprobar" otra vez para confirmar y marcar como resuelto.`;
    } else {
      fb.classList.add('feedback--wrong');
      fb.textContent = 'Casi. Repasa los pasos y vuelve a probar.';
    }
  }

  btn.addEventListener('click', () => {
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

  row.appendChild(input);
  row.appendChild(btn);

  const wrap = document.createDocumentFragment();
  wrap.appendChild(row);
  if (fb.textContent || fb.innerHTML) wrap.appendChild(fb);
  return wrap;
}

function buildTextAnswer(exercise, state, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'text-answer';

  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = 'Razonamiento esperado:';
  wrap.appendChild(p);

  const txt = document.createElement('p');
  txt.textContent = exercise.textAnswer || '';
  wrap.appendChild(txt);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary';
  btn.textContent = 'Lo tengo';
  btn.addEventListener('click', () => {
    setExerciseStatus(state, exercise.id, { status: 'done' });
    dispatchResult(exercise, status, 'correct');
    onChange();
  });
  wrap.appendChild(btn);

  return wrap;
}

function buildHintsBlock(exercise, state, status, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'hints';

  const used = status.hintsUsed;
  const remaining = exercise.hints.length - used;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--ghost';
  btn.textContent = remaining > 0 ? `Pista (${remaining} restantes)` : 'Sin más pistas';
  btn.disabled = remaining <= 0;
  btn.addEventListener('click', () => {
    setExerciseStatus(state, exercise.id, { hintsUsed: used + 1 });
    onChange();
  });
  wrap.appendChild(btn);

  if (used > 0) {
    const list = document.createElement('ol');
    list.className = 'hint-list';
    for (let i = 0; i < used; i++) {
      const li = document.createElement('li');
      li.textContent = exercise.hints[i];
      list.appendChild(li);
    }
    wrap.appendChild(list);
  }

  return wrap;
}

function buildShowSolutionRow(exercise, state, onChange) {
  const row = document.createElement('div');
  row.className = 'show-solution-row';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--danger-ghost';
  btn.textContent = 'Ver solución';
  btn.addEventListener('click', () => {
    const status = getExerciseStatus(state, exercise.id);
    setExerciseStatus(state, exercise.id, {
      status: 'failed',
      solutionShown: true
    });
    dispatchResult(exercise, status, 'gave_up');
    onChange();
  });
  row.appendChild(btn);
  return row;
}

function buildSolution(exercise, status) {
  const wrap = document.createElement('section');
  wrap.className = 'step solution exercise-section';
  const label = document.createElement('div');
  label.className = 'section-label';
  label.textContent = 'Solución paso a paso';
  wrap.appendChild(label);

  const ol = document.createElement('ol');
  ol.className = 'solution-steps';
  exercise.solution.forEach((step, index) => {
    const li = document.createElement('li');
    li.className = 'solution-step';
    li.innerHTML = `
      <div class="solution-step__title">Paso ${index + 1}: ${stepTitleFromHtml(step)}</div>
      <div class="solution-step__content">${step}</div>
    `;
    ol.appendChild(li);
  });
  wrap.appendChild(ol);

  if (exercise.answer !== null) {
    const ans = document.createElement('p');
    ans.className = 'final-answer final-answer--large';
    ans.innerHTML = `<strong>Respuesta:</strong> <span>${exercise.answer}</span>`;
    wrap.appendChild(ans);
  }

  return wrap;
}

function splitStatement(text) {
  return text
    .split(/(?=\([a-z]\)\s)/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function stepTitleFromHtml(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentence = text.split(/[.:]/)[0];
  return sentence.length > 70 ? sentence.slice(0, 67) + '...' : sentence || 'Resolver';
}

function buildResetRow(exercise, state, onChange) {
  const row = document.createElement('div');
  row.className = 'reset-row';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--ghost';
  btn.textContent = 'Reintentar desde cero';
  btn.addEventListener('click', () => {
    resetExercise(state, exercise.id);
    onChange();
  });
  row.appendChild(btn);
  return row;
}

function typeHasBeenSolved(status, exercise) {
  return status.typeAttempts.includes(exercise.correctType);
}

function labelForStatus(s) {
  if (s === 'done') return '✓ Resuelto';
  if (s === 'failed') return '✗ Fallado';
  return 'Pendiente';
}
