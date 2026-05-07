// POST /api/admin/extract-material
// body: { materialId }
// Re-ejecuta extracción Gemini para un material concreto.
// Requiere admin. Tarda 15-60s (depende del PDF).

import { requireAdmin, jsonReply, readJsonBody } from '../_lib/auth-helpers.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODEL = 'gemini-1.5-pro';

const PROMPT = `Eres un extractor académico. Convierte este PDF universitario en HTML estructurado COMPLETO.

REGLAS INNEGOCIABLES:
1. NO resumas. Incluye TODO el contenido del PDF.
2. NO omitas diapositivas, páginas ni secciones.
3. Mantén el orden original.
4. Incluye TODOS los ejemplos, ejercicios resueltos, fórmulas y tablas.
5. Fórmulas: conviértelas a LaTeX entre $...$ inline o $$...$$ bloque.
6. Tablas: HTML <table> con <thead> y <tbody>.
7. Títulos: <h2>/<h3>/<h4>. Conceptos: <strong>. Definiciones: <blockquote>.
8. Ejercicios resueltos: <div class="ejemplo-resuelto">...</div>.
9. Notas: <aside>...</aside>.

FORMATO: solo HTML del contenido (sin <!DOCTYPE>, <html>, <head>, <body>).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonReply(res, 405, { error: 'method_not_allowed' });
  const { supabase, error, status } = await requireAdmin(req);
  if (error) return jsonReply(res, status, { error });

  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!GEMINI_KEY) return jsonReply(res, 500, { error: 'server_misconfigured' });

  let body;
  try { body = await readJsonBody(req); } catch { return jsonReply(res, 400, { error: 'bad_json' }); }
  const materialId = String(body?.materialId || '').trim();
  if (!materialId) return jsonReply(res, 400, { error: 'missing_material' });

  const { data: material } = await supabase
    .from('subject_materials')
    .select('id, subject_slug, type, tema, title, pdf_storage_path')
    .eq('id', materialId)
    .maybeSingle();
  if (!material) return jsonReply(res, 404, { error: 'not_found' });

  // Buscamos el PDF en .temario/<subject>/Tema X/<filename> (sincronizado por sync-temario)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const fname = path.basename(material.pdf_storage_path);
  const candidates = [];
  for (let t = 1; t <= 5; t++) {
    candidates.push(path.resolve(__dirname, '..', '..', '.temario', material.subject_slug, `Tema ${t}`, fname));
    candidates.push(path.resolve(__dirname, '..', '..', '.temario', material.subject_slug, `Tema ${t} `, fname));
  }
  let pdfBuf = null;
  for (const c of candidates) {
    try { pdfBuf = await readFile(c); break; } catch {}
  }
  if (!pdfBuf) {
    // Fallback: descargar desde Storage
    try {
      const { data, error: dlErr } = await supabase.storage.from('temario').download(material.pdf_storage_path);
      if (dlErr) throw dlErr;
      pdfBuf = Buffer.from(await data.arrayBuffer());
    } catch (err) {
      return jsonReply(res, 404, { error: 'pdf_unreachable', message: err.message });
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: 'application/pdf', data: pdfBuf.toString('base64') } }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
  };

  let json;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    json = await r.json();
    if (!r.ok) return jsonReply(res, 502, { error: 'gemini_error', message: json?.error?.message });
  } catch (err) {
    return jsonReply(res, 502, { error: 'gemini_unreachable', message: err.message });
  }

  const html = json.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || '';
  if (!html) return jsonReply(res, 502, { error: 'empty_response' });

  await supabase.from('subject_materials').update({
    html_content: html,
    last_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', materialId);

  return jsonReply(res, 200, { ok: true, htmlLength: html.length });
}
