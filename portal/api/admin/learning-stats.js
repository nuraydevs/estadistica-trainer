// GET /api/admin/learning-stats?userId=…&subject=…
// Devuelve perfil completo + actividad de los últimos 14 días + intentos detallados.
// Solo admins.

import { requireAdmin, jsonReply } from '../_lib/auth-helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { supabase, error, status } = await requireAdmin(req);
  if (error) return jsonReply(res, status, { error });

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const userId = url.searchParams.get('userId');
  const subject = url.searchParams.get('subject');
  if (!userId) return jsonReply(res, 400, { error: 'missing_user' });

  const since = new Date(Date.now() - 14 * 86400000).toISOString();

  let profileQuery = supabase.from('learning_profile').select('*').eq('user_id', userId);
  if (subject) profileQuery = profileQuery.eq('subject_slug', subject);

  let attemptsQuery = supabase
    .from('exercise_attempts')
    .select('exercise_id, concept, result, hints_used, time_spent_seconds, attempted_at, subject_slug')
    .eq('user_id', userId)
    .gte('attempted_at', since)
    .order('attempted_at', { ascending: false });
  if (subject) attemptsQuery = attemptsQuery.eq('subject_slug', subject);

  let sessionsQuery = supabase
    .from('sessions')
    .select('subject_slug, started_at, last_seen_at, ip_address')
    .eq('user_id', userId)
    .gte('started_at', since)
    .order('started_at', { ascending: false })
    .limit(50);

  const [{ data: profiles }, { data: attempts }, { data: sessions }] = await Promise.all([
    profileQuery,
    attemptsQuery,
    sessionsQuery
  ]);

  // Heatmap por día
  const days = [];
  const byDay = new Map();
  for (const a of (attempts || [])) {
    const d = a.attempted_at.slice(0, 10);
    if (!byDay.has(d)) byDay.set(d, { total: 0, correct: 0, failed: 0 });
    const e = byDay.get(d);
    e.total += 1;
    if (a.result === 'correct') e.correct += 1; else e.failed += 1;
  }
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, ...(byDay.get(key) || { total: 0, correct: 0, failed: 0 }) });
  }

  // Tiempo medio por ejercicio
  const valid = (attempts || []).filter((a) => a.time_spent_seconds > 0 && a.time_spent_seconds < 1800);
  const avgTime = valid.length ? Math.round(valid.reduce((s, a) => s + a.time_spent_seconds, 0) / valid.length) : 0;

  // Tasa de éxito global por asignatura (de los profiles)
  const summary = (profiles || []).map((p) => {
    const total = (p.total_exercises_done || 0) + (p.total_exercises_failed || 0);
    return {
      subject_slug: p.subject_slug,
      streak_days: p.streak_days || 0,
      total_attempts: total,
      success_rate: total > 0 ? Math.round((p.total_exercises_done || 0) / total * 100) : 0,
      best_hour: p.best_hour,
      last_study_date: p.last_study_date,
      concepts_mastered: p.concepts_mastered || [],
      concepts_weak: p.concepts_weak || [],
      concepts_broken: p.concepts_broken || []
    };
  });

  return jsonReply(res, 200, {
    summary,
    days,
    avg_time_seconds: avgTime,
    recent_attempts: (attempts || []).slice(0, 50),
    recent_sessions: sessions || []
  });
}
