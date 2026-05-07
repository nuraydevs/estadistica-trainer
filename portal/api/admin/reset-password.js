// POST /api/admin/reset-password
// body: { userId, password }
// Requiere admin. Cambia la contraseña del usuario.

import { requireAdmin, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { supabase, error, status } = await requireAdmin(req);
  if (error) return jsonReply(res, status, { error });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const userId = String(body?.userId || '').trim();
  const password = String(body?.password || '').trim();

  if (!userId) return jsonReply(res, 400, { error: 'missing_user' });
  if (!password || password.length < 6) return jsonReply(res, 400, { error: 'weak_password' });

  const { error: err } = await supabase.auth.admin.updateUserById(userId, { password });
  if (err) return jsonReply(res, 500, { error: 'update_failed', message: err.message });
  return jsonReply(res, 200, { ok: true });
}
