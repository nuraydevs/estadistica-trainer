// POST /api/social/insights  body: { subject }
// Devuelve top 5 conceptos más fallados (mín 3 intentos comunidad).

import { getAuthedUser, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { supabase, error, status } = await getAuthedUser(req);
  if (error) return jsonReply(res, status, { error });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const subject = String(body?.subject || '').trim();
  if (!subject) return jsonReply(res, 400, { error: 'missing_subject' });

  // Cache: leer community_stats
  const { data: cached } = await supabase
    .from('community_stats')
    .select('hardest_exercises, updated_at, active_users_today')
    .eq('subject_slug', subject)
    .maybeSingle();

  const fresh = cached && (Date.now() - new Date(cached.updated_at).getTime()) < 60 * 60 * 1000;
  if (fresh) {
    return jsonReply(res, 200, { hardest: cached.hardest_exercises || [], cached: true });
  }

  // Recalcular
  const { data: attempts } = await supabase
    .from('exercise_attempts')
    .select('concept, result')
    .eq('subject_slug', subject);

  const map = new Map();
  for (const a of (attempts || [])) {
    if (!a.concept) continue;
    const c = a.concept.trim();
    if (!c) continue;
    if (!map.has(c)) map.set(c, { total: 0, failed: 0 });
    const e = map.get(c);
    e.total += 1;
    if (a.result !== 'correct') e.failed += 1;
  }
  const hardest = Array.from(map.entries())
    .filter(([, e]) => e.total >= 3)
    .map(([concept, e]) => ({
      concept,
      fail_rate: Math.round((e.failed / e.total) * 100),
      total_attempts: e.total
    }))
    .sort((a, b) => b.fail_rate - a.fail_rate)
    .slice(0, 5);

  // Active today
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const { data: todayActive } = await supabase
    .from('exercise_attempts')
    .select('user_id', { count: 'exact', head: false })
    .eq('subject_slug', subject)
    .gte('attempted_at', todayStart.toISOString());
  const activeUsersToday = new Set((todayActive || []).map((a) => a.user_id)).size;

  await supabase.from('community_stats').upsert({
    subject_slug: subject,
    hardest_exercises: hardest,
    active_users_today: activeUsersToday,
    updated_at: new Date().toISOString()
  }, { onConflict: 'subject_slug' });

  return jsonReply(res, 200, { hardest, cached: false, activeUsersToday });
}
