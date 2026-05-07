// Memoria persistente del alumno: lectura y actualización del learning_profile
// y registro de cada intento en exercise_attempts.
//
// Reglas de transición de estado de un concepto:
//   - 3 aciertos consecutivos       → mastered
//   - 2 fallos en últimos 5         → weak
//   - 3 fallos consecutivos          → broken
//
// El frontend invoca estas funciones; RLS limita escritura al propio user.

import { supabase } from './supabase.js';

const STORAGE_KEY_PREFIX = 'learning-profile-cache-';
const HISTORY_LIMIT = 30;

function emptyProfile(userId, subjectSlug) {
  return {
    user_id: userId,
    subject_slug: subjectSlug,
    concepts_mastered: [],
    concepts_weak: [],
    concepts_broken: [],
    recent_history: [],
    avg_session_minutes: 0,
    best_hour: null,
    hour_counts: {},
    total_exercises_done: 0,
    total_exercises_failed: 0,
    streak_days: 0,
    last_study_date: null,
    updated_at: null
  };
}

export async function getProfile(userId, subjectSlug) {
  if (!userId || !subjectSlug) return null;
  const { data, error } = await supabase
    .from('learning_profile')
    .select('*')
    .eq('user_id', userId)
    .eq('subject_slug', subjectSlug)
    .maybeSingle();
  if (error) {
    console.warn('[profile] getProfile error', error);
    const cached = readCache(userId, subjectSlug);
    return cached || emptyProfile(userId, subjectSlug);
  }
  if (!data) return emptyProfile(userId, subjectSlug);
  writeCache(userId, subjectSlug, data);
  return data;
}

export function getWeakConcepts(profile, limit = 3) {
  if (!profile) return [];
  const weak = (profile.concepts_weak || [])
    .slice()
    .sort((a, b) => (b.fail_count || 0) - (a.fail_count || 0))
    .slice(0, limit)
    .map((w) => w.concept);
  return weak;
}

export function getBrokenConcepts(profile) {
  return profile?.concepts_broken || [];
}

export function successRate(profile) {
  const total = profile?.total_exercises_done || 0;
  if (!total) return null;
  const failed = profile?.total_exercises_failed || 0;
  return Math.round(((total - failed) / total) * 100);
}

/**
 * Aplica un nuevo intento al perfil y persiste.
 * @param {string} userId
 * @param {string} subjectSlug
 * @param {object} attempt - { exercise_id, concept, result, hints_used, time_spent_seconds }
 * @returns {Promise<object|null>} perfil actualizado
 */
export async function updateProfile(userId, subjectSlug, attempt) {
  if (!userId || !subjectSlug || !attempt) return null;

  const concept = String(attempt.concept || 'general').trim();
  const result = attempt.result || 'failed';
  const today = new Date().toISOString().slice(0, 10);
  const hour = new Date().getHours();

  // 1) Inserta intent en exercise_attempts (RLS permite si user_id = auth.uid())
  try {
    await supabase.from('exercise_attempts').insert({
      user_id: userId,
      subject_slug: subjectSlug,
      exercise_id: String(attempt.exercise_id || ''),
      concept,
      result,
      hints_used: Number(attempt.hints_used || 0),
      time_spent_seconds: Number(attempt.time_spent_seconds || 0)
    });
  } catch (err) {
    console.warn('[profile] insert attempt failed', err);
  }

  // 2) Carga perfil actual
  const current = await getProfile(userId, subjectSlug);
  const profile = JSON.parse(JSON.stringify(current));

  // 3) Recalcula
  const recent = Array.isArray(profile.recent_history) ? profile.recent_history : [];
  recent.push({ concept, result, ts: new Date().toISOString() });
  while (recent.length > HISTORY_LIMIT) recent.shift();
  profile.recent_history = recent;

  // Categorías: revaluamos por concepto basándonos en historial reciente
  const lastForConcept = recent.filter((h) => h.concept === concept);
  const lastResults = lastForConcept.map((h) => h.result);
  const consecutiveCorrect = countTrailing(lastResults, 'correct');
  const consecutiveFailed = countTrailing(lastResults, ['failed', 'gave_up']);
  const last5 = lastForConcept.slice(-5);
  const failsInLast5 = last5.filter((h) => h.result !== 'correct').length;

  removeConcept(profile, 'concepts_mastered', concept);
  removeWeak(profile, concept);
  removeConcept(profile, 'concepts_broken', concept);

  if (consecutiveFailed >= 3) {
    pushUnique(profile.concepts_broken, concept);
  } else if (failsInLast5 >= 2) {
    const weak = profile.concepts_weak || [];
    weak.push({
      concept,
      fail_count: failsInLast5,
      last_failed: new Date().toISOString()
    });
    profile.concepts_weak = weak;
  } else if (consecutiveCorrect >= 3) {
    pushUnique(profile.concepts_mastered, concept);
  }

  // Totales
  profile.total_exercises_done = (profile.total_exercises_done || 0) + 1;
  if (result !== 'correct') {
    profile.total_exercises_failed = (profile.total_exercises_failed || 0) + 1;
  }

  // Streak
  if (profile.last_study_date) {
    const prev = new Date(profile.last_study_date);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate - prev) / 86400000);
    if (diffDays === 0) {
      // mismo día, mantenemos streak
    } else if (diffDays === 1) {
      profile.streak_days = (profile.streak_days || 0) + 1;
    } else if (diffDays > 1) {
      profile.streak_days = 1;
    }
  } else {
    profile.streak_days = 1;
  }
  profile.last_study_date = today;

  // best_hour: mantenemos hour_counts y elegimos el max
  const hourCounts = profile.hour_counts || {};
  hourCounts[String(hour)] = (hourCounts[String(hour)] || 0) + 1;
  profile.hour_counts = hourCounts;
  profile.best_hour = parseInt(
    Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? hour,
    10
  );

  profile.updated_at = new Date().toISOString();

  // 4) Persistir
  try {
    const payload = {
      user_id: userId,
      subject_slug: subjectSlug,
      concepts_mastered: profile.concepts_mastered,
      concepts_weak: profile.concepts_weak,
      concepts_broken: profile.concepts_broken,
      recent_history: profile.recent_history,
      avg_session_minutes: profile.avg_session_minutes,
      best_hour: profile.best_hour,
      hour_counts: profile.hour_counts,
      total_exercises_done: profile.total_exercises_done,
      total_exercises_failed: profile.total_exercises_failed,
      streak_days: profile.streak_days,
      last_study_date: profile.last_study_date,
      updated_at: profile.updated_at
    };
    const { error } = await supabase
      .from('learning_profile')
      .upsert(payload, { onConflict: 'user_id,subject_slug' });
    if (error) throw error;
    writeCache(userId, subjectSlug, payload);
  } catch (err) {
    console.warn('[profile] upsert failed, queda sólo en cache local', err);
    writeCache(userId, subjectSlug, profile);
  }

  return profile;
}

// ── helpers ──────────────────────────────────────────────────

function countTrailing(arr, target) {
  const set = Array.isArray(target) ? new Set(target) : new Set([target]);
  let n = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (set.has(arr[i])) n++;
    else break;
  }
  return n;
}

function pushUnique(arr, item) {
  if (!arr.includes(item)) arr.push(item);
}

function removeConcept(profile, key, concept) {
  profile[key] = (profile[key] || []).filter((c) => c !== concept);
}

function removeWeak(profile, concept) {
  profile.concepts_weak = (profile.concepts_weak || []).filter((w) => w.concept !== concept);
}

function readCache(userId, subjectSlug) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + userId + '-' + subjectSlug);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeCache(userId, subjectSlug, profile) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + userId + '-' + subjectSlug, JSON.stringify(profile));
  } catch {}
}
