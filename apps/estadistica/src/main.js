import './styles/main.css';
import { loadState, hydrateState } from './utils/storage.js';
import { EXAM_DATES, formatCountdown, daysUntil, startCountdownTicker } from './utils/countdown.js';
import { getBlockById } from './data/index.js';
import { render as renderTabs } from './components/Tabs.js';
import { render as renderDashboard } from './components/Dashboard.js';
import { render as renderBlockView } from './components/BlockView.js';
import { render as renderTemas } from './components/Temas.js';
import { render as renderResumenes } from './components/Resumenes.js';
import { render as renderEjercicios } from './components/Ejercicios.js';
import { render as renderResueltos } from './components/Resueltos.js';
import { render as renderFormulario } from './components/Formulario.js';
import { render as renderAprendizaje } from './components/Aprendizaje.js';
import { render as renderQuiz } from './components/Quiz.js';
import { render as renderStats } from './components/Stats.js';

export function mount(container, ctx = {}) {
  if (!container) throw new Error('mount requires a container element');

  if (ctx.initialState && typeof ctx.initialState === 'object') {
    hydrateState(ctx.initialState);
  }

  const app = {
    state: loadState(),
    view: { tab: 'inicio', blockId: null }
  };

  container.innerHTML = '';
  container.classList.add('estadistica-root');

  function onOpenTheorySection(event) {
    const sectionId = event.detail?.sectionId;
    if (!sectionId) return;
    app.state._uiTemaSeccion = sectionId;
    app.view.tab = 'temas';
    app.view.blockId = null;
    rerender();
  }
  document.addEventListener('open-theory-section', onOpenTheorySection);

  function rerender() {
    container.innerHTML = '';
    container.appendChild(buildHeader());

    const main = document.createElement('main');
    main.className = 'main';

    const tabsSlot = document.createElement('div');
    main.appendChild(tabsSlot);
    renderTabs(tabsSlot, {
      activeTab: app.view.tab,
      onChange: (id) => {
        app.view.tab = id;
        app.view.blockId = null;
        rerender();
      }
    });

    const content = document.createElement('div');
    content.className = 'content';
    main.appendChild(content);

    if (app.view.blockId) {
      const block = getBlockById(app.view.blockId);
      if (block) {
        renderBlockView(content, {
          block,
          state: app.state,
          onBack: () => {
            app.view.blockId = null;
            app.view.tab = 'inicio';
            rerender();
          },
          onChange: rerender
        });
      }
    } else if (app.view.tab === 'inicio') {
      renderDashboard(content, {
        onOpenBlock: (id) => {
          app.view.blockId = id;
          rerender();
        }
      });
    } else if (app.view.tab === 'temas') {
      renderTemas(content, { state: app.state, onChange: rerender });
    } else if (app.view.tab === 'resumenes') {
      renderResumenes(content, { state: app.state, onChange: rerender });
    } else if (app.view.tab === 'ejercicios') {
      renderEjercicios(content, { state: app.state, onChange: rerender });
    } else if (app.view.tab === 'resueltos') {
      renderResueltos(content, { state: app.state, onChange: rerender });
    } else if (app.view.tab === 'formulario') {
      renderFormulario(content, { state: app.state, onChange: rerender });
    } else if (app.view.tab === 'aprendizaje') {
      renderAprendizaje(content, { state: app.state, onChange: rerender });
    } else if (app.view.tab === 'quiz') {
      renderQuiz(content, { state: app.state, onChange: rerender });
    } else if (app.view.tab === 'stats') {
      renderStats(content, { state: app.state, onChange: rerender });
    }

    container.appendChild(main);
    container.appendChild(buildFooter());
  }

  function buildHeader() {
    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
      <div class="app-header__brand">
        <h1>Estadística Trainer</h1>
        <p class="muted">Tema 2: Probabilidad · Tema 4: Distribuciones</p>
      </div>
      <div class="app-header__countdown" id="countdown">
        <div class="countdown__label muted">Examen ordinaria</div>
        <div class="countdown__value">—</div>
        <div class="countdown__sub muted">17 jun 2026</div>
      </div>
    `;
    return header;
  }

  function buildFooter() {
    const f = document.createElement('footer');
    f.className = 'app-footer';
    const days = daysUntil(EXAM_DATES.extraordinaria);
    f.innerHTML = `
      <span class="muted">Extraordinaria: 3 jul 2026 · ${days} días</span>
      <span class="muted">Hecho para aprobar el 17 de junio</span>
    `;
    return f;
  }

  function tickCountdown() {
    const el = container.querySelector('#countdown .countdown__value');
    if (el) el.textContent = formatCountdown(EXAM_DATES.ordinaria);
  }

  rerender();
  const tickerId = startCountdownTicker(tickCountdown, 60000);

  function getCurrentContext() {
    const tabLabels = {
      inicio: 'Inicio',
      temas: 'Temas (teoría)',
      resumenes: 'Resúmenes',
      ejercicios: 'Ejercicios',
      resueltos: 'Ejercicios resueltos',
      formulario: 'Formulario',
      aprendizaje: 'Aprendizaje guiado',
      quiz: 'Quiz',
      stats: 'Estadísticas'
    };
    const parts = ['Estadística'];
    parts.push(tabLabels[app.view.tab] || app.view.tab);
    if (app.view.blockId) {
      const block = getBlockById(app.view.blockId);
      if (block?.title) parts.push(block.title);
    }
    if (app.view.tab === 'temas' && app.state._uiTemaSeccion) {
      parts.push(`Sección ${app.state._uiTemaSeccion}`);
    }
    return parts.join(' · ');
  }

  return {
    getCurrentContext,
    unmount() {
      document.removeEventListener('open-theory-section', onOpenTheorySection);
      clearInterval(tickerId);
      container.innerHTML = '';
      container.classList.remove('estadistica-root');
    }
  };
}

