// Vercel serverless function: POST /api/tutor
//
// Body:   { question, subject, context, history: [{role, content}] }
// Header: Authorization: Bearer <supabase access_token>
// Devuelve: { answer, tokensUsed, questionsToday, dailyLimit, level }

import { createClient } from '@supabase/supabase-js';
import { getSubjectFiles } from './_lib/gemini-files.js';
import { buildSystemPrompt, analyzeHistory } from './_lib/prompts.js';

const MODEL = 'gemini-1.5-flash';
const MAX_OUTPUT_TOKENS = 600;
const TEMPERATURE = 0.2;

// Defaults si no hay fila en tutor_settings (o no se puede leer)
const DEFAULTS = {
  paused: false,
  daily_user_limit: 50,
  daily_global_limit: 800,
  alert_threshold_percent: 70
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'method_not_allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return json(res, 500, { error: 'server_misconfigured', message: 'Faltan variables Supabase en el servidor.' });
  }
  if (!GEMINI_KEY) {
    return json(res, 500, { error: 'server_misconfigured', message: 'Falta GEMINI_API_KEY / GOOGLE_AI_API_KEY.' });
  }

  // Auth
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return json(res, 401, { error: 'unauthorized' });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json(res, 401, { error: 'unauthorized', message: userErr?.message });
  }
  const user = userData.user;

  // Body
  let body;
  try { body = await readJson(req); } catch { return json(res, 400, { error: 'bad_json' }); }
  const question = String(body?.question || '').trim();
  const subject = String(body?.subject || '').trim();
  const context = String(body?.context || '').trim();
  const history = Array.isArray(body?.history) ? body.history.slice(-6) : [];

  if (!question) return json(res, 400, { error: 'missing_question' });
  if (!subject) return json(res, 400, { error: 'missing_subject' });

  // Settings (paused, límites)
  const settings = await loadSettings(supabase);

  // Verifica acceso
  const [{ data: subAccess, error: subErr }, { data: profile }] = await Promise.all([
    supabase.from('user_subjects').select('subject_slug').eq('user_id', user.id).eq('subject_slug', subject).maybeSingle(),
    supabase.from('users').select('is_admin').eq('id', user.id).single()
  ]);
  if (subErr) return json(res, 500, { error: 'db_error', message: subErr.message });
  if (!subAccess) return json(res, 403, { error: 'subject_locked', message: 'No tienes acceso a esta asignatura.' });
  const isAdmin = !!profile?.is_admin;

  // Pause toggle (no aplica a admin)
  if (settings.paused && !isAdmin) {
    return json(res, 503, {
      error: 'tutor_paused',
      message: 'El tutor está pausado por el administrador. Inténtalo más tarde.'
    });
  }

  // Circuit breaker — límite por usuario
  const today = new Date().toISOString().slice(0, 10);
  const { data: usageRow } = await supabase
    .from('tutor_usage')
    .select('questions_count, tokens_used')
    .eq('user_id', user.id)
    .eq('subject_slug', subject)
    .eq('date', today)
    .maybeSingle();
  const questionsToday = usageRow?.questions_count ?? 0;

  if (!isAdmin && questionsToday >= settings.daily_user_limit) {
    return json(res, 429, {
      error: 'LIMIT_USER',
      message: `Has usado tus ${settings.daily_user_limit} preguntas de hoy. Vuelve mañana — el límite se resetea a las 00:00.`,
      questionsToday,
      dailyLimit: settings.daily_user_limit
    });
  }

  // Circuit breaker — límite global del día
  const totalToday = await getTotalQuestionsToday(supabase, today);
  if (!isAdmin && totalToday >= settings.daily_global_limit) {
    await maybeLogAlert(supabase, {
      level: 'critical',
      message: `Tutor pausado automáticamente: límite global diario alcanzado (${totalToday}/${settings.daily_global_limit}).`,
      value: totalToday,
      threshold: settings.daily_global_limit
    });
    return json(res, 503, {
      error: 'LIMIT_GLOBAL',
      message: 'El tutor está descansando un momento. Inténtalo en unas horas.',
      totalToday,
      dailyGlobalLimit: settings.daily_global_limit
    });
  }

  // Alerta cuando cruzamos el threshold (ej. 70%)
  const thresholdValue = Math.floor((settings.daily_global_limit * settings.alert_threshold_percent) / 100);
  if (totalToday + 1 === thresholdValue || totalToday + 1 === Math.floor(settings.daily_global_limit * 0.9)) {
    const pct = Math.round(((totalToday + 1) / settings.daily_global_limit) * 100);
    await maybeLogAlert(supabase, {
      level: pct >= 90 ? 'critical' : 'warning',
      message: `Uso global del tutor al ${pct}% del límite (${totalToday + 1}/${settings.daily_global_limit}).`,
      value: totalToday + 1,
      threshold: settings.daily_global_limit
    });
  }

  // Carga PDFs (cache en memoria + Supabase)
  let files = [];
  try {
    files = await getSubjectFiles(supabase, GEMINI_KEY, subject);
  } catch (err) {
    console.error('[tutor] getSubjectFiles error', err);
  }

  // Carga learning_profile (memoria persistente del alumno)
  let profile = null;
  try {
    const { data } = await supabase
      .from('learning_profile')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject_slug', subject)
      .maybeSingle();
    profile = data || null;
  } catch (err) {
    console.warn('[tutor] no se pudo cargar profile', err);
  }

  // System prompt + análisis del historial + perfil persistente
  const insights = analyzeHistory(history, subject);
  const systemPrompt = buildSystemPrompt({ subjectSlug: subject, context, history, profile });

  // Contenido para Gemini
  const contents = [];
  for (const msg of history) {
    if (!msg?.role || !msg?.content) continue;
    contents.push({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(msg.content) }]
    });
  }
  const userParts = [];
  for (const f of files) {
    userParts.push({ file_data: { file_uri: f.file_uri, mime_type: f.mime_type } });
  }
  userParts.push({ text: question });
  contents.push({ role: 'user', parts: userParts });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      candidateCount: 1
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  let geminiJson;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    geminiJson = await r.json();
    if (!r.ok) {
      console.error('[tutor] gemini error', r.status, geminiJson);
      return json(res, 502, { error: 'gemini_error', message: geminiJson?.error?.message || 'Gemini falló.' });
    }
  } catch (err) {
    return json(res, 502, { error: 'gemini_unreachable', message: err.message });
  }

  const candidate = geminiJson?.candidates?.[0];
  const answer =
    candidate?.content?.parts?.map((p) => p.text || '').join('').trim() ||
    'No se obtuvo respuesta del tutor.';
  const usage = geminiJson?.usageMetadata || {};
  const tokensUsed = usage.totalTokenCount ?? 0;
  const inputTokens = usage.promptTokenCount ?? 0;
  const outputTokens = usage.candidatesTokenCount ?? 0;

  // Persist usage
  await supabase
    .from('tutor_usage')
    .upsert(
      {
        user_id: user.id,
        subject_slug: subject,
        date: today,
        questions_count: questionsToday + 1,
        tokens_used: (usageRow?.tokens_used ?? 0) + tokensUsed
      },
      { onConflict: 'user_id,subject_slug,date' }
    );

  // Persist conversation
  const newHistory = [
    ...history,
    { role: 'user', content: question, ts: new Date().toISOString() },
    { role: 'model', content: answer, ts: new Date().toISOString() }
  ].slice(-50);

  await supabase
    .from('tutor_conversations')
    .upsert(
      {
        user_id: user.id,
        subject_slug: subject,
        messages: newHistory,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,subject_slug' }
    );

  return json(res, 200, {
    answer,
    tokensUsed,
    inputTokens,
    outputTokens,
    questionsToday: questionsToday + 1,
    dailyLimit: isAdmin ? null : settings.daily_user_limit,
    level: insights.level
  });
}

// ── helpers ───────────────────────────────────────────────────

async function loadSettings(supabase) {
  try {
    const { data } = await supabase
      .from('tutor_settings')
      .select('paused, daily_user_limit, daily_global_limit, alert_threshold_percent')
      .eq('id', 'default')
      .maybeSingle();
    return { ...DEFAULTS, ...(data || {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

async function getTotalQuestionsToday(supabase, today) {
  try {
    const { data } = await supabase
      .from('tutor_usage')
      .select('questions_count')
      .eq('date', today);
    return (data ?? []).reduce((acc, r) => acc + (r.questions_count || 0), 0);
  } catch (err) {
    console.warn('[tutor] getTotalQuestionsToday error', err);
    return 0;
  }
}

async function maybeLogAlert(supabase, alert) {
  try {
    // Evita duplicar alertas en cortos intervalos: misma message en últimos 30 min
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from('tutor_alerts')
      .select('id')
      .eq('message', alert.message)
      .gte('created_at', cutoff)
      .maybeSingle();
    if (recent) return;
    await supabase.from('tutor_alerts').insert(alert);
  } catch (err) {
    console.warn('[tutor] alert insert failed', err);
  }
}

function json(res, status, body) {
  if (typeof res.status === 'function') {
    return res.status(status).json(body);
  }
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}
