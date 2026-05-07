// Cliente del tracking de sesión (anti-sharing).
// El portal llama a registerSession cuando el usuario abre una asignatura,
// luego pinga cada 60s. Cuando vuelve al hub o hace logout llama a endSession.

import { supabase } from './supabase.js';

const PING_INTERVAL_MS = 60 * 1000;

async function callSessionApi(action, payload = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) return null;
  try {
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action, ...payload })
    });
    if (!res.ok) {
      console.warn(`[session] ${action} HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[session] ${action} failed`, err);
    return null;
  }
}

export async function startSessionTracking(subject) {
  const reg = await callSessionApi('register', { subject });
  const sessionToken = reg?.sessionToken || null;
  if (!sessionToken) return { stop() {} };

  const id = setInterval(() => {
    callSessionApi('ping', { sessionToken });
  }, PING_INTERVAL_MS);

  // Nota: no usamos sendBeacon en beforeunload porque no admite el header
  // Authorization. Las sesiones huérfanas dejan de pingear y no cuentan
  // como "activas" después de 5 min (basta para anti-sharing).

  return {
    stop() {
      clearInterval(id);
      callSessionApi('end', { sessionToken });
    }
  };
}
