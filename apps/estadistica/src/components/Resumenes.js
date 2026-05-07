import { RESUMENES } from '../data/index.js';

export function render(container, _ctx) {
  container.innerHTML = '';

  let activeTema = (_ctx && _ctx.state._uiResumenTema) || 1;

  const tabs = document.createElement('div');
  tabs.className = 'inner-tabs';

  RESUMENES.forEach((r) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inner-tab' + (r.id === activeTema ? ' inner-tab--active' : '');
    btn.textContent = `Tema ${r.id}`;
    btn.addEventListener('click', () => {
      activeTema = r.id;
      _ctx.state._uiResumenTema = r.id;
      renderBody();
    });
    tabs.appendChild(btn);
  });

  const body = document.createElement('div');

  function renderBody() {
    body.innerHTML = '';
    const r = RESUMENES.find((x) => x.id === activeTema);
    if (!r) return;

    const head = document.createElement('div');
    head.innerHTML = `<h1>${r.title}</h1>`;
    body.appendChild(head);

    r.blocks.forEach((b) => {
      const card = document.createElement('section');
      card.className = 'card';
      const title = document.createElement('h2');
      title.textContent = b.title;
      card.appendChild(title);

      if (b.type === 'text') {
        const div = document.createElement('div');
        div.className = 'prose';
        div.innerHTML = b.content;
        card.appendChild(div);
      } else if (b.type === 'list') {
        const ul = document.createElement('ul');
        ul.className = 'tight-list';
        b.items.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      } else if (b.type === 'svg') {
        const wrap = document.createElement('div');
        wrap.className = 'svg-wrap';
        wrap.innerHTML = b.svg;
        card.appendChild(wrap);
      } else if (b.type === 'warnings') {
        const ul = document.createElement('ul');
        ul.className = 'warning-list';
        b.items.forEach((item) => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="warning-mark">!</span> ${item}`;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      // Mejorada para devolver
      body.appendChild(card);
    });
  }

  // Actualiza tabs cuando se hace click
  tabs.addEventListener('click', () => {
    [...tabs.children].forEach((btn, i) => {
      const r = RESUMENES[i];
      btn.classList.toggle('inner-tab--active', r.id === activeTema);
    });
  });

  renderBody();
  container.appendChild(tabs);
  container.appendChild(body);
}
