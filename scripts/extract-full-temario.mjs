#!/usr/bin/env node
// Extrae HTML estructurado de cada PDF en subject_materials usando Gemini 1.5 Pro.
// Lee credenciales de portal/.env.local. Procesa solo los materiales que aún
// no tienen html_content (o pasa --force para re-procesar todos).
//
// Uso:
//   ln -sfn portal/node_modules node_modules
//   node scripts/extract-full-temario.mjs [--force] [--subject=estadistica] [--limit=3]
//   rm node_modules
//
// El package.json del portal tiene @supabase/supabase-js. Necesitamos el
// symlink temporal porque el script vive fuera de portal/.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const env = {};
const envPath = path.join(repoRoot, 'portal/.env.local');
if (!existsSync(envPath)) {
  console.error('No existe portal/.env.local');
  process.exit(1);
}
readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
  const t = line.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) return;
  const i = t.indexOf('=');
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
});

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = env.GEMINI_API_KEY || env.GOOGLE_AI_API_KEY;
if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_KEY) {
  console.error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / GEMINI_API_KEY en .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const subjectArg = args.find((a) => a.startsWith('--subject='))?.split('=')[1];
const limitArg = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PROMPT = `Eres un extractor académico. Convierte este PDF universitario en HTML estructurado COMPLETO.

REGLAS INNEGOCIABLES:
1. NO resumas. Incluye TODO el contenido del PDF.
2. NO omitas diapositivas, páginas ni secciones.
3. Mantén el orden original.
4. Incluye TODOS los ejemplos, ejercicios resueltos, fórmulas y tablas.
5. Fórmulas: conviértelas a LaTeX entre $...$ inline o $$...$$ bloque.
6. Tablas: HTML <table> con <thead> y <tbody>.
7. Títulos de sección: <h2>. Subtítulos: <h3>. Sub-subtítulos: <h4>.
8. Conceptos clave: <strong>.
9. Definiciones: <blockquote>.
10. Ejercicios resueltos: <div class="ejemplo-resuelto">...</div>.
11. Notas u observaciones: <aside>...</aside>.

FORMATO DE SALIDA: solo HTML del contenido (sin <!DOCTYPE>, <html>, <head>, <body>).
Empieza directamente con el contenido del PDF.`;

const MODEL = 'gemini-2.5-flash';

async function extractPdf(absPath) {
  const buf = readFileSync(absPath);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: 'application/pdf', data: buf.toString('base64') } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 32768
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${json?.error?.message || JSON.stringify(json).slice(0, 200)}`);
  }
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || '';
  return text;
}

async function main() {
  let query = supabase.from('subject_materials').select('*');
  if (subjectArg) query = query.eq('subject_slug', subjectArg);
  if (!force) query = query.is('html_content', null);
  query = query.order('subject_slug').order('tema');
  const { data: materials, error } = await query;
  if (error) {
    console.error('No se pudo leer subject_materials:', error.message);
    console.error('¿Aplicaste la migración 0008? Mira supabase/migrations/');
    process.exit(1);
  }
  if (!materials.length) {
    console.log('No hay materiales pendientes.');
    return;
  }
  let processed = 0;
  for (const mat of materials) {
    if (limitArg && processed >= limitArg) break;
    const localPath = path.join(repoRoot, 'apps/estadistica/Temario UAL',
      mat.pdf_storage_path
        .replace(/^estadistica\/(teoria|ejercicios)\//, '')
        .replace('Tema X', '')
    );
    // Heurística mejor: el storage_path es estadistica/<type>/<filename>.
    // El filename está en local en apps/estadistica/Temario UAL/Tema N/<filename>.
    const fname = path.basename(mat.pdf_storage_path);
    let candidates = [];
    for (let t = 1; t <= 5; t++) {
      candidates.push(path.join(repoRoot, `apps/estadistica/Temario UAL/Tema ${t}/${fname}`));
      candidates.push(path.join(repoRoot, `apps/estadistica/Temario UAL/Tema ${t} /${fname}`));
    }
    const found = candidates.find(existsSync);
    if (!found) {
      console.warn(`  ✗ no encontrado: ${fname}`);
      continue;
    }
    console.log(`→ Procesando "${mat.title}" (${fname})…`);
    try {
      const html = await extractPdf(found);
      const { error: upErr } = await supabase.from('subject_materials').update({
        html_content: html,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', mat.id);
      if (upErr) console.warn('  ✗ upsert:', upErr.message);
      else console.log(`  ✓ ${html.length.toLocaleString()} chars`);
      processed += 1;
      // Pequeña pausa para evitar rate limit
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      console.warn('  ✗ extract:', err.message);
    }
  }
  console.log(`\nTerminado. ${processed} materiales procesados.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
