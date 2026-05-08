// Filtro mínimo de palabras prohibidas. NO es un anti-spam exhaustivo:
// solo evita los casos más obvios. La moderación humana posterior decide.

const BANNED = [
  // insultos comunes ES
  'puta', 'putas', 'putos', 'mierda', 'cabron', 'cabrón', 'gilipollas', 'maricon', 'maricón',
  'subnormal', 'retrasado', 'idiota', 'imbecil', 'imbécil',
  // sexual explícito
  'porn', 'porno', 'xxx', 'sex',
  // racismo
  'nazi', 'sieg heil', 'negrata',
  // genérico inapropiado
  'fuck', 'shit', 'bitch', 'asshole'
];

const NORMALIZE_MAP = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a' };

function normalize(text) {
  let s = String(text || '').toLowerCase();
  // strip accents
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  // leetspeak normalization
  s = s.replace(/[01345 7@]/g, (c) => NORMALIZE_MAP[c] ?? c);
  // collapse repetidas
  s = s.replace(/(.)\1{2,}/g, '$1$1');
  return s;
}

export function containsBanned(text) {
  const norm = normalize(text);
  for (const w of BANNED) {
    if (norm.includes(w)) return w;
  }
  return null;
}

export function validateText(text, { maxLen = 100, allowEmpty = true } = {}) {
  const t = String(text || '').trim();
  if (!t) return allowEmpty ? null : 'empty';
  if (t.length > maxLen) return 'too_long';
  const banned = containsBanned(t);
  if (banned) return `banned:${banned}`;
  return null;
}
