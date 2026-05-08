// POST /api/admin/refresh-community-stats   body: { subject? }
// Si subject viene, refresca esa asignatura. Si no, refresca todas las construidas.
// Llama a la función Postgres `refresh_community_stats(slug)`.

import { requireAdmin, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';

const SUBJECTS = ['estadistica', 'fisica', 'tecnologia', 'programacion-c', 'matematicas'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { supabase, error, status } = await requireAdmin(req);
  if (error) return jsonReply(res, status, { error });

  let body = {};
  try { body = await readJsonBody(req); } catch {}
  const target = body?.subject ? [String(body.subject)] : SUBJECTS;

  const results = {};
  for (const slug of target) {
    const { data, error: rpcErr } = await supabase.rpc('refresh_community_stats', { slug });
    if (rpcErr) {
      results[slug] = { error: rpcErr.message };
    } else {
      results[slug] = data || true;
    }
  }
  return jsonReply(res, 200, { ok: true, results });
}
