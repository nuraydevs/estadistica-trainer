// 12 avatares SVG abstractos, geométricos, sobrios.
// Cada avatar es un SVG inline 64x64 con gradiente o forma.
// Estilo: monochrome con un acento. Nada de caras.

const PALETTE = [
  ['#1a2540', '#4a7cf7'],   // azul portal
  ['#0f2a1e', '#3d9970'],   // verde
  ['#2a1f0a', '#c9892a'],   // ámbar
  ['#2a1010', '#c94a4a'],   // rojo apagado
  ['#1c1e21', '#6b6e72'],   // gris
  ['#141618', '#8d99ae'],   // gris azulado
];

// Cada generador devuelve markup interno del SVG (sin <svg> wrapper).
const SHAPES = [
  // 1. círculo con gradiente vertical
  (a, b) => `<defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="64" height="64" fill="${a}"/><circle cx="32" cy="32" r="22" fill="url(#g)"/>`,
  // 2. dos hexágonos solapados
  (a, b) => `<rect width="64" height="64" fill="${a}"/><polygon points="22,12 42,12 52,32 42,52 22,52 12,32" fill="${b}"/><polygon points="32,22 44,22 50,32 44,42 32,42 26,32" fill="${a}" opacity="0.6"/>`,
  // 3. luna creciente
  (a, b) => `<rect width="64" height="64" fill="${a}"/><circle cx="32" cy="32" r="22" fill="${b}"/><circle cx="40" cy="28" r="20" fill="${a}"/>`,
  // 4. ondas
  (a, b) => `<rect width="64" height="64" fill="${a}"/><path d="M0,28 Q16,20 32,28 T64,28 V40 Q48,32 32,40 T0,40 Z" fill="${b}"/>`,
  // 5. cuadrados rotados
  (a, b) => `<rect width="64" height="64" fill="${a}"/><rect x="20" y="20" width="24" height="24" fill="${b}" transform="rotate(15 32 32)"/><rect x="22" y="22" width="20" height="20" fill="${a}" transform="rotate(-10 32 32)" opacity="0.7"/>`,
  // 6. triángulo y círculo
  (a, b) => `<rect width="64" height="64" fill="${a}"/><polygon points="32,12 52,48 12,48" fill="${b}"/><circle cx="32" cy="40" r="8" fill="${a}"/>`,
  // 7. rayas diagonales
  (a, b) => `<rect width="64" height="64" fill="${a}"/><polygon points="0,40 24,0 40,0 0,64" fill="${b}"/><polygon points="24,64 64,24 64,40 40,64" fill="${b}" opacity="0.6"/>`,
  // 8. anillo concéntrico
  (a, b) => `<rect width="64" height="64" fill="${a}"/><circle cx="32" cy="32" r="22" fill="none" stroke="${b}" stroke-width="6"/><circle cx="32" cy="32" r="10" fill="${b}"/>`,
  // 9. forma líquida (orgánica)
  (a, b) => `<rect width="64" height="64" fill="${a}"/><path d="M16,20 Q32,8 48,20 Q56,36 48,48 Q32,58 16,48 Q8,32 16,20 Z" fill="${b}"/>`,
  // 10. dos círculos solapados
  (a, b) => `<rect width="64" height="64" fill="${a}"/><circle cx="24" cy="32" r="16" fill="${b}"/><circle cx="40" cy="32" r="16" fill="${b}" opacity="0.7"/>`,
  // 11. escalones
  (a, b) => `<rect width="64" height="64" fill="${a}"/><rect x="12" y="36" width="12" height="16" fill="${b}"/><rect x="26" y="28" width="12" height="24" fill="${b}"/><rect x="40" y="20" width="12" height="32" fill="${b}"/>`,
  // 12. flor geométrica
  (a, b) => `<rect width="64" height="64" fill="${a}"/><circle cx="32" cy="20" r="8" fill="${b}"/><circle cx="44" cy="32" r="8" fill="${b}"/><circle cx="32" cy="44" r="8" fill="${b}"/><circle cx="20" cy="32" r="8" fill="${b}"/><circle cx="32" cy="32" r="6" fill="${a}"/>`
];

export const GENERATED_AVATARS = SHAPES.map((shape, i) => {
  const [a, b] = PALETTE[i % PALETTE.length];
  const inner = shape(a, b);
  return {
    id: `gen-${i + 1}`,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${inner}</svg>`
  };
});

export function avatarSvgById(id) {
  const found = GENERATED_AVATARS.find((a) => a.id === id);
  return found?.svg || null;
}

export function initialAvatar(name, size = 32) {
  const initial = (String(name || '').trim()[0] || '?').toUpperCase();
  // hash → tono
  let h = 0;
  for (const c of String(name || '')) h = ((h << 5) - h + c.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  const bg = `hsl(${hue}, 22%, 24%)`;
  const fg = `hsl(${hue}, 35%, 78%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="600" font-size="${size * 0.5}" fill="${fg}">${escapeHtml(initial)}</text></svg>`;
}

export function avatarHtml(profile, fallbackName = '', size = 32) {
  const banned = profile?.avatar_banned;
  if (!banned && profile?.avatar_type === 'photo' && profile?.avatar_url) {
    return `<img class="avatar avatar--photo" src="${escapeAttr(profile.avatar_url)}" alt="" width="${size}" height="${size}" loading="lazy" />`;
  }
  if (!banned && profile?.avatar_type === 'generated' && profile?.avatar_url) {
    const svg = avatarSvgById(profile.avatar_url) || initialAvatar(profile.display_name || fallbackName, size);
    return `<span class="avatar avatar--svg" style="width:${size}px;height:${size}px">${svg}</span>`;
  }
  const init = initialAvatar(profile?.display_name || fallbackName, size);
  return `<span class="avatar avatar--svg" style="width:${size}px;height:${size}px">${init}</span>`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
