// Tab "Temario" — vista doble: PDF original o HTML interactivo extraído por Gemini.
// Datos vienen de public.subject_materials (Supabase).

import { supabase } from '@portal/lib/supabase.js';
import { renderMath } from '@portal/lib/math-render.js';

export async function render(container, { state }) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'temario-layout';
  wrap.innerHTML = `
    <aside class="temario-sidebar" id="temario-side">
      <p class="muted" style="font-size: 12px; padding: var(--space-2)">Cargando…</p>
    </aside>
    <main class="temario-content" id="temario-content">
      <div class="muted" style="padding: var(--space-4)">Selecciona un documento del menú lateral.</div>
    </main>
  `;
  container.appendChild(wrap);

  const sidebar = wrap.querySelector('#temario-side');
  const main = wrap.querySelector('#temario-content');

  const { data: materials, error } = await supabase
    .from('subject_materials')
    .select('*')
    .eq('subject_slug', 'estadistica')
    .order('type', { ascending: true })
    .order('tema', { ascending: true });

  if (error) {
    sidebar.innerHTML = `<p class="muted" style="font-size: 12px; padding: var(--space-2)">Error al cargar: ${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!materials?.length) {
    sidebar.innerHTML = '<p class="muted" style="font-size: 12px; padding: var(--space-2)">Aún no hay material cargado. Pídele al admin que aplique la migración 0008 y suba los PDFs.</p>';
    return;
  }

  // Sidebar
  const teoria = materials.filter((m) => m.type === 'teoria');
  const ejer = materials.filter((m) => m.type === 'ejercicios');
  const exams = materials.filter((m) => m.type === 'examen_anterior');

  sidebar.innerHTML = `
    ${teoria.length ? '<h3 class="section-label">Teoría</h3>' + buildList(teoria) : ''}
    ${ejer.length ? '<h3 class="section-label">Ejercicios</h3>' + buildList(ejer) : ''}
    ${exams.length ? '<h3 class="section-label">Exámenes anteriores</h3>' + buildList(exams) : ''}
  `;

  let activeId = null;

  sidebar.querySelectorAll('.material-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      sidebar.querySelectorAll('.material-btn').forEach((b) => b.classList.toggle('active', b === btn));
      const mat = materials.find((m) => m.id === btn.dataset.id);
      activeId = mat.id;
      showMaterial(main, mat);
    });
  });

  // Restaurar último material visto
  const lastId = state?._uiTemarioMaterial;
  if (lastId) {
    const btn = sidebar.querySelector(`.material-btn[data-id="${lastId}"]`);
    if (btn) btn.click();
  }

  function buildList(items) {
    return '<ul>' + items.map((m) => `
      <li><button type="button" class="material-btn" data-id="${m.id}">
        <span>${escapeHtml(m.title)}</span>
      </button></li>
    `).join('') + '</ul>';
  }

  function showMaterial(host, mat) {
    if (state) state._uiTemarioMaterial = mat.id;
    host.innerHTML = `
      <div class="material-header">
        <h2>${escapeHtml(mat.title)}</h2>
        <div class="view-toggle">
          <button class="btn btn--sm active" data-view="${mat.html_content ? 'interactiva' : 'pdf'}">${mat.html_content ? 'Versión interactiva' : 'PDF'}</button>
          ${mat.html_content ? '<button class="btn btn--sm" data-view="pdf">PDF original</button>' : ''}
        </div>
      </div>
      <div id="material-body"></div>
    `;
    const body = host.querySelector('#material-body');
    let view = mat.html_content ? 'interactiva' : 'pdf';
    function renderView() {
      if (view === 'pdf') {
        body.innerHTML = `
          <div class="pdf-wrapper">
            <iframe src="${escapeAttr(mat.pdf_url || '')}" loading="lazy" title="${escapeAttr(mat.title)}"></iframe>
            <p class="pdf-note">
              Documento original. <a href="${escapeAttr(mat.pdf_url || '')}" target="_blank" rel="noopener">Abrir en pestaña nueva</a>
            </p>
          </div>
        `;
      } else if (mat.html_content) {
        body.innerHTML = `
          <div class="interactive-content">${mat.html_content}</div>
          <div class="feedback-section">
            <button class="btn btn--sm" data-action="feedback">¿Falta algo en esta sección?</button>
          </div>
        `;
        renderMath(body);
        body.querySelector('[data-action="feedback"]').addEventListener('click', () => openFeedbackModal(mat));
      } else {
        body.innerHTML = '<p class="muted">Aún no se ha extraído el HTML interactivo. Mira el PDF.</p>';
      }
    }
    renderView();
    host.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
      view = b.dataset.view;
      host.querySelectorAll('[data-view]').forEach((x) => x.classList.toggle('active', x === b));
      renderView();
    }));
  }
}

async function openFeedbackModal(material) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <h2>Reportar contenido faltante</h2>
      <p class="muted" style="font-size: 13px;">¿Qué crees que falta o está mal en esta sección?</p>
      <textarea maxlength="500" rows="4" placeholder="Ej: falta el ejemplo de la diapositiva 12 — el de calcular la varianza muestral." style="width: 100%; padding: var(--space-2); background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font: inherit;"></textarea>
      <div class="actions">
        <button class="btn" data-action="cancel">Cancelar</button>
        <button class="btn btn--primary" data-action="send">Enviar</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('[data-action="cancel"]').addEventListener('click', close);
  backdrop.querySelector('[data-action="send"]').addEventListener('click', async () => {
    const text = backdrop.querySelector('textarea').value.trim();
    if (!text) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const { error } = await supabase.from('content_feedback').insert({
      user_id: userId,
      subject_slug: material.subject_slug,
      material_id: material.id,
      feedback: text
    });
    if (error) {
      alert('No se pudo enviar: ' + error.message);
      return;
    }
    backdrop.querySelector('.modal').innerHTML = '<h2>Gracias por avisar</h2><p class="muted">Lo revisaremos.</p><div class="actions"><button class="btn btn--primary" data-action="cancel">Cerrar</button></div>';
    backdrop.querySelector('[data-action="cancel"]').addEventListener('click', close);
  });
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
function escapeAttr(s) { return escapeHtml(s); }
