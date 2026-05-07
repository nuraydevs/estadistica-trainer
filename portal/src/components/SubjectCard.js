export function render({ subject, unlocked, onOpen }) {
  const card = document.createElement('div');
  card.className = 'subject-card';

  let state;
  if (!subject.available) state = 'unavailable';
  else if (!unlocked) state = 'locked';
  else state = 'unlocked';
  card.dataset.state = state;

  const headerLabel =
    state === 'unlocked'
      ? '<span class="subject-card__badge" style="color: var(--success);">Disponible</span>'
      : state === 'locked'
        ? '<span class="subject-card__badge">🔒 Bloqueada</span>'
        : '<span class="subject-card__badge subject-card__badge--soon">Próximamente</span>';

  const hint =
    state === 'unlocked'
      ? ''
      : state === 'locked'
        ? '<p class="subject-card__hint">Contacta para desbloquear.</p>'
        : '<p class="subject-card__hint">Aún no construida.</p>';

  card.innerHTML = `
    <div class="subject-card__head">
      <h3 class="subject-card__name">${subject.name}</h3>
      ${headerLabel}
    </div>
    <p class="subject-card__desc">${subject.description}</p>
    ${hint}
  `;

  if (state === 'unlocked') {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const open = () => onOpen?.(subject);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  return card;
}
