// Helpers ligeros del modo examen y modo pánico (puro frontend).
// La lógica pesada (start/submit/finish/history/detail) está en /api/exam/[action].

import { supabase } from './supabase.js';

const PANIC_THRESHOLD_DAYS = 7;

export async function getSubjectExamMeta(subjectSlug) {
  const { data } = await supabase
    .from('subjects')
    .select('exam_date, exam_date_extra, pass_threshold, notes, name')
    .eq('slug', subjectSlug)
    .maybeSingle();
  return data || null;
}

export function daysUntilExam(examDateStr) {
  if (!examDateStr) return null;
  const examDate = new Date(examDateStr);
  return Math.ceil((examDate.getTime() - Date.now()) / 86400000);
}

export function shouldActivatePanic(examDateStr) {
  const d = daysUntilExam(examDateStr);
  return d != null && d >= 0 && d <= PANIC_THRESHOLD_DAYS;
}

export async function setExamDate(subjectSlug, dateString) {
  const { error } = await supabase
    .from('subjects')
    .upsert(
      { slug: subjectSlug, exam_date: dateString || null, updated_at: new Date().toISOString() },
      { onConflict: 'slug' }
    );
  if (error) throw error;
}

// Para StudentDetail/Hub: últimas N exam_sessions del usuario en una asignatura
export async function fetchRecentExamSessions(userId, subjectSlug, limit = 5) {
  let q = supabase
    .from('exam_sessions')
    .select('id, exam_type, status, started_at, finished_at, score, max_score, metadata')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (subjectSlug) q = q.eq('subject_slug', subjectSlug);
  const { data } = await q;
  return data || [];
}
