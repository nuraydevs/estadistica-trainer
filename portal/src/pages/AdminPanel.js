import { render as renderStudents } from './admin/StudentsTab.js';
import { render as renderAlerts, getPendingAlertsCount } from './admin/AlertsTab.js';
import { render as renderTutorMetrics } from './admin/TutorMetrics.js';
import { render as renderPayments } from './admin/PaymentsTab.js';

const TABS = [
  { id: 'students', label: 'Alumnos' },
  { id: 'alerts', label: 'Alertas' },
  { id: 'tutor', label: 'Tutor IA' },
  { id: 'payments', label: 'Pagos' }
];

export async function render(container, { profile } = {}) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'admin';
  wrap.innerHTML = `
    <h1>Panel admin</h1>
    <p class="muted">Gestión de alumnos, alertas, tutor IA y pagos.</p>
    <nav class="admin-tabs"></nav>
    <div class="admin-tab-content"></div>
  `;
  container.appendChild(wrap);

  const tabsNav = wrap.querySelector('.admin-tabs');
  const content = wrap.querySelector('.admin-tab-content');

  let activeTabId = 'students';
  let pendingAlerts = 0;

  function buildTabs() {
    tabsNav.innerHTML = '';
    TABS.forEach((tab) => {
      const btn = document.createElement('button');
      btn.className = 'admin-tab' + (tab.id === activeTabId ? ' admin-tab--active' : '');
      btn.dataset.id = tab.id;
      btn.type = 'button';
      const badge = tab.id === 'alerts' && pendingAlerts > 0
        ? `<span class="admin-tab__badge">${pendingAlerts}</span>`
        : '';
      btn.innerHTML = `<span>${tab.label}</span>${badge}`;
      btn.addEventListener('click', () => {
        if (activeTabId === tab.id) return;
        activeTabId = tab.id;
        buildTabs();
        renderActive();
      });
      tabsNav.appendChild(btn);
    });
  }

  async function refreshBadge() {
    try {
      pendingAlerts = await getPendingAlertsCount();
      buildTabs();
    } catch {}
  }

  async function renderActive() {
    content.innerHTML = '';
    if (activeTabId === 'students') await renderStudents(content);
    else if (activeTabId === 'alerts') {
      await renderAlerts(content);
      refreshBadge();
    } else if (activeTabId === 'tutor') await renderTutorMetrics(content);
    else if (activeTabId === 'payments') await renderPayments(content);
  }

  buildTabs();
  refreshBadge();
  await renderActive();
}
