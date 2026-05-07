// POST /api/correct-exam
// Corrige un examen entero con Gemini, guarda en exam_answers,
// actualiza nota total en exam_sessions y feedea conceptos al learning_profile.
//
// body: { examSessionId, answers: [{ questionId, question, userAnswer, maxScore }] }

import { getAuthedUser, jsonReply, readJsonBody } from './_lib/auth-helpers.js';
import { getSubjectFiles } from './_lib/gemini-files.js';
import { getSubjectMeta } from './_lib/subjects-meta.js';

const MODEL = 'gemini-1.5-flash';
const TEMPERATURE = 0.1;
const MAX_OUTPUT_TOKENS = 1500;

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });

  const { user, supabase, error, status } = await getAuthedUser(req);
  if (error) return jsonReply(res, status, { error });

  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!GEMINI_KEY) return jsonReply(res, 500, { error: 'server_misconfigured' });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const examSessionId = String(body?.examSessionId || '');
  const answers = Array.isArray(body?.answers) ? body.answers : [];
  if (!examSessionId || !answers.length) {
    return jsonReply(res, 400, { error: 'missing_data' });
  }

  // Cargar la sesión y verificar ownership
  const { data: session } = await supabase
    .from('exam_sessions')
    .select('id, user_id, subject_slug, exam_type, status')
    .eq('id', examSessionId)
    .maybeSingle();
  if (!session || session.user_id !== user.id) {
    return jsonReply(res, 403, { error: 'forbidden' });
  }
  if (session.status === 'finished') {
    return jsonReply(res, 400, { error: 'already_finished' });
  }

  const subject = session.subject_slug;
  const meta = getSubjectMeta(subject);

  // Cargar PDFs del temario para que Gemini sepa la solución correcta
  let files = [];
  try {
    files = await getSubjectFiles(supabase, GEMINI_KEY, subject);
  } catch (err) {
    console.error('[correct-exam] getSubjectFiles', err);
  }

  // Llamada única a Gemini con todos los ejercicios
  const systemPrompt = buildSystemPrompt(meta, answers.length);
  const userText = buildUserText(answers);

  const parts = [];
  for (const f of files) {
    parts.push({ file_data: { file_uri: f.file_uri, mime_type: f.mime_type } });
  }
  parts.push({ text: userText });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      responseMimeType: 'application/json'
    }
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
      console.error('[correct-exam] gemini error', r.status, geminiJson);
      return jsonReply(res, 502, { error: 'gemini_error', message: geminiJson?.error?.message });
    }
  } catch (err) {
    return jsonReply(res, 502, { error: 'gemini_unreachable', message: err.message });
  }

  const candidate = geminiJson?.candidates?.[0];
  const rawText = candidate?.content?.parts?.map((p) => p.text || '').join('').trim() || '';
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error('[correct-exam] no JSON', rawText.slice(0, 300));
    return jsonReply(res, 502, { error: 'bad_correction_format' });
  }

  // parsed = { corrections: [{ questionId, steps, total_earned, total_max, summary, concepts_to_review, exam_verdict }] }
  const corrections = Array.isArray(parsed.corrections) ? parsed.corrections : [];
  const indexById = new Map(corrections.map((c) => [c.questionId, c]));

  let totalEarned = 0;
  let totalMax = 0;
  const conceptsToReview = new Set();

  // Persist exam_answers
  for (const a of answers) {
    const corr = indexById.get(a.questionId) || {
      steps: [], total_earned: 0, total_max: a.maxScore || 0,
      summary: 'Sin corrección.', concepts_to_review: [], exam_verdict: 'sin_evaluar'
    };
    const earned = Number(corr.total_earned || 0);
    const max = Number(corr.total_max || a.maxScore || 0);
    totalEarned += earned;
    totalMax += max;
    (corr.concepts_to_review || []).forEach((c) => conceptsToReview.add(String(c)));

    await supabase.from('exam_answers').insert({
      exam_session_id: examSessionId,
      question_id: a.questionId,
      question_statement: a.question,
      user_answer: a.userAnswer,
      ai_correction: corr,
      score: earned,
      max_score: max,
      time_spent_seconds: Number(a.timeSpentSeconds || 0)
    });
  }

  // Actualizar exam_sessions con nota final
  const finalScore = totalMax > 0 ? Number(((totalEarned / totalMax) * 10).toFixed(2)) : 0;
  await supabase.from('exam_sessions').update({
    finished_at: new Date().toISOString(),
    status: 'finished',
    score: finalScore,
    max_score: 10,
    metadata: {
      total_earned: totalEarned,
      total_max: totalMax,
      concepts_to_review: Array.from(conceptsToReview)
    }
  }).eq('id', examSessionId);

  // Devolver desglose para la UI
  return jsonReply(res, 200, {
    examSessionId,
    score: finalScore,
    totalEarned,
    totalMax,
    corrections,
    conceptsToReview: Array.from(conceptsToReview),
    verdict: classifyScore(finalScore)
  });
}

function classifyScore(s) {
  if (s >= 9) return 'sobresaliente';
  if (s >= 7) return 'notable';
  if (s >= 5) return 'aprobado';
  return 'suspenso';
}

function buildSystemPrompt(meta, n) {
  const professor = meta.professor && meta.professor.trim()
    ? `el profesor (${meta.professor})`
    : 'el profesor';
  return `Eres un corrector de exámenes de ${meta.name} de la UAL.
Corriges como lo haría ${professor}, basándote en el temario oficial adjunto.

PROCESO DE CORRECCIÓN por ejercicio (haz esto para los ${n} ejercicios):
1. Identifica los pasos que debería tener la resolución según el temario.
2. Compara cada paso con lo que escribió el alumno.
3. Para cada paso: status "correct" / "error" / "partial" + feedback explicativo.
4. Calcula la puntuación parcial de cada paso.
5. Suma la nota final del ejercicio.

CRITERIOS:
- Método incorrecto + resultado correcto por casualidad: 0 puntos.
- Método correcto + error aritmético: 70% de puntos.
- Falta algún paso intermedio: 50% de los puntos de ese paso.
- Respuesta bien razonada que no llega al resultado: hasta 80% según desarrollo.

DEVUELVE EXCLUSIVAMENTE JSON (sin markdown ni texto extra) con esta forma:
{
  "corrections": [
    {
      "questionId": "Q1",
      "steps": [
        { "step": 1, "description": "Identificación del tipo de ejercicio",
          "status": "correct", "feedback": "...", "points_earned": 0.5, "points_max": 0.5 }
      ],
      "total_earned": 1.5,
      "total_max": 2.0,
      "summary": "texto resumen",
      "concepts_to_review": ["Bayes", "probabilidad condicionada"],
      "exam_verdict": "aprobado"
    }
  ]
}`;
}

function buildUserText(answers) {
  return [
    `Corrige los siguientes ${answers.length} ejercicios. Para cada uno te paso enunciado, respuesta del alumno y puntuación máxima.`,
    '',
    ...answers.map((a, i) => `--- Ejercicio ${i + 1} (id=${a.questionId}, max=${a.maxScore || 2.5}) ---
Enunciado:
${a.question}

Respuesta del alumno:
${a.userAnswer || '[en blanco]'}
`),
    '',
    'Devuelve únicamente el JSON especificado.'
  ].join('\n');
}
