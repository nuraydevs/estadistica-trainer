// Presencia online + perfil público.
// Para evitar exigir Supabase Realtime habilitado en el proyecto, hacemos
// polling cada 30s a online_presence (last_seen <2 min se considera "online").

import { supabase } from './supabase.js';

const PING_INTERVAL_MS = 30 * 1000;
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export async function fetchUserProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[presence] fetchUserProfile', error);
    return null;
  }
  return data;
}

export async function upsertProfile(userId, patch) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: userId, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function setPresence({ userId, subjectSlug, currentSection, isVisible }) {
  await supabase
    .from('online_presence')
    .upsert(
      {
        user_id: userId,
        subject_slug: subjectSlug,
        current_section: currentSection,
        is_visible: isVisible !== false,
        last_seen: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );
}

export async function clearPresence(userId) {
  await supabase.from('online_presence').delete().eq('user_id', userId);
}

export async function fetchOnlineUsers(subjectSlug) {
  const cutoff = new Date(Date.now() - ONLINE_THRESHOLD_MS).toISOString();
  let query = supabase
    .from('online_presence')
    .select('user_id, subject_slug, current_section, is_visible, last_seen')
    .gte('last_seen', cutoff);
  if (subjectSlug) query = query.eq('subject_slug', subjectSlug);
  const { data: rows, error } = await query;
  if (error) {
    console.warn('[presence] fetchOnlineUsers', error);
    return [];
  }
  const visible = (rows || []).filter((r) => r.is_visible);
  if (!visible.length) return [];

  const userIds = visible.map((r) => r.user_id);
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, avatar_url, avatar_type, avatar_banned')
    .in('user_id', userIds);
  const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

  return visible.map((r) => ({
    ...r,
    profile: profileMap.get(r.user_id) || null
  }));
}

export function startPresenceLoop({ userId, subjectSlug, getSection, isVisible }) {
  if (!userId) return { stop() {} };

  // ping inicial inmediato
  setPresence({
    userId,
    subjectSlug,
    currentSection: typeof getSection === 'function' ? getSection() : '',
    isVisible
  });

  const id = setInterval(() => {
    setPresence({
      userId,
      subjectSlug,
      currentSection: typeof getSection === 'function' ? getSection() : '',
      isVisible
    });
  }, PING_INTERVAL_MS);

  return {
    stop() {
      clearInterval(id);
      clearPresence(userId).catch(() => {});
    }
  };
}

// Avatares prediseñados (estilo minimalista — emoji icons en colores neutros).
export const GENERATED_AVATARS = [
  '🐱', '🦊', '🐼', '🐯', '🦁', '🐨', '🐸', '🦉', '🐙', '🦋', '🌵', '🍀'
];

export function avatarHtml(profile, fallbackName = '') {
  if (!profile || profile.avatar_banned) {
    return `<div class="avatar avatar--init">${initialOf(profile?.display_name || fallbackName)}</div>`;
  }
  if (profile.avatar_type === 'photo' && profile.avatar_url) {
    return `<img class="avatar avatar--photo" src="${profile.avatar_url}" alt="">`;
  }
  if (profile.avatar_type === 'generated' && profile.avatar_url) {
    return `<div class="avatar avatar--gen">${profile.avatar_url}</div>`;
  }
  return `<div class="avatar avatar--init">${initialOf(profile.display_name || fallbackName)}</div>`;
}

function initialOf(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '?';
  return trimmed[0].toUpperCase();
}
