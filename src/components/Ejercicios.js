import { EJERCICIOS_BY_TEMA, RESUELTOS_BY_TEMA } from '../data/index.js';

export function render(container, _ctx) {
  container.innerHTML = '';

  let activeTema = (_ctx && _ctx.state._uiEjerciciosTema) || 1;
  let filter = (_ctx && _ctx.state._uiEjerciciosFilter) || 'todos';

  const tabs = document.createElement('div');
  tabs.className = 'inner-tabs';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inner-tab' + (i === activeTema ? ' inner-tab--active' : '');
    btn.textContent = `Tema ${i}`;
    btn.addEventListener('click', () => {
      activeTema = i;
      _ctx.state._uiEjerciciosTema = i;
      rerender();
    });
    tabs.appendChild(btn);
  }

  const filters = document.createElement('div');
  filters.className = 'filter-row';
  ['todos', 'con solución', 'sin solución'].forEach((f) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn' + (filter === f ? ' filter-btn--active' : '');
    btn.textContent = f;
    btn.addEventListener('click', () => {
      filter = f;
      _ctx.state._uiEjerciciosFilter = f;
      rerender();
    });
    filters.appendChild(btn);
  });

  const body = document.createElement('div');

  function rerender() {
    [...tabs.children].forEach((btn, i) => {
      btn.classList.toggle('inner-tab--active', (i + 1) === activeTema);
    });
    [...filters.children].forEach((btn) => {
      btn.classList.toggle('filter-btn--active', btn.textContent === filter);
    });
    renderBody();
  }

  function renderBody() {
    body.innerHTML = '';
    const ejercicios = EJERCICIOS_BY_TEMA[activeTema] || [];
    const resueltosTema = RESUELTOS_BY_TEMA[activeTema] || [];
    const resueltosIds = new Set(resueltosTema.map((r) => r.sourceNote));

    let lista = ejercicios;
    if (filter === 'con solución') {
      lista = ejercicios.filter((e) => resueltosIds.has(e.sourceNote) || e.hasSolution);
    } else if (filter === 'sin solución') {
      lista = ejercicios.filter((e) => !resueltosIds.has(e.sourceNote) && !e.hasSolution);
    }

    if (lista.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'No hay ejercicios con este filtro.';
      body.appendChild(empty);
      return;
    }

    lista.forEach((ej) => {
      const card = document.createElement('section');
      card.className = 'card exercise-card';
      const tieneResolucionDetallada = resueltosIds.has(ej.sourceNote);
      const head = document.createElement('div');
      head.className = 'exercise__head';
      const badge = ej.hasSolution
        ? '<span class="badge badge--medium">tiene solución</span>'
        : '<span class="badge badge--high">sin solución</span>';
      head.innerHTML = `
        <div class="exercise__title">
          <strong>Ejercicio ${ej.numero}</strong>
          <span class="exercise__source">${ej.sourceNote}</span>
        </div>
        ${badge}
      `;
      card.appendChild(head);

      card.appendChild(buildStatement(ej.statement));

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${ej.sourceNote}${ej.type ? ' · ' + ej.type : ''}`;
      card.appendChild(meta);

      if (tieneResolucionDetallada) {
        const note = document.createElement('p');
        note.className = 'meta note-link';
        note.innerHTML = '→ Este ejercicio tiene solución paso a paso en la pestaña <strong>Resueltos</strong>.';
        card.appendChild(note);
      }

      body.appendChild(card);
    });
  }

  renderBody();
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

function splitStatement(text) {
  return text
    .split(/(?=\([a-z]\)\s)/i)
    .map((part) => part.trim())
    .filter(Boolean);
}
