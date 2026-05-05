export const TABS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'temas', label: 'Temas' },
  { id: 'resumenes', label: 'Resúmenes' },
  { id: 'ejercicios', label: 'Ejercicios' },
  { id: 'resueltos', label: 'Resueltos' },
  { id: 'formulario', label: 'Formulario' },
  { id: 'aprendizaje', label: 'Aprendizaje' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'stats', label: 'Stats' }
];

export function render(container, { activeTab, onChange }) {
  container.innerHTML = '';
  const nav = document.createElement('nav');
  nav.className = 'tabs';
  nav.setAttribute('role', 'tablist');

  TABS.forEach((tab) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab' + (tab.id === activeTab ? ' tab--active' : '');
    btn.textContent = tab.label;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', tab.id === activeTab ? 'true' : 'false');
    btn.addEventListener('click', () => onChange(tab.id));
    nav.appendChild(btn);
  });

  container.appendChild(nav);
}
