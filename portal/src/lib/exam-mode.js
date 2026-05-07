// Helpers de modo examen y modo pánico.

import { supabase } from './supabase.js';

const PANIC_THRESHOLD_DAYS = 7;

export async function getSubjectExamMeta(subjectSlug) {
  const { data } = await supabase
    .from('subjects')
    .select('exam_date, notes')
    .eq('slug', subjectSlug)
    .maybeSingle();
  return data || null;
}

export function shouldActivatePanic(examDateStr) {
  if (!examDateStr) return false;
  const examDate = new Date(examDateStr);
  const days = Math.ceil((examDate.getTime() - Date.now()) / 86400000);
  return days >= 0 && days <= PANIC_THRESHOLD_DAYS;
}

export function daysUntilExam(examDateStr) {
  if (!examDateStr) return null;
  const examDate = new Date(examDateStr);
  return Math.ceil((examDate.getTime() - Date.now()) / 86400000);
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

export async function startExamSession({ userId, subjectSlug, examType, timeLimitMinutes }) {
  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({
      user_id: userId,
      subject_slug: subjectSlug,
      exam_type: examType,
      time_limit_minutes: timeLimitMinutes,
      status: 'active'
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function abandonExamSession(examSessionId) {
  await supabase
    .from('exam_sessions')
    .update({ status: 'abandoned', finished_at: new Date().toISOString() })
    .eq('id', examSessionId);
}

export async function correctExam({ examSessionId, answers }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Sin sesión');
  const res = await fetch('/api/correct-exam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ examSessionId, answers })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || body.error || 'Corrección falló');
    err.payload = body;
    throw err;
  }
  return body;
}

export const EXAM_PRESETS = {
  completo: { label: 'Simulacro completo', minutes: 120, count: 4, description: 'Como el examen real. Te corrijo igual de duro.' },
  parcial: { label: 'Simulacro parcial', minutes: 45, count: 2, description: 'Centrado en tus puntos flojos.' },
  panico: { label: 'Modo pánico', minutes: 30, count: 2, description: 'Solo lo que cae siempre. Máxima rentabilidad.' }
};
