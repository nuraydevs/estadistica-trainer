import { SUBJECTS } from '../lib/subjects.js';
import { render as renderSubjectCard } from '../components/SubjectCard.js';

export function render(container, { profile, unlockedSlugs, onOpenSubject }) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'hub';

  const greeting = profile?.full_name?.trim() || profile?.email || 'estudiante';
  wrap.innerHTML = `
    <h1>Hola, ${greeting}</h1>
    <p class="subtitle">Elige una asignatura para empezar.</p>
    <div class="hub-grid"></div>
  `;

  const grid = wrap.querySelector('.hub-grid');
  const unlockedSet = new Set(unlockedSlugs);
  SUBJECTS.forEach((subject) => {
    grid.appendChild(
      renderSubjectCard({
        subject,
        unlocked: unlockedSet.has(subject.slug),
        onOpen: onOpenSubject
      })
    );
  });

  container.appendChild(wrap);
}
