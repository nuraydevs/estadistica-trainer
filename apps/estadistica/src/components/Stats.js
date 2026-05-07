import { APRENDIZAJE_BY_TEMA, BLOCKS, FORMULAS, QUIZ_BY_TEMA, TEMAS } from '../data/index.js';
import { clearAll, getExerciseStatus } from '../utils/storage.js';

export function render(container, { state, onChange }) {
  container.innerHTML = '';

  container.appendChild(renderExerciseSummary(state));
  container.appendChild(renderBlockProgress(state));
  container.appendChild(renderTheoryProgress(state));
  container.appendChild(renderMarkedFormulas(state));
  container.appendChild(renderLearningProgress(state));
  container.appendChild(renderQuizWeaknesses(state));
  container.appendChild(renderReset(state, onChange));
}

function renderExerciseSummary(state) {
  const totals = computeExerciseTotals(state);
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<h2>Resumen general</h2>';

  const cells = document.createElement('div');
  cells.className = 'stats-grid';
  cells.appendChild(statCell('Resueltos', `${totals.done} / ${totals.total}`, 'success'));
  cells.appendChild(statCell('Fallados', String(totals.failed), 'danger'));
  cells.appendChild(statCell('Pendientes', String(totals.pending), 'muted'));
  cells.appendChild(statCell('Pistas usadas', String(totals.hints), 'warning'));
  card.appendChild(cells);
  return card;
}

function renderBlockProgress(state) {
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<h2>Bloques de práctica</h2>';
  BLOCKS.forEach((block) => {
    const total = block.exercises.length;
    const done = block.exercises.filter((exercise) => getExerciseStatus(state, exercise.id).status === 'done').length;
    card.appendChild(progressRow(block.title, done, total));
  });
  return card;
}

function renderTheoryProgress(state) {
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<h2>Progreso de teoría</h2>';
  TEMAS.forEach((tema) => {
    const total = tema.sections.length;
    const done = tema.sections.filter((section) => state.seccionesLeidas[section.id]).length;
    card.appendChild(progressRow(`Tema ${tema.id} · ${tema.title}`, done, total));
  });
  return card;
}

function renderMarkedFormulas(state) {
  const total = FORMULAS.reduce((count, tema) => (
    count + tema.sections.reduce((sectionCount, section) => sectionCount + section.formulas.length, 0)
  ), 0);
  const marked = Object.keys(state.formulasMarcadas).length;

  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = `
    <h2>Fórmulas marcadas</h2>
    <div class="stats-grid">
      <div class="stat-cell stat-cell--warning">
        <div class="stat-cell__value">${marked} / ${total}</div>
        <div class="stat-cell__label">Difíciles</div>
      </div>
    </div>
    <p class="muted">Revísalas en Formulario, pestaña Mis marcadas.</p>
  `;
  return card;
}

function renderLearningProgress(state) {
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<h2>Aprendizaje</h2>';

  Object.values(APRENDIZAJE_BY_TEMA).forEach((tema) => {
    const total = tema.units.length;
    const done = tema.units.filter((unit) => state.aprendizajeCompletado[unit.id]).length;
    card.appendChild(progressRow(`Tema ${tema.tema}`, done, total));
  });
  return card;
}

function renderQuizWeaknesses(state) {
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<h2>Quiz · conceptos más fallados</h2>';

  const ranking = quizConceptRanking(state);
  if (ranking.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Aún no hay fallos registrados en quiz.';
    card.appendChild(empty);
    return card;
  }

  const ol = document.createElement('ol');
  ol.className = 'stuck-list';
  ranking.slice(0, 3).forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.concept}</span><span class="muted">${item.fallos} fallos · ${item.aciertos} aciertos</span>`;
    ol.appendChild(li);
  });
  card.appendChild(ol);
  return card;
}

function renderReset(state, onChange) {
  const card = document.createElement('section');
  card.className = 'card card--danger';
  card.innerHTML = '<h2>Zona de reinicio</h2><p class="muted">Esto borra todo tu progreso del navegador. Úsalo si quieres empezar de cero.</p>';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--danger';
  btn.textContent = 'Borrar todo el progreso';
  btn.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar todo tu progreso? Esto no se puede deshacer.')) {
      clearAll(state);
      onChange();
    }
  });
  card.appendChild(btn);
  return card;
}

function statCell(label, value, tone) {
  const div = document.createElement('div');
  div.className = `stat-cell stat-cell--${tone}`;
  div.innerHTML = `
    <div class="stat-cell__value">${value}</div>
    <div class="stat-cell__label">${label}</div>
  `;
  return div;
}

function progressRow(label, done, total) {
  const row = document.createElement('div');
  row.className = 'block-progress';
  row.innerHTML = `
    <div class="block-progress__head">
      <span>${label}</span>
      <span class="muted">${done}/${total}</span>
    </div>
  `;
  const progress = document.createElement('progress');
  progress.className = 'progress-native';
  progress.value = done;
  progress.max = total || 1;
  row.appendChild(progress);
  return row;
}

function computeExerciseTotals(state) {
  let total = 0;
  let done = 0;
  let failed = 0;
  let pending = 0;
  let hints = 0;

  BLOCKS.forEach((block) => {
    block.exercises.forEach((exercise) => {
      total++;
      const status = getExerciseStatus(state, exercise.id);
      if (status.status === 'done') done++;
      else if (status.status === 'failed') failed++;
      else pending++;
      hints += status.hintsUsed || 0;
    });
  });

  return { total, done, failed, pending, hints };
}

function quizConceptRanking(state) {
  const byConcept = new Map();

  Object.values(QUIZ_BY_TEMA).flat().forEach((question) => {
    const stats = state.quizHistorial[question.id];
    if (!stats || !stats.fallos) return;

    const current = byConcept.get(question.concept) || { concept: question.concept, aciertos: 0, fallos: 0 };
    current.aciertos += stats.aciertos || 0;
    current.fallos += stats.fallos || 0;
    byConcept.set(question.concept, current);
  });

  return [...byConcept.values()].sort((a, b) => b.fallos - a.fallos || a.aciertos - b.aciertos);
}
