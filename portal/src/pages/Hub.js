import { SUBJECTS } from '../lib/subjects.js';
import { render as renderSubjectCard } from '../components/SubjectCard.js';
import { fetchOnlineList } from '../lib/presence.js';
import { getNotifications, markNotifShown } from '../lib/in-app-notifications.js';
import { supabase } from '../lib/supabase.js';
import { daysUntilExam } from '../lib/exam-mode.js';

export function render(container, { profile, socialProfile, unlockedSlugs, onOpenSubject, onGoCommunity }) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'hub';

  const greeting = socialProfile?.display_name?.trim() || profile?.full_name?.trim() || profile?.email || 'estudiante';
  wrap.innerHTML = `
    <h1>Hola, ${escapeHtml(greeting)}</h1>
    <div id="hub-notifs"></div>
    <div id="hub-online"></div>
    <p class="subtitle" style="margin: var(--space-3) 0 var(--space-4);">Elige una asignatura para empezar.</p>
    <div class="hub-grid"></div>
  `;
  container.appendChild(wrap);

  const grid = wrap.querySelector('.hub-grid');
  const unlockedSet = new Set(unlockedSlugs);

  // Render inicial sin metadata (placeholder rápido)
  const cardRefs = new Map();
  SUBJECTS.forEach((subject) => {
    const el = renderSubjectCard({
      subject,
      unlocked: unlockedSet.has(subject.slug),
      onOpen: onOpenSubject
    });
    grid.appendChild(el);
    cardRefs.set(subject.slug, el);
  });

  // Cargar exam_date + último simulacro por asignatura desbloqueada (en paralelo)
  if (profile?.id && unlockedSlugs?.length) {
    enrichSubjectCards(grid, cardRefs, unlockedSlugs, profile.id, onOpenSubject).catch(() => {});
  }

  // Notificaciones in-app
  if (profile?.id) {
    getNotifications(profile.id).then((notifs) => {
      const host = wrap.querySelector('#hub-notifs');
      notifs.forEach((n) => {
        const banner = document.createElement('div');
        banner.className = `inapp-notif inapp-notif--${n.tone}`;
        banner.innerHTML = `
          <span class="inapp-notif__icon">${n.icon}</span>
          <span class="inapp-notif__text">${escapeHtml(n.text)}</span>
          <button type="button" class="inapp-notif__close" aria-label="Cerrar">✕</button>
        `;
        banner.querySelector('.inapp-notif__close').addEventListener('click', () => {
          markNotifShown(n.id);
          banner.remove();
        });
        host.appendChild(banner);
        markNotifShown(n.id);
      });
    });
  }

  // Banner "X estudiando ahora"
  fetchOnlineList().then((list) => {
    const others = (list || []).filter((p) => !p.is_self);
    if (!others.length) return;
    const onlineEl = wrap.querySelector('#hub-online');
    const sample = others.slice(0, 3).map((p) => {
      const subj = SUBJECTS.find((s) => s.slug === p.subject)?.name || p.subject || '';
      return `${escapeHtml(p.display_name || 'Alguien')}${subj ? ' en ' + escapeHtml(subj) : ''}`;
    }).join(' · ');
    onlineEl.innerHTML = `
      <button type="button" class="hub-online-banner">
        <span class="dot dot--active"></span>
        <span><strong>${others.length}</strong> ${others.length === 1 ? 'compañero estudiando' : 'compañeros estudiando ahora'}</span>
        <span class="dim hub-online-banner__sample">${sample}</span>
        <span class="dim">→</span>
      </button>
    `;
    onlineEl.querySelector('button').addEventListener('click', () => onGoCommunity?.());
  }).catch(() => {});
}

async function enrichSubjectCards(grid, cardRefs, unlockedSlugs, userId, onOpenSubject) {
  const [{ data: subjectsMeta }, { data: lastExams }] = await Promise.all([
    supabase.from('subjects').select('slug, exam_date').in('slug', unlockedSlugs),
    supabase.from('exam_sessions')
      .select('subject_slug, score, finished_at')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .in('subject_slug', unlockedSlugs)
      .order('finished_at', { ascending: false })
  ]);

  const examDateBySlug = new Map((subjectsMeta || []).map((s) => [s.slug, s.exam_date]));
  const lastExamBySlug = new Map();
  for (const e of (lastExams || [])) {
    if (!lastExamBySlug.has(e.subject_slug)) {
      lastExamBySlug.set(e.subject_slug, { score: e.score, finishedAt: e.finished_at });
    }
  }

  for (const slug of unlockedSlugs) {
    const subject = SUBJECTS.find((s) => s.slug === slug);
    if (!subject) continue;
    const examDate = examDateBySlug.get(slug);
    const lastExam = lastExamBySlug.get(slug);
    const newCard = renderSubjectCard({
      subject,
      unlocked: true,
      onOpen: onOpenSubject,
      examDate,
      daysToExam: daysUntilExam(examDate),
      lastExam
    });
    const old = cardRefs.get(slug);
    if (old) old.replaceWith(newCard);
    cardRefs.set(slug, newCard);
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
