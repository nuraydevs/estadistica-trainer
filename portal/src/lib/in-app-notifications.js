// Notificaciones in-app: solo se muestran al abrir la app, máx 1 por día.
// Almacena en localStorage qué se ha mostrado para no repetir.

import { supabase } from './supabase.js';

const STORAGE_KEY = 'portal-inapp-notif-v1';

function getShownToday() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return parsed.date === today ? parsed.shown : {};
  } catch { return {}; }
}

function markShown(key) {
  const today = new Date().toISOString().slice(0, 10);
  const shown = getShownToday();
  shown[key] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, shown }));
}

export async function getNotifications(userId) {
  const out = [];
  const shownToday = getShownToday();

  try {
    const { data: profiles } = await supabase
      .from('learning_profile')
      .select('subject_slug, streak_days, last_study_date')
      .eq('user_id', userId);

    if (profiles?.length) {
      // Mejor racha
      const top = profiles.reduce((a, b) => (a.streak_days || 0) > (b.streak_days || 0) ? a : b, profiles[0]);
      const streak = top.streak_days || 0;

      if (streak >= 3 && !shownToday['streak-active']) {
        out.push({
          id: 'streak-active',
          icon: '🔥',
          text: `${streak} días seguidos · No la rompas`,
          tone: 'accent'
        });
      }

      // Racha rota: si last_study_date es ayer-1 o más
      if (top.last_study_date) {
        const days = Math.floor((Date.now() - new Date(top.last_study_date).getTime()) / 86400000);
        if (days >= 2 && streak >= 3 && !shownToday['streak-broken']) {
          out.push({
            id: 'streak-broken',
            icon: '⏸',
            text: `Rompiste tu racha de ${streak} días. Hoy es buen día para volver.`,
            tone: 'warning'
          });
        }
      }
    }

    // ¿Alguien me superó esta semana?
    if (!shownToday['ranking-passed']) {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: attempts } = await supabase
        .from('exercise_attempts')
        .select('user_id')
        .gte('attempted_at', since);
      const counter = new Map();
      (attempts || []).forEach((a) => counter.set(a.user_id, (counter.get(a.user_id) || 0) + 1));
      const my = counter.get(userId) || 0;
      const above = Array.from(counter.entries()).filter(([uid, n]) => uid !== userId && n > my);
      if (above.length && my > 0) {
        const userIds = above.slice(0, 3).map(([uid]) => uid);
        const { data: profs } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, show_in_ranking')
          .in('user_id', userIds);
        const visible = (profs || []).filter((p) => p.show_in_ranking !== false);
        if (visible.length) {
          out.push({
            id: 'ranking-passed',
            icon: '📈',
            text: `${visible[0].display_name} te ha superado en el ranking semanal.`,
            tone: 'accent'
          });
        }
      }
    }
  } catch (err) {
    console.warn('[notif] error', err);
  }

  return out;
}

export function markNotifShown(id) {
  markShown(id);
}
