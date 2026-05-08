// POST /api/admin/moderate
// body: { userId, action: 'avatar_banned'|'user_banned'|'avatar_cleared'|'user_unbanned'|'warning_issued', reason? }

import { requireAdmin, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';

const ACTIONS = new Set(['avatar_banned', 'user_banned', 'avatar_cleared', 'user_unbanned', 'warning_issued']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { user: admin, supabase, error, status } = await requireAdmin(req);
  if (error) return jsonReply(res, status, { error });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const userId = String(body?.userId || '');
  const action = String(body?.action || '');
  const reason = body?.reason ? String(body.reason).slice(0, 500) : null;

  if (!userId || !ACTIONS.has(action)) {
    return jsonReply(res, 400, { error: 'bad_request' });
  }

  // Aplicar la acción
  const now = new Date().toISOString();
  if (action === 'avatar_banned') {
    await supabase.from('user_profiles').update({
      avatar_banned: true,
      avatar_type: 'none',
      avatar_url: null,
      ban_reason: reason,
      warned_at: now
    }).eq('user_id', userId);
  } else if (action === 'avatar_cleared') {
    await supabase.from('user_profiles').update({
      avatar_banned: false,
      ban_reason: null
    }).eq('user_id', userId);
  } else if (action === 'user_banned') {
    await supabase.from('users').update({ active: false }).eq('id', userId);
  } else if (action === 'user_unbanned') {
    await supabase.from('users').update({ active: true }).eq('id', userId);
  } else if (action === 'warning_issued') {
    await supabase.from('user_profiles').update({ warned_at: now, ban_reason: reason }).eq('user_id', userId);
  }

  // Log
  await supabase.from('moderation_log').insert({
    user_id: userId,
    admin_id: admin.id,
    action,
    reason
  });

  return jsonReply(res, 200, { ok: true });
}
