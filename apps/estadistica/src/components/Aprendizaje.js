import { APRENDIZAJE_BY_TEMA } from '../data/index.js';
import { isUnidadCompletada, marcarUnidadCompletada } from '../utils/storage.js';

export function render(container, { state, onChange }) {
  container.innerHTML = '';

  let activeTema = state._uiAprendizajeTema || 1;
  let activeUnitId = state._uiAprendizajeUnit || null;
  let feedback = null;

  const tabs = document.createElement('div');
  tabs.className = 'inner-tabs';
  const body = document.createElement('div');

  for (let tema = 1; tema <= 5; tema++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inner-tab' + (tema === activeTema ? ' inner-tab--active' : '');
    btn.textContent = `Tema ${tema}`;
    btn.addEventListener('click', () => {
      activeTema = tema;
      activeUnitId = null;
      state._uiAprendizajeTema = tema;
      state._uiAprendizajeUnit = null;
      feedback = null;
      rerender();
    });
    tabs.appendChild(btn);
  }

  function getUnits() {
    return APRENDIZAJE_BY_TEMA[activeTema]?.units || [];
  }

  function isLocked(unit, index) {
    if (index === 0) return false;
    return !isUnidadCompletada(state, getUnits()[index - 1].id);
  }

  function renderList() {
    body.innerHTML = '';
    const units = getUnits();
    units.forEach((unit, index) => {
      const completed = isUnidadCompletada(state, unit.id);
      const locked = isLocked(unit, index);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card lesson-card'
        + (completed ? ' lesson--completed' : '')
        + (!completed && !locked ? ' lesson--current' : '')
        + (locked ? ' lesson--locked' : '');
      card.disabled = locked;
      card.innerHTML = `
        <span class="lesson__icon">${completed ? '✓' : locked ? '' : '→'}</span>
        <span class="lesson__title">${unit.concept}</span>
      `;
      card.addEventListener('click', () => {
        activeUnitId = unit.id;
        state._uiAprendizajeUnit = unit.id;
        feedback = null;
        rerender();
      });
      body.appendChild(card);
    });
  }

  function renderDetail(unit) {
    body.innerHTML = '';

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn btn--back';
    back.textContent = '← Volver a lecciones';
    back.addEventListener('click', () => {
      activeUnitId = null;
      state._uiAprendizajeUnit = null;
      feedback = null;
      rerender();
    });
    body.appendChild(back);

    const card = document.createElement('section');
    card.className = 'card';
    card.innerHTML = `
      <h1>${unit.concept}</h1>
      <div class="prose">${unit.explanation}</div>
      <h2>Ejemplo</h2>
      <p>${unit.example}</p>
      <h2>Mini ejercicio</h2>
      <p>${unit.miniExercise.question}</p>
    `;

    const answerWrap = document.createElement('div');
    answerWrap.className = 'answer-row';

    if (typeof unit.miniExercise.answer === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.className = 'answer-input';
      input.placeholder = 'Tu respuesta';
      answerWrap.appendChild(input);

      const check = document.createElement('button');
      check.type = 'button';
      check.className = 'btn btn--primary';
      check.textContent = 'Comprobar';
      check.addEventListener('click', () => {
        const value = Number.parseFloat(input.value);
        if (Number.isNaN(value)) return;
        const tolerance = unit.miniExercise.tolerance ?? 0.01;
        const ok = Math.abs(value - unit.miniExercise.answer) <= tolerance;
        feedback = {
          ok,
          text: ok ? unit.miniExercise.feedback.correct : unit.miniExercise.feedback.wrong
        };
        if (ok) {
          marcarUnidadCompletada(state, unit.id);
        }
        rerender();
      });
      answerWrap.appendChild(check);
    } else {
      const expected = document.createElement('p');
      expected.className = 'feedback';
      expected.textContent = unit.miniExercise.textAnswer || 'Respuesta razonada.';
      card.appendChild(expected);

      const done = document.createElement('button');
      done.type = 'button';
      done.className = 'btn btn--primary';
      done.textContent = 'Lo tengo';
      done.addEventListener('click', () => {
        marcarUnidadCompletada(state, unit.id);
        feedback = { ok: true, text: unit.miniExercise.textAnswer || 'Unidad completada.' };
        rerender();
      });
      answerWrap.appendChild(done);
    }

    card.appendChild(answerWrap);

    if (feedback) {
      const fb = document.createElement('p');
      fb.className = 'feedback ' + (feedback.ok ? 'feedback--success' : 'feedback--wrong');
      fb.textContent = feedback.text;
      card.appendChild(fb);
    }

    body.appendChild(card);
  }

  function rerender() {
    [...tabs.children].forEach((btn, index) => {
      btn.classList.toggle('inner-tab--active', index + 1 === activeTema);
    });
    const unit = getUnits().find((item) => item.id === activeUnitId);
    if (unit) renderDetail(unit);
    else renderList();
  }

  rerender();
  container.appendChild(tabs);
  container.appendChild(body);
}
