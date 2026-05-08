// POST /api/social/ranking
// body: { type: 'weekly_exercises'|'monthly_exercises'|'total_exercises'|'streak'|'exam_scores',
//         subject?: string, limit?: number=20 }
//
// Devuelve { entries: [...], me: {position, value} | null }

import { getAuthedUser, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { user, supabase, error, status } = await getAuthedUser(req);
  if (error) return jsonReply(res, status, { error });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }

  const type = String(body?.type || 'weekly_exercises');
  const subject = body?.subject ? String(body.subject) : null;
  const limit = Math.min(50, Math.max(1, parseInt(body?.limit, 10) || 20));

  const ranking = await buildRanking(supabase, type, subject);

  // Obtener valor del usuario actual para "me"
  let me = null;
  const meRow = ranking.find((r) => r.user_id === user.id);
  if (meRow) {
    me = {
      position: ranking.indexOf(meRow) + 1,
      value: meRow.value,
      display_name: meRow.display_name
    };
  }

  // Filtrar por show_in_ranking de los demás usuarios; "me" siempre cuenta
  const userIds = ranking.map((r) => r.user_id);
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, avatar_type, avatar_url, avatar_banned, show_in_ranking')
    .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);
  const profMap = new Map((profiles || []).map((p) => [p.user_id, p]));

  const visible = ranking.filter((r) => {
    if (r.user_id === user.id) return true;
    const p = profMap.get(r.user_id);
    if (!p) return false;
    return p.show_in_ranking !== false;
  });

  // Posición real (entre los visibles)
  if (me) {
    const visMe = visible.find((v) => v.user_id === user.id);
    if (visMe) me.position = visible.indexOf(visMe) + 1;
  }

  const entries = visible.slice(0, limit).map((r, i) => {
    const p = profMap.get(r.user_id) || {};
    return {
      position: i + 1,
      user_id: r.user_id,
      display_name: p.display_name || r.display_name || 'Anónimo',
      avatar_type: p.avatar_type || 'none',
      avatar_url: p.avatar_banned ? null : p.avatar_url || null,
      value: r.value,
      subject_slug: r.subject_slug || null,
      is_self: r.user_id === user.id
    };
  });

  return jsonReply(res, 200, { type, subject, entries, me });
}

async function buildRanking(supabase, type, subject) {
  if (type === 'streak') {
    let q = supabase.from('learning_profile').select('user_id, streak_days, subject_slug');
    if (subject) q = q.eq('subject_slug', subject);
    const { data } = await q;
    const map = new Map();
    (data || []).forEach((r) => {
      const prev = map.get(r.user_id) || 0;
      if ((r.streak_days || 0) > prev) map.set(r.user_id, r.streak_days || 0);
    });
    const arr = Array.from(map.entries())
      .map(([uid, v]) => ({ user_id: uid, value: v, subject_slug: subject }))
      .filter((r) => r.value > 0);
    arr.sort((a, b) => b.value - a.value);
    return arr;
  }

  if (type === 'exam_scores') {
    let q = supabase.from('exam_sessions').select('user_id, score, subject_slug').eq('status', 'finished');
    if (subject) q = q.eq('subject_slug', subject);
    const { data } = await q;
    const map = new Map();
    (data || []).forEach((r) => {
      const prev = map.get(r.user_id) || 0;
      if ((r.score || 0) > prev) map.set(r.user_id, r.score || 0);
    });
    const arr = Array.from(map.entries())
      .map(([uid, v]) => ({ user_id: uid, value: Number(v).toFixed(2), subject_slug: subject }))
      .filter((r) => Number(r.value) > 0);
    arr.sort((a, b) => Number(b.value) - Number(a.value));
    return arr;
  }

  // exercises (weekly / monthly / total)
  let since = null;
  if (type === 'weekly_exercises') since = new Date(Date.now() - 7 * 86400000).toISOString();
  else if (type === 'monthly_exercises') since = new Date(Date.now() - 30 * 86400000).toISOString();

  let q = supabase.from('exercise_attempts').select('user_id, subject_slug');
  if (subject) q = q.eq('subject_slug', subject);
  if (since) q = q.gte('attempted_at', since);
  const { data } = await q;
  const map = new Map();
  (data || []).forEach((r) => {
    map.set(r.user_id, (map.get(r.user_id) || 0) + 1);
  });
  const arr = Array.from(map.entries())
    .map(([uid, v]) => ({ user_id: uid, value: v, subject_slug: subject }));
  arr.sort((a, b) => b.value - a.value);
  return arr;
}
