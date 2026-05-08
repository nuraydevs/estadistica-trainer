// GET  /api/social/profile           → perfil del usuario actual
// POST /api/social/profile  body:{display_name,bio,avatar_type,avatar_url,show_in_ranking,show_online_status}

import { getAuthedUser, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';
import { validateText } from '../_lib/word-filter.js';

const VALID_AVATAR_TYPES = new Set(['none', 'photo', 'generated']);

export default async function handler(req, res) {
  const { user, supabase, error, status } = await getAuthedUser(req);
  if (error) return jsonReply(res, status, { error });

  if (req.method === 'GET') {
    const { data, error: dbErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (dbErr) return jsonReply(res, 500, { error: 'db_error', message: dbErr.message });
    return jsonReply(res, 200, { profile: data });
  }

  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }

  const display_name = String(body?.display_name || '').trim();
  const bio = String(body?.bio || '').trim();
  const avatar_type = String(body?.avatar_type || 'none');
  const avatar_url = body?.avatar_url ? String(body.avatar_url).trim() : null;
  const show_in_ranking = body?.show_in_ranking !== false;
  const show_online_status = body?.show_online_status !== false;

  // Validaciones
  const nameErr = validateText(display_name, { maxLen: 40, allowEmpty: false });
  if (nameErr) return jsonReply(res, 400, { error: 'invalid_display_name', detail: nameErr });

  if (bio) {
    const bioErr = validateText(bio, { maxLen: 100, allowEmpty: true });
    if (bioErr) return jsonReply(res, 400, { error: 'invalid_bio', detail: bioErr });
  }

  if (!VALID_AVATAR_TYPES.has(avatar_type)) {
    return jsonReply(res, 400, { error: 'invalid_avatar_type' });
  }

  // Si avatar_type=photo, avatar_url debe ser una URL del bucket avatars
  if (avatar_type === 'photo' && avatar_url) {
    if (!/\/storage\/v1\/object\/public\/avatars\//.test(avatar_url)) {
      return jsonReply(res, 400, { error: 'invalid_avatar_url' });
    }
  }

  // No permitimos editar mientras avatar_banned
  const { data: current } = await supabase
    .from('user_profiles')
    .select('avatar_banned')
    .eq('user_id', user.id)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    display_name,
    bio: bio || null,
    avatar_type: current?.avatar_banned ? 'none' : avatar_type,
    avatar_url: current?.avatar_banned ? null : avatar_url,
    show_in_ranking,
    show_online_status,
    updated_at: new Date().toISOString()
  };

  const { data, error: upErr } = await supabase
    .from('user_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (upErr) return jsonReply(res, 500, { error: 'db_error', message: upErr.message });

  return jsonReply(res, 200, { profile: data });
}
