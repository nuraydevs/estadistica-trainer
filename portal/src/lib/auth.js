import { supabase } from './supabase.js';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[Auth] getSession error', error);
    return null;
  }
  return data.session ?? null;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, is_admin, active, created_at')
    .eq('id', userId)
    .single();
  if (error) {
    console.warn('[Auth] fetchProfile error', error);
    return null;
  }
  return data;
}

export async function fetchUserSubjects(userId) {
  const { data, error } = await supabase
    .from('user_subjects')
    .select('subject_slug, granted_at')
    .eq('user_id', userId);
  if (error) {
    console.warn('[Auth] fetchUserSubjects error', error);
    return [];
  }
  return data ?? [];
}
