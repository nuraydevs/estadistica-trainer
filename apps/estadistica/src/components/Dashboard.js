import { BLOCKS } from '../data/index.js';

export function render(container, { onOpenBlock }) {
  container.innerHTML = '';

  const intro = document.createElement('section');
  intro.className = 'card';
  intro.innerHTML = `
    <h2>Cómo usar esto</h2>
    <p class="muted">Esta app está pensada para que apruebes el examen del 17 de junio partiendo casi de cero.</p>
    <ol class="steps">
      <li>Abre un bloque y lee primero <strong>"Lo mínimo que necesitas saber"</strong> (fórmulas, cómo identificar el tipo y plantilla).</li>
      <li>Haz los ejercicios uno a uno: primero identificas el tipo y luego resuelves.</li>
      <li>Si te atascas, usa pistas progresivas. Si fallas, mira la solución y repite el ejercicio al día siguiente.</li>
      <li>Mira tus stats periódicamente para saber dónde te atascas más.</li>
    </ol>
  `;
  container.appendChild(intro);

  const blocksCard = document.createElement('section');
  blocksCard.className = 'card';
  const blocksTitle = document.createElement('h2');
  blocksTitle.textContent = 'Bloques de estudio';
  blocksCard.appendChild(blocksTitle);

  const list = document.createElement('div');
  list.className = 'block-list';
  BLOCKS.forEach((b) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'block-item';
    item.innerHTML = `
      <div class="block-item__head">
        <span class="badge badge--${b.priority}">${b.priorityLabel}</span>
        <span class="muted">Tema ${b.tema}</span>
      </div>
      <div class="block-item__title">${b.title}</div>
      <div class="block-item__why muted">${b.why}</div>
    `;
    item.addEventListener('click', () => onOpenBlock(b.id));
    list.appendChild(item);
  });
  blocksCard.appendChild(list);
  container.appendChild(blocksCard);

  const plan = document.createElement('section');
  plan.className = 'card';
  plan.innerHTML = `
    <h2>Plan recomendado · 43 días</h2>
    <p class="muted">Hoy faltan ~6 semanas. Si haces 1 hora al día con esta app llegas con margen.</p>
    <ul class="plan">
      <li><strong>Semana 1-2 · Tema 2 (Probabilidad):</strong> Bayes y Probabilidad Total. Repite los 5 ejercicios hasta que acertaríamos sin pistas.</li>
      <li><strong>Semana 3 · Tema 4 (Distribuciones discretas):</strong> Binomial y Poisson. Identificación + cálculo de P(X=k), P(X≤k).</li>
      <li><strong>Semana 4 · Tema 4 (Distribuciones continuas):</strong> Exponencial y, sobre todo, Normal. Estandarización y uso de tablas.</li>
      <li><strong>Semana 5 · Repaso integrado:</strong> mezcla ejercicios de los dos temas. Sin pistas.</li>
      <li><strong>Semana 6 · Simulacros:</strong> exámenes antiguos cronometrados. Si flaqueas en algún bloque, vuelves a esta app.</li>
    </ul>
    <p class="muted">No estudies a saco un día y nada al siguiente. Mejor 45 min cada día que 4 horas el domingo.</p>
  `;
  container.appendChild(plan);
}
