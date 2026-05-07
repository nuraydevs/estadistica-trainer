import { render as renderExercise } from './Exercise.js';

export function render(container, { block, state, onBack, onChange }) {
  container.innerHTML = '';

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--back';
  back.textContent = `← Volver al Tema ${block.tema}`;
  back.addEventListener('click', onBack);
  container.appendChild(back);

  const head = document.createElement('section');
  head.className = 'card';
  head.innerHTML = `
    <div class="block-head">
      <span class="badge badge--${block.priority}">${block.priorityLabel}</span>
      <span class="muted">Tema ${block.tema}</span>
    </div>
    <h1>${block.title}</h1>
    <p><strong>Por qué importa:</strong> ${block.why}</p>
  `;
  container.appendChild(head);

  container.appendChild(buildTheoryCard(block.theory));

  const exCard = document.createElement('section');
  exCard.className = 'card';
  const exTitle = document.createElement('h2');
  exTitle.textContent = 'Ejercicios paso a paso';
  exCard.appendChild(exTitle);

  block.exercises.forEach((ex, idx) => {
    const slot = document.createElement('div');
    exCard.appendChild(slot);
    renderExercise(slot, { exercise: ex, index: idx, state, onChange });
  });

  container.appendChild(exCard);
}

function buildTheoryCard(theory) {
  const card = document.createElement('section');
  card.className = 'card';

  const title = document.createElement('h2');
  title.textContent = 'Lo mínimo que necesitas saber';
  card.appendChild(title);

  card.appendChild(buildKeyFormulas(theory.keyFormulas));
  card.appendChild(buildIdentify(theory.identify));
  card.appendChild(buildTemplate(theory.template));
  card.appendChild(buildCompleteTheory(theory.complete));

  return card;
}

function buildKeyFormulas(keyFormulas) {
  const wrap = document.createElement('div');
  wrap.className = 'theory-section';
  const h = document.createElement('h3');
  h.textContent = 'Fórmulas clave';
  wrap.appendChild(h);

  keyFormulas.forEach((f) => {
    const block = document.createElement('div');
    block.className = 'formula';
    block.innerHTML = `
      <div class="formula__label">${f.label}</div>
      <div class="formula__latex"><code>${f.latex}</code></div>
      ${f.note ? `<div class="formula__note muted">${f.note}</div>` : ''}
    `;
    wrap.appendChild(block);
  });

  return wrap;
}

function buildIdentify(identify) {
  const wrap = document.createElement('div');
  wrap.className = 'theory-section';
  const h = document.createElement('h3');
  h.textContent = 'Cómo identificar el tipo';
  wrap.appendChild(h);

  const ul = document.createElement('ul');
  ul.className = 'identify-list';
  identify.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="identify-list__signal">${item.signal}</span>
      <span class="identify-list__type">${item.type}</span>
    `;
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
  return wrap;
}

function buildTemplate(template) {
  const wrap = document.createElement('div');
  wrap.className = 'theory-section';
  const h = document.createElement('h3');
  h.textContent = 'Plantilla de resolución';
  wrap.appendChild(h);

  const ol = document.createElement('ol');
  ol.className = 'template-list';
  template.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    ol.appendChild(li);
  });
  wrap.appendChild(ol);
  return wrap;
}

function buildCompleteTheory(html) {
  const det = document.createElement('details');
  det.className = 'theory-complete';
  const sum = document.createElement('summary');
  sum.textContent = 'Teoría completa (académica)';
  det.appendChild(sum);
  const body = document.createElement('div');
  body.className = 'theory-complete__body';
  body.innerHTML = html;
  det.appendChild(body);
  return det;
}
