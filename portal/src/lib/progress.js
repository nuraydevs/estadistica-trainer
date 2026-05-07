import { supabase } from './supabase.js';

export async function fetchProgress(userId, subjectSlug) {
  const { data, error } = await supabase
    .from('progress')
    .select('data')
    .eq('user_id', userId)
    .eq('subject_slug', subjectSlug)
    .maybeSingle();
  if (error) {
    console.warn('[Progress] fetch error', error);
    return null;
  }
  return data?.data ?? null;
}

export async function saveProgress(userId, subjectSlug, data) {
  const { error } = await supabase
    .from('progress')
    .upsert(
      { user_id: userId, subject_slug: subjectSlug, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,subject_slug' }
    );
  if (error) {
    console.warn('[Progress] save error', error);
    return false;
  }
  return true;
}

export function debounce(fn, ms) {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
  debounced.flush = () => {
    clearTimeout(timeoutId);
  };
  return debounced;
}
