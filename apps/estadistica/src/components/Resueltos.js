import { RESUELTOS_BY_TEMA, TEMAS } from '../data/index.js';

export function render(container, { state }) {
  container.innerHTML = '';

  let activeTema = state._uiResueltosTema || 1;
  let activeType = 'todos';
  const openItems = new Set();

  const tabs = document.createElement('div');
  tabs.className = 'inner-tabs';

  for (let tema = 1; tema <= 5; tema++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inner-tab' + (tema === activeTema ? ' inner-tab--active' : '');
    btn.textContent = `Tema ${tema}`;
    btn.addEventListener('click', () => {
      activeTema = tema;
      activeType = 'todos';
      state._uiResueltosTema = tema;
      state._uiResueltosType = activeType;
      openItems.clear();
      rerender();
    });
    tabs.appendChild(btn);
  }

  const filters = document.createElement('div');
  filters.className = 'filter-row';
  const body = document.createElement('div');

  function getTypes() {
    return ['todos', ...new Set((RESUELTOS_BY_TEMA[activeTema] || []).map((item) => item.type).filter(Boolean))];
  }

  function renderFilters() {
    filters.innerHTML = '';
    getTypes().forEach((type) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn' + (type === activeType ? ' filter-btn--active' : '');
      btn.textContent = type;
      btn.addEventListener('click', () => {
        activeType = type;
        state._uiResueltosType = type;
        rerender();
      });
      filters.appendChild(btn);
    });
  }

  function renderBody() {
    body.innerHTML = '';
    const items = (RESUELTOS_BY_TEMA[activeTema] || [])
      .filter((item) => activeType === 'todos' || item.type === activeType);

    if (items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'No hay resueltos con este filtro.';
      body.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('section');
      card.className = 'card exercise-card';

      const head = document.createElement('div');
      head.className = 'exercise__head';
      head.innerHTML = `
        <div class="exercise__title">
          <strong>${item.sourceNote}</strong>
          ${item.type ? `<span class="exercise__source">${item.type}</span>` : ''}
        </div>
        ${item.unverified ? '<span class="badge badge--high">pendiente</span>' : item.type ? `<span class="badge badge--medium">${item.type}</span>` : ''}
      `;
      card.appendChild(head);

      card.appendChild(buildStatement(item.statement));

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--ghost';
      btn.textContent = openItems.has(item.id) ? 'Ocultar solución' : 'Ver solución paso a paso';
      btn.addEventListener('click', () => {
        if (openItems.has(item.id)) openItems.delete(item.id);
        else openItems.add(item.id);
        rerender();
      });
      card.appendChild(btn);

      if (openItems.has(item.id)) {
        const label = document.createElement('div');
        label.className = 'section-label solution-label';
        label.textContent = 'Solución paso a paso';
        card.appendChild(label);

        const ol = document.createElement('ol');
        ol.className = 'solution-steps';
        item.solution.forEach((step) => {
          const li = document.createElement('li');
          li.className = 'solution-step';
          li.innerHTML = `
            <div class="solution-step__title">Paso ${step.step}: ${step.title}</div>
            <div class="solution-step__content">${step.content}</div>
          `;
          ol.appendChild(li);
        });
        card.appendChild(ol);

        if (item.finalAnswer) {
          const answer = document.createElement('div');
          answer.className = 'final-answer final-answer--large';
          answer.innerHTML = `<strong>Respuesta:</strong> <span>${item.finalAnswer}</span>`;
          card.appendChild(answer);
        }

        if (item.notes) {
          const note = document.createElement('p');
          note.className = 'feedback';
          note.textContent = item.notes;
          card.appendChild(note);
        }

        if (item.relatedConcepts?.length) {
          card.appendChild(buildRelatedConcepts(item.relatedConcepts));
        }
      }

      body.appendChild(card);
    });
  }

  function rerender() {
    [...tabs.children].forEach((btn, index) => {
      btn.classList.toggle('inner-tab--active', index + 1 === activeTema);
    });
    renderFilters();
    renderBody();
  }

  rerender();
  container.appendChild(tabs);
  container.appendChild(filters);
  container.appendChild(body);
}

function buildStatement(text) {
  const section = document.createElement('section');
  section.className = 'exercise-section';
  section.innerHTML = '<div class="section-label">Enunciado</div>';

  const statement = document.createElement('div');
  statement.className = 'statement statement--formatted';
  splitStatement(text).forEach((part) => {
    const p = document.createElement('p');
    p.textContent = part;
    statement.appendChild(p);
  });

  section.appendChild(statement);
  return section;
}

function buildRelatedConcepts(ids) {
  const wrap = document.createElement('section');
  wrap.className = 'related-concepts';
  wrap.innerHTML = '<div class="section-label">Conceptos relacionados</div>';

  const tags = document.createElement('div');
  tags.className = 'tag-list';
  ids.forEach((id) => {
    const section = findSection(id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'concept-tag';
    btn.textContent = section ? section.title : id;
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('open-theory-section', { detail: { sectionId: id } }));
    });
    tags.appendChild(btn);
  });

  wrap.appendChild(tags);
  return wrap;
}

function findSection(id) {
  return TEMAS.flatMap((tema) => tema.sections).find((section) => section.id === id);
}

function splitStatement(text) {
  return text
    .split(/(?=\([a-z]\)\s)/i)
    .map((part) => part.trim())
    .filter(Boolean);
}
