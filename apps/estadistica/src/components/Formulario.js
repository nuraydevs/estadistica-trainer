import { FORMULAS } from '../data/index.js';
import { isFormulaMarcada, toggleFormulaMarcada } from '../utils/storage.js';
import { renderMath, renderFormula } from '@portal/lib/math-render.js';

export function render(container, { state }) {
  container.innerHTML = '';

  let onlyMarked = state._uiFormularioMarked || false;
  let query = state._uiFormularioQuery || '';

  const layout = document.createElement('div');
  layout.className = 'split-layout';

  const sidebar = document.createElement('aside');
  sidebar.className = 'split-sidebar';

  const main = document.createElement('section');
  main.className = 'split-main';

  function formulaKey(tema, sectionTitle, formula) {
    return `t${tema}:${sectionTitle}:${formula.id}`;
  }

  function renderSidebar() {
    sidebar.innerHTML = '';
    FORMULAS.forEach((tema) => {
      const group = document.createElement('div');
      group.className = 'sidebar-group';

      const title = document.createElement('div');
      title.className = 'sidebar-group__title';
      title.textContent = `Tema ${tema.tema} · ${tema.temaTitle}`;
      group.appendChild(title);

      tema.sections.forEach((section) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sidebar-item';
        btn.textContent = section.title;
        btn.addEventListener('click', () => {
          document.getElementById(anchorId(tema.tema, section.title))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        group.appendChild(btn);
      });

      sidebar.appendChild(group);
    });
  }

  function renderMain() {
    main.innerHTML = '';

    const tools = document.createElement('div');
    tools.className = 'form-toolbar';

    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Buscar fórmula o expresión';
    input.value = query;
    input.addEventListener('input', () => {
      query = input.value;
      state._uiFormularioQuery = query;
      updateVisibility();
    });
    tools.appendChild(input);

    const tabs = document.createElement('div');
    tabs.className = 'inner-tabs';
    [
      { label: 'Todas', marked: false },
      { label: 'Mis marcadas', marked: true }
    ].forEach((tab) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'inner-tab' + (onlyMarked === tab.marked ? ' inner-tab--active' : '');
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        onlyMarked = tab.marked;
        state._uiFormularioMarked = onlyMarked;
        renderMain();
      });
      tabs.appendChild(btn);
    });
    tools.appendChild(tabs);
    main.appendChild(tools);

    FORMULAS.forEach((tema) => {
      const temaHead = document.createElement('div');
      temaHead.className = 'tema-head';
      temaHead.innerHTML = `<div class="muted">Tema ${tema.tema}</div><h1>${tema.temaTitle}</h1>`;
      main.appendChild(temaHead);

      tema.sections.forEach((section) => {
        const sectionEl = document.createElement('section');
        sectionEl.id = anchorId(tema.tema, section.title);
        sectionEl.className = 'formula-section';
        sectionEl.innerHTML = `<h2>${section.title}</h2>`;

        section.formulas.forEach((formula) => {
          const key = formulaKey(tema.tema, section.title, formula);
          const marked = isFormulaMarcada(state, key);
          const card = document.createElement('article');
          card.className = 'formula-card';
          card.dataset.search = `${formula.name} ${formula.latex}`.toLowerCase();
          card.dataset.marked = marked ? 'true' : 'false';
          card.innerHTML = `
            <div class="formula-card__head">
              <h3 class="formula-card__name">${formula.name}</h3>
              <button type="button" class="btn btn--ghost">${marked ? '✓ Difícil' : 'Marcar como difícil'}</button>
            </div>
            <div class="formula-card__latex">${renderFormula(formula.latex, true)}</div>
            <p class="formula-card__when">${formula.when}</p>
            ${formula.warning ? `<p class="formula-card__warning">${formula.warning}</p>` : ''}
          `;
          card.querySelector('button').addEventListener('click', () => {
            toggleFormulaMarcada(state, key);
            renderMain();
          });
          sectionEl.appendChild(card);
        });

        main.appendChild(sectionEl);
      });
    });

    updateVisibility();
  }

  function updateVisibility() {
    const normalized = query.trim().toLowerCase();
    let visible = 0;
    main.querySelectorAll('.formula-card').forEach((card) => {
      const matchesQuery = !normalized || card.dataset.search.includes(normalized);
      const matchesMarked = !onlyMarked || card.dataset.marked === 'true';
      const show = matchesQuery && matchesMarked;
      card.hidden = !show;
      if (show) visible++;
    });
    main.querySelectorAll('.formula-section').forEach((section) => {
      section.hidden = !section.querySelector('.formula-card:not([hidden])');
    });
    const previous = main.querySelector('.empty-state');
    previous?.remove();
    if (visible === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted empty-state';
      empty.textContent = 'No hay fórmulas que coincidan con este filtro.';
      main.appendChild(empty);
    }
  }

  renderSidebar();
  renderMain();
  layout.appendChild(sidebar);
  layout.appendChild(main);
  container.appendChild(layout);
  renderMath(container);
}

function anchorId(tema, title) {
  return `formula-t${tema}-${title.toLowerCase().replace(/\s+/g, '-')}`;
}
