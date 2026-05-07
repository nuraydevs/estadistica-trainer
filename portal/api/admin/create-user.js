// POST /api/admin/create-user
// body: { email, fullName, password, subjects: [slug...], payment?: { amount, method, notes } }
// Requiere admin. Crea usuario en auth, espejo en users (admin=false), desbloquea
// asignaturas y registra el pago si llega.

import { requireAdmin, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { user: admin, supabase, error, status } = await requireAdmin(req);
  if (error) return jsonReply(res, status, { error });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const email = String(body?.email || '').trim().toLowerCase();
  const fullName = String(body?.fullName || '').trim();
  const password = String(body?.password || '').trim();
  const subjects = Array.isArray(body?.subjects) ? body.subjects.map(String) : [];
  const payment = body?.payment && typeof body.payment === 'object' ? body.payment : null;

  if (!email) return jsonReply(res, 400, { error: 'missing_email' });
  if (!password || password.length < 6) return jsonReply(res, 400, { error: 'weak_password' });

  // Crear en auth
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  let userId;
  if (createErr) {
    if (!/already registered|already been registered|exists/i.test(createErr.message)) {
      return jsonReply(res, 400, { error: 'create_failed', message: createErr.message });
    }
    // Usuario ya existe: lo recuperamos
    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list.users.find((u) => u.email === email);
    if (!found) return jsonReply(res, 500, { error: 'lookup_failed' });
    userId = found.id;
  } else {
    userId = created.user.id;
  }

  // Espejo en public.users
  await supabase.from('users').upsert(
    { id: userId, email, full_name: fullName, active: true, is_admin: false },
    { onConflict: 'id' }
  );

  // Asignaturas
  if (subjects.length) {
    const rows = subjects.map((slug) => ({
      user_id: userId,
      subject_slug: slug,
      granted_by: admin.id
    }));
    await supabase.from('user_subjects').upsert(rows, { onConflict: 'user_id,subject_slug' });
  }

  // Pago (si lo hay) — un único registro con subject_slug puesto al primer slug si hay varios
  if (payment && Number.isFinite(Number(payment.amount))) {
    const slug = subjects[0] || null;
    await supabase.from('payments').insert({
      user_id: userId,
      amount: Number(payment.amount),
      payment_method: String(payment.method || 'efectivo'),
      notes: payment.notes ? String(payment.notes) : null,
      subject_slug: slug,
      registered_by: admin.id
    });
  }

  return jsonReply(res, 200, { id: userId, email, fullName });
}
