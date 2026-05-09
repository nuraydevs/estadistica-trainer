// Catch-all admin endpoint: /api/admin/<action>
// Routea internamente a la lógica de cada operación.
// Vercel cuenta esto como UNA sola función serverless (Hobby: 12 max).

import { requireAdmin, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ACTIONS = new Set([
  'create-user', 'reset-password', 'moderate',
  'extract-material', 'learning-stats', 'refresh-community-stats'
]);

const MOD_ACTIONS = new Set(['avatar_banned', 'user_banned', 'avatar_cleared', 'user_unbanned', 'warning_issued']);

export default async function handler(req, res) {
  const action = String(
    (req.query?.action) ||
    (req.url?.split('?')[0]?.split('/').pop()) ||
    ''
  ).trim();

  if (!ACTIONS.has(action)) {
    return jsonReply(res, 404, { error: 'unknown_action', action });
  }

  if (action === 'learning-stats') {
    if (req.method !== 'GET') return jsonReply(res, 405, { error: 'method_not_allowed' });
  } else {
    if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  }

  const ctx = await requireAdmin(req);
  if (ctx.error) return jsonReply(res, ctx.status, { error: ctx.error });

  try {
    if (action === 'create-user') return await createUser(req, res, ctx);
    if (action === 'reset-password') return await resetPassword(req, res, ctx);
    if (action === 'moderate') return await moderate(req, res, ctx);
    if (action === 'extract-material') return await extractMaterial(req, res, ctx);
    if (action === 'learning-stats') return await learningStats(req, res, ctx);
    if (action === 'refresh-community-stats') return await refreshCommunityStats(req, res, ctx);
  } catch (err) {
    console.error(`[admin/${action}]`, err);
    return jsonReply(res, 500, { error: 'internal', message: err.message });
  }
}

// ── create-user ─────────────────────────────────────────────
async function createUser(req, res, { user: admin, supabase }) {
  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const email = String(body?.email || '').trim().toLowerCase();
  const fullName = String(body?.fullName || '').trim();
  const password = String(body?.password || '').trim();
  const subjects = Array.isArray(body?.subjects) ? body.subjects.map(String) : [];
  const payment = body?.payment && typeof body.payment === 'object' ? body.payment : null;

  if (!email) return jsonReply(res, 400, { error: 'missing_email' });
  if (!password || password.length < 6) return jsonReply(res, 400, { error: 'weak_password' });

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName }
  });

  let userId;
  if (createErr) {
    if (!/already registered|already been registered|exists/i.test(createErr.message)) {
      return jsonReply(res, 400, { error: 'create_failed', message: createErr.message });
    }
    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list.users.find((u) => u.email === email);
    if (!found) return jsonReply(res, 500, { error: 'lookup_failed' });
    userId = found.id;
  } else {
    userId = created.user.id;
  }

  await supabase.from('users').upsert(
    { id: userId, email, full_name: fullName, active: true, is_admin: false },
    { onConflict: 'id' }
  );

  if (subjects.length) {
    await supabase.from('user_subjects').upsert(
      subjects.map((slug) => ({ user_id: userId, subject_slug: slug, granted_by: admin.id })),
      { onConflict: 'user_id,subject_slug' }
    );
  }

  if (payment && Number.isFinite(Number(payment.amount))) {
    await supabase.from('payments').insert({
      user_id: userId,
      amount: Number(payment.amount),
      payment_method: String(payment.method || 'efectivo'),
      notes: payment.notes ? String(payment.notes) : null,
      subject_slug: subjects[0] || null,
      registered_by: admin.id
    });
  }

  return jsonReply(res, 200, { id: userId, email, fullName });
}

// ── reset-password ──────────────────────────────────────────
async function resetPassword(req, res, { supabase }) {
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

// ── moderate ────────────────────────────────────────────────
async function moderate(req, res, { user: admin, supabase }) {
  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const userId = String(body?.userId || '');
  const action = String(body?.action || '');
  const reason = body?.reason ? String(body.reason).slice(0, 500) : null;
  if (!userId || !MOD_ACTIONS.has(action)) return jsonReply(res, 400, { error: 'bad_request' });

  const now = new Date().toISOString();
  if (action === 'avatar_banned') {
    await supabase.from('user_profiles').update({
      avatar_banned: true, avatar_type: 'none', avatar_url: null, ban_reason: reason, warned_at: now
    }).eq('user_id', userId);
  } else if (action === 'avatar_cleared') {
    await supabase.from('user_profiles').update({ avatar_banned: false, ban_reason: null }).eq('user_id', userId);
  } else if (action === 'user_banned') {
    await supabase.from('users').update({ active: false }).eq('id', userId);
  } else if (action === 'user_unbanned') {
    await supabase.from('users').update({ active: true }).eq('id', userId);
  } else if (action === 'warning_issued') {
    await supabase.from('user_profiles').update({ warned_at: now, ban_reason: reason }).eq('user_id', userId);
  }

  await supabase.from('moderation_log').insert({ user_id: userId, admin_id: admin.id, action, reason });
  return jsonReply(res, 200, { ok: true });
}

// ── extract-material ────────────────────────────────────────
async function extractMaterial(req, res, { supabase }) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!GEMINI_KEY) return jsonReply(res, 500, { error: 'server_misconfigured' });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const materialId = String(body?.materialId || '').trim();
  if (!materialId) return jsonReply(res, 400, { error: 'missing_material' });

  const { data: material } = await supabase
    .from('subject_materials')
    .select('id, subject_slug, type, tema, title, pdf_storage_path')
    .eq('id', materialId)
    .maybeSingle();
  if (!material) return jsonReply(res, 404, { error: 'not_found' });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const fname = path.basename(material.pdf_storage_path);
  const candidates = [];
  for (let t = 1; t <= 5; t++) {
    candidates.push(path.resolve(__dirname, '..', '..', '.temario', material.subject_slug, `Tema ${t}`, fname));
    candidates.push(path.resolve(__dirname, '..', '..', '.temario', material.subject_slug, `Tema ${t} `, fname));
  }
  let pdfBuf = null;
  for (const c of candidates) {
    try { pdfBuf = await readFile(c); break; } catch {}
  }
  if (!pdfBuf) {
    try {
      const { data, error: dlErr } = await supabase.storage.from('temario').download(material.pdf_storage_path);
      if (dlErr) throw dlErr;
      pdfBuf = Buffer.from(await data.arrayBuffer());
    } catch (err) {
      return jsonReply(res, 404, { error: 'pdf_unreachable', message: err.message });
    }
  }

  const PROMPT = `Eres un extractor académico. Convierte este PDF universitario en HTML estructurado COMPLETO.

REGLAS INNEGOCIABLES:
1. NO resumas. Incluye TODO el contenido del PDF.
2. NO omitas diapositivas, páginas ni secciones.
3. Mantén el orden original.
4. Incluye TODOS los ejemplos, ejercicios resueltos, fórmulas y tablas.
5. Fórmulas: conviértelas a LaTeX entre $...$ inline o $$...$$ bloque.
6. Tablas: HTML <table> con <thead> y <tbody>.
7. Títulos: <h2>/<h3>/<h4>. Conceptos: <strong>. Definiciones: <blockquote>.
8. Ejercicios resueltos: <div class="ejemplo-resuelto">...</div>.
9. Notas: <aside>...</aside>.

FORMATO: solo HTML del contenido (sin <!DOCTYPE>, <html>, <head>, <body>).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: 'application/pdf', data: pdfBuf.toString('base64') } }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 32768 }
  };

  let json;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    json = await r.json();
    if (!r.ok) return jsonReply(res, 502, { error: 'gemini_error', message: json?.error?.message });
  } catch (err) {
    return jsonReply(res, 502, { error: 'gemini_unreachable', message: err.message });
  }

  const html = json.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || '';
  if (!html) return jsonReply(res, 502, { error: 'empty_response' });

  await supabase.from('subject_materials').update({
    html_content: html,
    last_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', materialId);

  return jsonReply(res, 200, { ok: true, htmlLength: html.length });
}

// ── learning-stats ──────────────────────────────────────────
async function learningStats(req, res, { supabase }) {
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

  const sessionsQuery = supabase
    .from('sessions')
    .select('subject_slug, started_at, last_seen_at, ip_address')
    .eq('user_id', userId)
    .gte('started_at', since)
    .order('started_at', { ascending: false })
    .limit(50);

  const [{ data: profiles }, { data: attempts }, { data: sessions }] = await Promise.all([
    profileQuery, attemptsQuery, sessionsQuery
  ]);

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

  const valid = (attempts || []).filter((a) => a.time_spent_seconds > 0 && a.time_spent_seconds < 1800);
  const avgTime = valid.length ? Math.round(valid.reduce((s, a) => s + a.time_spent_seconds, 0) / valid.length) : 0;

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
    summary, days,
    avg_time_seconds: avgTime,
    recent_attempts: (attempts || []).slice(0, 50),
    recent_sessions: sessions || []
  });
}

// ── refresh-community-stats ─────────────────────────────────
async function refreshCommunityStats(req, res, { supabase }) {
  let body = {};
  try { body = await readJsonBody(req); } catch {}
  const target = body?.subject ? [String(body.subject)]
    : ['estadistica', 'fisica', 'tecnologia', 'programacion-c', 'matematicas'];

  const results = {};
  for (const slug of target) {
    const { data, error: rpcErr } = await supabase.rpc('refresh_community_stats', { slug });
    results[slug] = rpcErr ? { error: rpcErr.message } : (data || true);
  }

  // Limpieza de presencia stale (>30 min sin ping)
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { error: delErr, count: deleted } = await supabase
    .from('online_presence')
    .delete({ count: 'exact' })
    .lt('last_seen', cutoff);
  if (delErr) results._presence_cleanup = { error: delErr.message };
  else results._presence_cleanup = { deleted: deleted ?? 0, cutoff };

  return jsonReply(res, 200, { ok: true, results });
}
