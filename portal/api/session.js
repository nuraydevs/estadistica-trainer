// POST /api/session
//   action: 'register' | 'ping' | 'end'
//   body: { action, subject, sessionToken? }
//
// Controla sesiones por usuario (anti-sharing) y dispara alertas:
//   - multiple_ips: 2+ IPs distintas en 2h
//   - concurrent_sessions: 2+ sesiones activas con last_seen_at <5 min
//   - unusual_hours: acceso entre 02:00 y 06:00 hora local (Europe/Madrid)
//   - too_fast: cambio de país en <1h (heurística desactivada por defecto;
//     no tenemos GeoIP en Vercel sin servicio externo).

import { getAuthedUser, readClientIp, fingerprint, jsonReply, readJsonBody } from './_lib/auth-helpers.js';
import { randomUUID } from 'node:crypto';

const ACTIVE_WINDOW_MS = 5 * 60 * 1000; // sesión "activa" si ping <5min
const RECENT_WINDOW_MS = 2 * 60 * 60 * 1000; // ventana 2h para múltiples IPs

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });

  const { user, supabase, error, status } = await getAuthedUser(req);
  if (error) return jsonReply(res, status, { error });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const action = String(body?.action || '').trim();

  if (action === 'register') return register(req, res, { supabase, user, body });
  if (action === 'ping') return ping(req, res, { supabase, user, body });
  if (action === 'end') return endSession(req, res, { supabase, user, body });
  return jsonReply(res, 400, { error: 'bad_action' });
}

async function register(req, res, { supabase, user, body }) {
  const subject = String(body?.subject || '').trim() || null;
  const ip = readClientIp(req);
  const ua = String(req.headers['user-agent'] || '').slice(0, 500);
  const fp = fingerprint(req);
  const sessionToken = randomUUID();

  // Inserta nueva sesión
  await supabase.from('sessions').insert({
    user_id: user.id,
    session_token: sessionToken,
    ip_address: ip || null,
    user_agent: ua,
    device_fingerprint: fp,
    subject_slug: subject,
    started_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    is_active: true
  });

  // Actualiza el espejo en users
  const { data: prevUser } = await supabase
    .from('users')
    .select('total_sessions, last_ip')
    .eq('id', user.id)
    .single();

  await supabase
    .from('users')
    .update({
      last_ip: ip || prevUser?.last_ip || null,
      last_seen_at: new Date().toISOString(),
      total_sessions: (prevUser?.total_sessions ?? 0) + 1
    })
    .eq('id', user.id);

  // Detecta anomalías (en background — no bloqueamos respuesta)
  detectAnomalies(supabase, user.id, { ip, fp, ua }).catch((err) =>
    console.warn('[session] detectAnomalies error', err)
  );

  return jsonReply(res, 200, { sessionToken });
}

async function ping(req, res, { supabase, user, body }) {
  const sessionToken = String(body?.sessionToken || '').trim();
  if (!sessionToken) return jsonReply(res, 400, { error: 'missing_token' });

  const now = new Date().toISOString();
  await supabase
    .from('sessions')
    .update({ last_seen_at: now })
    .eq('user_id', user.id)
    .eq('session_token', sessionToken);

  await supabase.from('users').update({ last_seen_at: now }).eq('id', user.id);

  return jsonReply(res, 200, { ok: true });
}

async function endSession(req, res, { supabase, user, body }) {
  const sessionToken = String(body?.sessionToken || '').trim();
  if (!sessionToken) return jsonReply(res, 200, { ok: true });
  await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('session_token', sessionToken);
  return jsonReply(res, 200, { ok: true });
}

async function detectAnomalies(supabase, userId, current) {
  const since = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
  const { data: recent } = await supabase
    .from('sessions')
    .select('ip_address, device_fingerprint, last_seen_at, started_at, is_active')
    .eq('user_id', userId)
    .gte('started_at', since)
    .order('started_at', { ascending: false });

  const sessions = recent || [];

  // 1) Múltiples IPs en 2h
  const distinctIps = new Set(
    sessions.map((s) => s.ip_address).filter((ip) => ip && ip !== '::1' && ip !== '127.0.0.1')
  );
  if (distinctIps.size >= 2) {
    await insertAlert(supabase, userId, 'multiple_ips', {
      ips: Array.from(distinctIps),
      window_minutes: Math.round(RECENT_WINDOW_MS / 60000)
    });
  }

  // 2) Sesiones simultáneas (2+ activas con last_seen reciente)
  const activeWindow = Date.now() - ACTIVE_WINDOW_MS;
  const concurrent = sessions.filter(
    (s) => s.is_active && new Date(s.last_seen_at).getTime() >= activeWindow
  );
  if (concurrent.length >= 2) {
    await insertAlert(supabase, userId, 'concurrent_sessions', {
      count: concurrent.length,
      fingerprints: concurrent.map((s) => s.device_fingerprint).filter(Boolean)
    });
  }

  // 3) Horas inusuales (02:00–06:00 Europe/Madrid)
  const hourMadrid = parseInt(
    new Date().toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Europe/Madrid' }),
    10
  );
  if (hourMadrid >= 2 && hourMadrid < 6) {
    await insertAlert(supabase, userId, 'unusual_hours', {
      hour_madrid: hourMadrid,
      ip: current.ip || null
    });
  }
}

async function insertAlert(supabase, userId, type, details) {
  // Evita duplicar alertas del mismo tipo en la última hora
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('session_alerts')
    .select('id')
    .eq('user_id', userId)
    .eq('alert_type', type)
    .eq('reviewed', false)
    .gte('created_at', cutoff)
    .maybeSingle();
  if (existing) return;

  await supabase.from('session_alerts').insert({
    user_id: userId,
    alert_type: type,
    details
  });
  await supabase.from('users').update({ suspicious: true }).eq('id', userId);
}
