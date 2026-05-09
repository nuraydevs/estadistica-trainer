// Cliente de presencia online basado en Supabase Realtime channels.
// Cada usuario hace `channel.track({...})` y recibe presence sync events.
// Para `online_presence` también escribimos vía /api/social/presence (track/list)
// para tener histórico y rankings.

import { supabase } from './supabase.js';
export { avatarHtml, GENERATED_AVATARS, avatarSvgById, initialAvatar } from '../components/AvatarPicker.js';

async function authedPost(path, body) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) return null;
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    console.warn(`[presence] ${path} ${res.status}`);
    return null;
  }
  return res.json();
}

export function fetchProfile() {
  return supabase.auth.getSession().then(async ({ data }) => {
    const token = data?.session?.access_token;
    if (!token) return null;
    const res = await fetch('/api/social/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.profile;
  });
}

export function saveProfile(payload) {
  return authedPost('/api/social/profile', payload).then((r) => r?.profile);
}

export function fetchOnlineList(subject) {
  return authedPost('/api/social/presence', { action: 'list', subject }).then((r) => r?.online || []);
}

export function trackPresence({ subject, section }) {
  return authedPost('/api/social/presence', { action: 'track', subject, section });
}

export function untrackPresence() {
  return authedPost('/api/social/presence', { action: 'untrack' });
}

/**
 * Suscripción con Supabase Realtime (presence channel).
 * Devuelve un controller con .updateSection(text) y .stop().
 *
 * Internamente:
 *  - canal 'presence-<subject>' compartido por todos los usuarios online
 *  - track payload incluye user_id, display_name, avatar_url, avatar_type, section, is_self
 *  - además POSTea a /api/social/presence cada 60s para histórico
 */
export function subscribePresence({ subject, profile, getSection, isVisible, onSync }) {
  if (!subject) return { stop() {}, updateSection() {} };

  // Sólo un channel global activo. Si saltamos a otra asignatura, cerramos el anterior.
  if (typeof window !== 'undefined' && window.__presenceChannel) {
    try { window.__presenceChannel.untrack(); } catch {}
    try { supabase.removeChannel(window.__presenceChannel); } catch {}
    window.__presenceChannel = null;
    if (window.__presenceTrackTimer) {
      clearInterval(window.__presenceTrackTimer);
      window.__presenceTrackTimer = null;
    }
  }

  const channelName = `presence-${subject}`;
  const channel = supabase.channel(channelName, {
    config: { presence: { key: profile?.user_id || 'anon' } }
  });
  if (typeof window !== 'undefined') window.__presenceChannel = channel;

  let lastSection = '';
  let trackPostId = null;

  function snapshotState() {
    const state = channel.presenceState();
    const out = [];
    Object.values(state).forEach((arr) => {
      (arr || []).forEach((m) => out.push(m));
    });
    return out;
  }

  channel
    .on('presence', { event: 'sync' }, () => onSync?.(snapshotState()))
    .on('presence', { event: 'join' }, () => onSync?.(snapshotState()))
    .on('presence', { event: 'leave' }, () => onSync?.(snapshotState()))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && isVisible !== false) {
        lastSection = (typeof getSection === 'function' ? getSection() : '') || '';
        await channel.track({
          user_id: profile?.user_id,
          display_name: profile?.display_name || 'Anónimo',
          avatar_type: profile?.avatar_type || 'none',
          avatar_url: profile?.avatar_url || null,
          section: lastSection,
          subject,
          ts: Date.now()
        });
        // Histórico cada 60s
        trackPostId = setInterval(() => {
          trackPresence({ subject, section: lastSection });
        }, 60000);
        if (typeof window !== 'undefined') window.__presenceTrackTimer = trackPostId;
        trackPresence({ subject, section: lastSection });
      }
    });

  return {
    async updateSection(section) {
      if (section === lastSection) return;
      lastSection = section || '';
      try {
        await channel.track({
          user_id: profile?.user_id,
          display_name: profile?.display_name || 'Anónimo',
          avatar_type: profile?.avatar_type || 'none',
          avatar_url: profile?.avatar_url || null,
          section: lastSection,
          subject,
          ts: Date.now()
        });
      } catch {}
    },
    async setVisibility(visible) {
      if (visible) {
        await channel.track({
          user_id: profile?.user_id,
          display_name: profile?.display_name || 'Anónimo',
          avatar_type: profile?.avatar_type || 'none',
          avatar_url: profile?.avatar_url || null,
          section: lastSection,
          subject,
          ts: Date.now()
        });
      } else {
        await channel.untrack();
      }
    },
    stop() {
      if (trackPostId) clearInterval(trackPostId);
      if (typeof window !== 'undefined' && window.__presenceTrackTimer === trackPostId) {
        window.__presenceTrackTimer = null;
      }
      try { channel.untrack(); } catch {}
      try { supabase.removeChannel(channel); } catch {}
      if (typeof window !== 'undefined' && window.__presenceChannel === channel) {
        window.__presenceChannel = null;
      }
      untrackPresence();
    }
  };
}

// Cleanup al cerrar la página: untrack + remove
if (typeof window !== 'undefined' && !window.__presenceUnloadHooked) {
  window.__presenceUnloadHooked = true;
  window.addEventListener('beforeunload', () => {
    try { window.__presenceChannel?.untrack(); } catch {}
    try { window.__presenceChannel && supabase.removeChannel(window.__presenceChannel); } catch {}
    if (window.__presenceTrackTimer) clearInterval(window.__presenceTrackTimer);
  });
}

// Subida de avatar con compresión a 256x256
export async function uploadAvatar(file, userId) {
  if (!file || !userId) throw new Error('Faltan file o userId');
  const dataUrl = await compressImage(file, 256);
  const blob = await (await fetch(dataUrl)).blob();
  const ext = blob.type.split('/')[1] || 'png';
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    contentType: blob.type,
    upsert: true
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  return pub.publicUrl;
}

function compressImage(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (e) { reject(e); }
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}
