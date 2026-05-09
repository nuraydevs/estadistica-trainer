// Logger estructurado para endpoints serverless.
// Vercel recoge stdout/stderr; el formato JSON facilita búsqueda.

function emit(level, action, payload = {}, err = null) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    action,
    ...(payload || {})
  };
  if (err) {
    entry.error = {
      message: err?.message || String(err),
      code: err?.code,
      status: err?.status
    };
  }
  const line = JSON.stringify(entry);
  if (level === 'error' || level === 'fatal') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const log = {
  info: (action, data) => emit('info', action, data),
  warn: (action, data, err) => emit('warn', action, data, err),
  error: (action, data, err) => emit('error', action, data, err),
  fatal: (action, data, err) => emit('fatal', action, data, err)
};

// Helper genérico de validación en serverless
export function validate(body, schema) {
  const errors = [];
  for (const [key, rule] of Object.entries(schema)) {
    const v = body?.[key];
    if (rule.required && (v === undefined || v === null || v === '')) {
      errors.push(`${key}: required`);
      continue;
    }
    if (v === undefined || v === null) continue;
    if (rule.type === 'string' && typeof v !== 'string') errors.push(`${key}: not string`);
    if (rule.type === 'number' && typeof v !== 'number') errors.push(`${key}: not number`);
    if (rule.type === 'boolean' && typeof v !== 'boolean') errors.push(`${key}: not boolean`);
    if (rule.type === 'array' && !Array.isArray(v)) errors.push(`${key}: not array`);
    if (rule.maxLen && typeof v === 'string' && v.length > rule.maxLen) errors.push(`${key}: max ${rule.maxLen}`);
    if (rule.enum && !rule.enum.includes(v)) errors.push(`${key}: not in ${rule.enum.join('|')}`);
  }
  return errors.length ? errors : null;
}
