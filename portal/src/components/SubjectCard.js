export function render({ subject, unlocked, onOpen, examDate = null, daysToExam = null, lastExam = null }) {
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

  // Footer con info de examen + último simulacro
  let extra = '';
  if (state === 'unlocked' && (examDate || lastExam)) {
    const lines = [];
    if (examDate) {
      const examFmt = new Date(examDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
      const daysLine = daysToExam == null
        ? `<span class="dim">Examen ${examFmt}</span>`
        : daysToExam < 0
          ? `<span class="dim">Examen ${examFmt} (pasado)</span>`
          : daysToExam <= 7
            ? `<span style="color: var(--warning);">⚡ Quedan ${daysToExam} días · ${examFmt}</span>`
            : `<span class="dim">Examen ${examFmt} · ${daysToExam} días</span>`;
      lines.push(daysLine);
    }
    if (lastExam) {
      const days = lastExam.finishedAt ? Math.floor((Date.now() - new Date(lastExam.finishedAt).getTime()) / 86400000) : null;
      const ago = days == null ? '' : days === 0 ? 'hoy' : days === 1 ? 'ayer' : `hace ${days} días`;
      const score = Number(lastExam.score).toFixed(1);
      lines.push(`<span class="dim">Último simulacro: <strong>${score}/10</strong>${ago ? ` · ${ago}` : ''}</span>`);
    }
    extra = `<div class="subject-card__extra">${lines.join('<br>')}</div>`;
  }

  card.innerHTML = `
    <div class="subject-card__head">
      <h3 class="subject-card__name">${subject.name}</h3>
      ${headerLabel}
    </div>
    <p class="subject-card__desc">${subject.description}</p>
    ${extra}
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
