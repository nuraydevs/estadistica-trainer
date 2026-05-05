import { TEMAS } from '../data/index.js';
import { marcarSeccionLeida, isSeccionLeida } from '../utils/storage.js';

export function render(container, { state, onChange }) {
  container.innerHTML = '';

  const layout = document.createElement('div');
  layout.className = 'split-layout';

  const sidebar = document.createElement('aside');
  sidebar.className = 'split-sidebar';

  const main = document.createElement('section');
  main.className = 'split-main';

  let activeSection = state._uiTemaSeccion || (TEMAS[0].sections[0] && TEMAS[0].sections[0].id);

  function renderSidebar() {
    sidebar.innerHTML = '';
    TEMAS.forEach((tema) => {
      const total = tema.sections.length;
      const leidas = tema.sections.filter((s) => isSeccionLeida(state, s.id)).length;

      const group = document.createElement('div');
      group.className = 'sidebar-group';
      const title = document.createElement('div');
      title.className = 'sidebar-group__title';
      title.innerHTML = `Tema ${tema.id} · ${tema.title} <span class="muted">${leidas}/${total}</span>`;
      group.appendChild(title);

      tema.sections.forEach((sec) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'sidebar-item' + (sec.id === activeSection ? ' sidebar-item--active' : '');
        const check = isSeccionLeida(state, sec.id) ? '✓ ' : '';
        item.innerHTML = `<span class="sidebar-check">${check}</span>${sec.title}`;
        item.addEventListener('click', () => {
          activeSection = sec.id;
          state._uiTemaSeccion = sec.id;
          rerenderAll();
        });
        group.appendChild(item);
      });

      sidebar.appendChild(group);
    });
  }

  function renderMain() {
    main.innerHTML = '';
    let foundSection = null;
    let foundTema = null;
    for (const t of TEMAS) {
      const s = t.sections.find((x) => x.id === activeSection);
      if (s) { foundSection = s; foundTema = t; break; }
    }
    if (!foundSection) {
      main.innerHTML = '<p class="muted">Selecciona una sección.</p>';
      return;
    }

    const head = document.createElement('div');
    head.className = 'tema-head';
    head.innerHTML = `<div class="muted">Tema ${foundTema.id} · ${foundTema.title}</div><h1>${foundSection.title}</h1>`;
    main.appendChild(head);

    const body = document.createElement('article');
    body.className = 'prose';
    body.innerHTML = foundSection.content;
    main.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'tema-actions';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--ghost';
    const leida = isSeccionLeida(state, foundSection.id);
    btn.textContent = leida ? '✓ Leída — desmarcar' : 'Marcar como leída';
    btn.addEventListener('click', () => {
      marcarSeccionLeida(state, foundSection.id, !leida);
      onChange();
      rerenderAll();
    });
    actions.appendChild(btn);
    main.appendChild(actions);
  }

  function rerenderAll() {
    renderSidebar();
    renderMain();
  }

  rerenderAll();
  layout.appendChild(sidebar);
  layout.appendChild(main);
  container.appendChild(layout);
}
