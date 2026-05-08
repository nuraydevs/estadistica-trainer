// Catch-all del simulacro de examen.
// Acciones: start | submit | finish | history | detail
// Una sola función serverless = 1 slot Vercel Hobby.

import { getAuthedUser, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';
import { ESTADISTICA_EXAM_BANK, pickExamQuestions, getExpectedSolution, publicQuestion } from '../_lib/exam-bank.js';
import { getSubjectMeta } from '../_lib/subjects-meta.js';

const MODEL = 'gemini-2.5-flash';
const MAX_OUTPUT = 4096;
const TEMPERATURE = 0.1;

// Límites diarios por usuario (anti-abuso de cuota Gemini)
const DAILY_LIMITS = {
  completo: 5,
  parcial: 20,
  panico: 20
};

const TIME_LIMITS = {
  completo: 120,
  parcial: 45,
  panico: 30
};

// Sólo el banco de Estadística existe por ahora
const BANKS = {
  estadistica: ESTADISTICA_EXAM_BANK
};

export default async function handler(req, res) {
  const action = String(
    req.query?.action ||
    req.url?.split('?')[0]?.split('/').pop() ||
    ''
  ).trim();

  const ctx = await getAuthedUser(req);
  if (ctx.error) return jsonReply(res, ctx.status, { error: ctx.error });

  try {
    if (action === 'start') return await startExam(req, res, ctx);
    if (action === 'submit') return await submitAnswer(req, res, ctx);
    if (action === 'finish') return await finishExam(req, res, ctx);
    if (action === 'history') return await getHistory(req, res, ctx);
    if (action === 'detail') return await getDetail(req, res, ctx);
    return jsonReply(res, 404, { error: 'unknown_action', action });
  } catch (err) {
    console.error(`[exam/${action}]`, err);
    return jsonReply(res, 500, { error: 'server_error', message: err.message });
  }
}

// ── start ────────────────────────────────────────────────────
async function startExam(req, res, { user, supabase }) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }

  const subject = String(body?.subject || '').trim();
  const examType = String(body?.examType || '').trim();
  if (!subject) return jsonReply(res, 400, { error: 'missing_subject' });
  if (!['completo', 'parcial', 'panico'].includes(examType)) return jsonReply(res, 400, { error: 'invalid_exam_type' });

  // Verificar acceso a la asignatura
  const { data: access } = await supabase
    .from('user_subjects')
    .select('subject_slug')
    .eq('user_id', user.id)
    .eq('subject_slug', subject)
    .maybeSingle();
  if (!access) return jsonReply(res, 403, { error: 'subject_locked' });

  // Circuit breaker diario
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const { data: todaySessions } = await supabase
    .from('exam_sessions')
    .select('exam_type, status')
    .eq('user_id', user.id)
    .gte('started_at', todayStart.toISOString());

  const todayCount = (todaySessions || []).filter((s) => s.exam_type === examType).length;
  const limit = DAILY_LIMITS[examType] || 5;
  const isAdmin = await checkAdmin(supabase, user.id);
  if (!isAdmin && todayCount >= limit) {
    return jsonReply(res, 429, {
      error: 'daily_limit',
      message: `Has hecho ${todayCount} simulacros tipo "${examType}" hoy. Vuelve mañana.`,
      limit
    });
  }

  // Banco
  const bank = BANKS[subject];
  if (!bank?.length) return jsonReply(res, 400, { error: 'no_bank_for_subject' });

  // Si hay sesión activa previa del mismo tipo, marcarla como abandoned
  await supabase
    .from('exam_sessions')
    .update({ status: 'abandoned', finished_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('subject_slug', subject)
    .eq('status', 'active');

  // Cargar perfil para "parcial"
  let profile = null;
  if (examType === 'parcial') {
    const { data } = await supabase
      .from('learning_profile')
      .select('concepts_weak, concepts_broken')
      .eq('user_id', user.id)
      .eq('subject_slug', subject)
      .maybeSingle();
    profile = data;
  }

  const questions = pickExamQuestions(examType, profile);
  if (!questions.length) return jsonReply(res, 500, { error: 'no_questions_available' });

  const timeLimit = TIME_LIMITS[examType];

  const { data: session, error: sessErr } = await supabase
    .from('exam_sessions')
    .insert({
      user_id: user.id,
      subject_slug: subject,
      exam_type: examType,
      time_limit_minutes: timeLimit,
      status: 'active',
      max_score: questions.reduce((s, q) => s + (q.points || 0), 0),
      metadata: { question_ids: questions.map((q) => q.id) }
    })
    .select()
    .single();
  if (sessErr) return jsonReply(res, 500, { error: 'db_error', message: sessErr.message });

  return jsonReply(res, 200, {
    sessionId: session.id,
    questions: questions.map(publicQuestion),
    timeLimitMinutes: timeLimit,
    startedAt: session.started_at,
    maxScore: session.max_score
  });
}

// ── submit ──────────────────────────────────────────────────
async function submitAnswer(req, res, { user, supabase }) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const sessionId = String(body?.sessionId || '');
  const questionId = String(body?.questionId || '');
  const userAnswer = String(body?.userAnswer || '');
  const timeSpent = Number(body?.timeSpent || 0);
  if (!sessionId || !questionId) return jsonReply(res, 400, { error: 'missing_data' });

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('id, user_id, subject_slug, status, metadata')
    .eq('id', sessionId)
    .maybeSingle();
  if (!session || session.user_id !== user.id) return jsonReply(res, 403, { error: 'forbidden' });
  if (session.status !== 'active') return jsonReply(res, 400, { error: 'not_active' });

  const ids = session.metadata?.question_ids || [];
  if (!ids.includes(questionId)) return jsonReply(res, 400, { error: 'question_not_in_session' });

  const bank = BANKS[session.subject_slug] || [];
  const question = bank.find((q) => q.id === questionId);

  await supabase.from('exam_answers').upsert({
    exam_session_id: sessionId,
    question_id: questionId,
    question_statement: question?.statement || null,
    user_answer: userAnswer,
    max_score: question?.points || 0,
    time_spent_seconds: Math.max(0, Math.round(timeSpent))
  }, { onConflict: 'exam_session_id,question_id' });

  return jsonReply(res, 200, { ok: true });
}

// ── finish ──────────────────────────────────────────────────
async function finishExam(req, res, { user, supabase }) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!GEMINI_KEY) return jsonReply(res, 500, { error: 'server_misconfigured' });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const sessionId = String(body?.sessionId || '');
  if (!sessionId) return jsonReply(res, 400, { error: 'missing_session' });

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('id, user_id, subject_slug, exam_type, status, max_score, metadata, started_at')
    .eq('id', sessionId)
    .maybeSingle();
  if (!session || session.user_id !== user.id) return jsonReply(res, 403, { error: 'forbidden' });
  if (session.status === 'finished') return jsonReply(res, 400, { error: 'already_finished' });

  const { data: answers } = await supabase
    .from('exam_answers')
    .select('id, question_id, user_answer, max_score, time_spent_seconds')
    .eq('exam_session_id', sessionId);

  const ids = session.metadata?.question_ids || [];
  const meta = getSubjectMeta(session.subject_slug);
  const bank = BANKS[session.subject_slug] || [];

  // Aseguramos que hay una entrada por pregunta esperada (aunque sea vacía)
  const answersByQ = new Map((answers || []).map((a) => [a.question_id, a]));
  for (const qid of ids) {
    if (!answersByQ.has(qid)) {
      const q = bank.find((x) => x.id === qid);
      const { data: ins } = await supabase.from('exam_answers').insert({
        exam_session_id: sessionId,
        question_id: qid,
        question_statement: q?.statement || null,
        user_answer: '',
        max_score: q?.points || 0,
        time_spent_seconds: 0
      }).select().single();
      answersByQ.set(qid, ins);
    }
  }

  // Corrección Gemini en paralelo
  const corrections = await Promise.all(ids.map((qid) =>
    correctOne(GEMINI_KEY, bank.find((x) => x.id === qid), answersByQ.get(qid), meta)
  ));

  // Persistir cada corrección
  let totalEarned = 0;
  let totalMax = 0;
  const conceptsToReview = new Set();

  for (let i = 0; i < ids.length; i++) {
    const qid = ids[i];
    const corr = corrections[i];
    const ans = answersByQ.get(qid);
    const earned = Number(corr.total_earned || 0);
    const max = Number(corr.total_max || ans?.max_score || 0);
    totalEarned += earned;
    totalMax += max;
    (corr.concepts_to_review || []).forEach((c) => conceptsToReview.add(String(c).trim()));

    await supabase.from('exam_answers').update({
      ai_correction: corr,
      score: earned,
      max_score: max
    }).eq('id', ans.id);
  }

  const normalized = totalMax > 0 ? Number(((totalEarned / totalMax) * 10).toFixed(2)) : 0;
  const verdict = classify(normalized);

  await supabase.from('exam_sessions').update({
    status: 'finished',
    finished_at: new Date().toISOString(),
    score: normalized,
    max_score: 10,
    metadata: { ...(session.metadata || {}), total_earned: totalEarned, total_max: totalMax, concepts_to_review: Array.from(conceptsToReview), verdict }
  }).eq('id', sessionId);

  // Actualiza learning_profile añadiendo conceptos a revisar como débiles
  if (conceptsToReview.size) {
    await mergeWeakConcepts(supabase, user.id, session.subject_slug, Array.from(conceptsToReview));
  }

  // Devolver resultado completo
  const enrichedAnswers = ids.map((qid, i) => {
    const ans = answersByQ.get(qid);
    const q = bank.find((x) => x.id === qid);
    return {
      questionId: qid,
      statement: q?.statement || ans?.question_statement || '',
      points: q?.points || ans?.max_score || 0,
      concept: q?.concept || '',
      userAnswer: ans?.user_answer || '',
      timeSpent: ans?.time_spent_seconds || 0,
      correction: corrections[i]
    };
  });

  return jsonReply(res, 200, {
    sessionId,
    score: normalized,
    totalEarned,
    totalMax,
    verdict,
    conceptsToReview: Array.from(conceptsToReview),
    answers: enrichedAnswers
  });
}

// ── history ─────────────────────────────────────────────────
async function getHistory(req, res, { user, supabase }) {
  if (req.method !== 'GET') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const subject = url.searchParams.get('subject');
  let q = supabase
    .from('exam_sessions')
    .select('id, subject_slug, exam_type, status, started_at, finished_at, score, max_score, metadata')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(50);
  if (subject) q = q.eq('subject_slug', subject);
  const { data, error } = await q;
  if (error) return jsonReply(res, 500, { error: 'db_error', message: error.message });
  const sessions = (data || []).map((s) => ({
    id: s.id,
    subject: s.subject_slug,
    examType: s.exam_type,
    status: s.status,
    startedAt: s.started_at,
    finishedAt: s.finished_at,
    score: s.score,
    maxScore: s.max_score,
    verdict: s.metadata?.verdict || null
  }));
  return jsonReply(res, 200, { sessions });
}

// ── detail ──────────────────────────────────────────────────
async function getDetail(req, res, { user, supabase }) {
  if (req.method !== 'GET') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return jsonReply(res, 400, { error: 'missing_session' });

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (!session) return jsonReply(res, 404, { error: 'not_found' });

  // Permitimos ver al usuario propietario o al admin
  const isOwn = session.user_id === user.id;
  let isAdmin = false;
  if (!isOwn) isAdmin = await checkAdmin(supabase, user.id);
  if (!isOwn && !isAdmin) return jsonReply(res, 403, { error: 'forbidden' });

  const { data: answers } = await supabase
    .from('exam_answers')
    .select('*')
    .eq('exam_session_id', sessionId)
    .order('created_at');

  const bank = BANKS[session.subject_slug] || [];
  const enriched = (answers || []).map((a) => {
    const q = bank.find((x) => x.id === a.question_id);
    return {
      ...a,
      concept: q?.concept || ''
    };
  });

  return jsonReply(res, 200, { session, answers: enriched });
}

// ── helpers ──────────────────────────────────────────────────

async function checkAdmin(supabase, userId) {
  const { data } = await supabase.from('users').select('is_admin').eq('id', userId).single();
  return !!data?.is_admin;
}

function classify(score) {
  if (score >= 9) return 'sobresaliente';
  if (score >= 7) return 'notable';
  if (score >= 5) return 'aprobado';
  return 'suspenso';
}

async function mergeWeakConcepts(supabase, userId, subject, newWeak) {
  const { data } = await supabase
    .from('learning_profile')
    .select('concepts_weak, concepts_broken')
    .eq('user_id', userId)
    .eq('subject_slug', subject)
    .maybeSingle();

  const broken = new Set((data?.concepts_broken || []).map((c) => (c.concept || c)));
  const existing = new Set((data?.concepts_weak || []).map((c) => (c.concept || c)));
  const merged = [...(data?.concepts_weak || [])];
  const now = new Date().toISOString();
  for (const c of newWeak) {
    if (!c || broken.has(c)) continue; // si ya está en rotos, no degradamos
    if (existing.has(c)) continue;
    merged.push({ concept: c, fail_count: 1, last_failed: now });
    existing.add(c);
  }

  if (data) {
    await supabase.from('learning_profile').update({
      concepts_weak: merged,
      updated_at: now
    }).eq('user_id', userId).eq('subject_slug', subject);
  } else {
    await supabase.from('learning_profile').insert({
      user_id: userId,
      subject_slug: subject,
      concepts_weak: merged,
      updated_at: now,
      last_study_date: now.slice(0, 10)
    });
  }
}

async function correctOne(geminiKey, question, answer, meta) {
  if (!question) {
    return emptyCorrection('Pregunta no encontrada en el banco.');
  }
  const expected = question.expectedSolution;
  const userAnswer = String(answer?.user_answer || '').trim();

  if (!userAnswer) {
    // En blanco: 0 puntos sin llamar a Gemini
    return {
      steps: [{ n: 1, title: 'Respuesta en blanco', status: 'error', feedback: 'No respondiste a este ejercicio.', earned: 0, max: question.points }],
      total_earned: 0,
      total_max: question.points,
      summary: 'En blanco. Sin desarrollo no hay puntos.',
      concepts_to_review: [question.concept].filter(Boolean),
      would_pass: false
    };
  }

  const prompt = buildCorrectionPrompt(question, userAnswer, expected, meta);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${geminiKey}`;
  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT,
      responseMimeType: 'application/json'
    }
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await r.json();
    if (!r.ok) {
      console.error('[correct] gemini error', r.status, json);
      return emptyCorrection(`Gemini error ${r.status}`);
    }
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || '';
    let parsed;
    try { parsed = JSON.parse(text); }
    catch (err) {
      console.warn('[correct] no JSON', text.slice(0, 200));
      return emptyCorrection('Respuesta de la IA no parseable');
    }
    // Validación mínima
    if (!Array.isArray(parsed.steps)) parsed.steps = [];
    parsed.total_earned = Number(parsed.total_earned || 0);
    parsed.total_max = Number(parsed.total_max || question.points);
    if (!Array.isArray(parsed.concepts_to_review)) parsed.concepts_to_review = [question.concept].filter(Boolean);
    if (!parsed.summary) parsed.summary = '';
    return parsed;
  } catch (err) {
    console.warn('[correct] fetch err', err);
    return emptyCorrection(err.message);
  }
}

function emptyCorrection(msg) {
  return {
    steps: [],
    total_earned: 0,
    total_max: 0,
    summary: `No se pudo corregir automáticamente: ${msg}`,
    concepts_to_review: [],
    would_pass: false
  };
}

function buildCorrectionPrompt(question, userAnswer, expected, meta) {
  const subjectName = meta?.name || 'la asignatura';
  const professor = meta?.professor && meta.professor.trim() ? meta.professor : 'el profesor';
  return `Eres un corrector de exámenes de ${subjectName} de la Universidad de Almería, asignatura impartida por ${professor}.
Corriges como lo haría el profesor real, basándote en el temario oficial.

PROCESO:
1. Identifica los pasos correctos que debería tener la solución.
2. Compara cada paso con la respuesta del alumno.
3. Para cada paso: marca CORRECT, ERROR o PARTIAL con explicación clara.
4. Calcula puntuación parcial por paso.
5. Suma la nota final del ejercicio.

CRITERIOS DE PUNTUACIÓN:
- Método incorrecto pero resultado por casualidad correcto: 0 puntos.
- Método correcto pero error aritmético: 70-80% de los puntos.
- Falta paso intermedio importante: 50% de los puntos de ese paso.
- Buen razonamiento incompleto: hasta 80% según desarrollo.

TONO:
- Directo y constructivo. Tutea siempre.
- Cuando hay error, explica EL PORQUÉ.
- Cuando va bien, confirma con una línea.
- Sin paja motivacional.

DEVUELVE SOLO JSON con esta estructura exacta (sin markdown, sin texto adicional):
{
  "steps": [
    { "n": 1, "title": "...", "status": "correct"|"error"|"partial", "feedback": "...", "earned": 0.5, "max": 0.5 }
  ],
  "total_earned": 1.5,
  "total_max": ${question.points},
  "summary": "qué hiciste bien y qué falló en 2-3 líneas",
  "concepts_to_review": ["..."],
  "would_pass": true | false
}

ENUNCIADO:
${question.statement}

CONCEPTO TRABAJADO: ${question.concept}
PUNTUACIÓN MÁXIMA: ${question.points} puntos

SOLUCIÓN ESPERADA (JSON):
${JSON.stringify(expected, null, 2)}

RESPUESTA DEL ALUMNO:
${userAnswer}

Devuelve SOLO el JSON.`;
}
