// POST /api/social/presence   action: 'track' | 'untrack' | 'list'
//   track   body: { subject, section }   → upsert en online_presence
//   untrack body: {}                      → delete fila
//   list    body: { subject? }            → devuelve lista de online (last_seen <2min)

import { getAuthedUser, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { user, supabase, error, status } = await getAuthedUser(req);
  if (error) return jsonReply(res, status, { error });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const action = String(body?.action || 'track');

  if (action === 'track') {
    const subject = String(body?.subject || '').trim() || null;
    const section = String(body?.section || '').trim() || null;
    const { error: err } = await supabase
      .from('online_presence')
      .upsert({
        user_id: user.id,
        subject_slug: subject,
        current_section: section,
        is_visible: true,
        last_seen: new Date().toISOString()
      }, { onConflict: 'user_id' });
    if (err) return jsonReply(res, 500, { error: 'db_error', message: err.message });
    return jsonReply(res, 200, { ok: true });
  }

  if (action === 'untrack') {
    await supabase.from('online_presence').delete().eq('user_id', user.id);
    return jsonReply(res, 200, { ok: true });
  }

  if (action === 'list') {
    const subject = body?.subject ? String(body.subject) : null;
    const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();
    let q = supabase
      .from('online_presence')
      .select('user_id, subject_slug, current_section, last_seen, is_visible')
      .gte('last_seen', cutoff)
      .eq('is_visible', true);
    if (subject) q = q.eq('subject_slug', subject);

    const { data: presence, error: pErr } = await q;
    if (pErr) return jsonReply(res, 500, { error: 'db_error', message: pErr.message });

    if (!presence?.length) return jsonReply(res, 200, { online: [] });

    const userIds = presence.map((p) => p.user_id);
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_type, avatar_url, avatar_banned, show_online_status')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
    const online = presence
      .filter((p) => {
        const pr = profileMap.get(p.user_id);
        if (!pr) return p.user_id === user.id; // sin perfil sólo se ve a sí mismo
        return pr.show_online_status !== false || p.user_id === user.id;
      })
      .map((p) => {
        const pr = profileMap.get(p.user_id) || {};
        return {
          user_id: p.user_id,
          subject: p.subject_slug,
          section: p.current_section,
          last_seen: p.last_seen,
          is_self: p.user_id === user.id,
          display_name: pr.display_name || null,
          avatar_type: pr.avatar_type || 'none',
          avatar_url: pr.avatar_banned ? null : pr.avatar_url || null
        };
      });

    return jsonReply(res, 200, { online });
  }

  return jsonReply(res, 400, { error: 'bad_action' });
}
