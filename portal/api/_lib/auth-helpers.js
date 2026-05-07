// Helpers para serverless: cliente Supabase service_role + verificación JWT.

import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export function getServiceClient() {
  if (cachedClient) return cachedClient;
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  cachedClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return cachedClient;
}

export async function getAuthedUser(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { error: 'unauthorized', status: 401 };

  const supabase = getServiceClient();
  if (!supabase) return { error: 'server_misconfigured', status: 500 };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { error: 'unauthorized', status: 401 };
  return { user: data.user, supabase };
}

export async function requireAdmin(req) {
  const { user, supabase, error, status } = await getAuthedUser(req);
  if (error) return { error, status };
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, active')
    .eq('id', user.id)
    .single();
  if (!profile?.is_admin || !profile?.active) {
    return { error: 'forbidden', status: 403 };
  }
  return { user, supabase, profile };
}

export function readClientIp(req) {
  // Vercel/Proxy preferentes
  const xff = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
  if (xff) {
    const first = String(xff).split(',')[0].trim();
    if (first) return first;
  }
  const real = req.headers['x-real-ip'] || req.headers['X-Real-IP'];
  if (real) return String(real);
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '';
}

export function fingerprint(req) {
  // Hash débil; sólo para detectar cambios entre dispositivos.
  const ua = String(req.headers['user-agent'] || '');
  const lang = String(req.headers['accept-language'] || '');
  const platform = String(req.headers['sec-ch-ua-platform'] || '');
  return djb2(ua + '|' + lang + '|' + platform).toString(36);
}

function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return h >>> 0;
}

export function jsonReply(res, status, body) {
  if (typeof res.status === 'function') return res.status(status).json(body);
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}
