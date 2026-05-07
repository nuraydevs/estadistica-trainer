import { SUBJECTS } from '../lib/subjects.js';
import { render as renderSubjectCard } from '../components/SubjectCard.js';
import { renderRanking } from '../components/Ranking.js';

export function render(container, { profile, unlockedSlugs, onOpenSubject }) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'hub';

  const greeting = profile?.full_name?.trim() || profile?.email || 'estudiante';
  wrap.innerHTML = `
    <h1>Hola, ${greeting}</h1>
    <nav class="hub-tabs">
      <button class="hub-tab hub-tab--active" data-tab="subjects">Asignaturas</button>
      <button class="hub-tab" data-tab="community">Comunidad</button>
    </nav>
    <div id="hub-content"></div>
  `;
  container.appendChild(wrap);

  const tabs = wrap.querySelectorAll('.hub-tab');
  const content = wrap.querySelector('#hub-content');
  let active = 'subjects';

  function renderActive() {
    content.innerHTML = '';
    if (active === 'subjects') {
      const grid = document.createElement('div');
      grid.className = 'hub-grid';
      const unlockedSet = new Set(unlockedSlugs);
      SUBJECTS.forEach((subject) => {
        grid.appendChild(renderSubjectCard({
          subject,
          unlocked: unlockedSet.has(subject.slug),
          onOpen: onOpenSubject
        }));
      });
      content.appendChild(grid);
    } else if (active === 'community') {
      renderRanking(content, { currentUserId: profile?.id });
    }
  }

  tabs.forEach((b) => b.addEventListener('click', () => {
    active = b.dataset.tab;
    tabs.forEach((x) => x.classList.toggle('hub-tab--active', x === b));
    renderActive();
  }));

  renderActive();
}
