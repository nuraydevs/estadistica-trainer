// Sube los PDFs del temario a Gemini File API y cachea los file_uri en Supabase.
// Cache de dos niveles:
//   1. En memoria del módulo (sobrevive entre invocaciones de la misma instancia
//      Vercel/dev server). Acelera invocaciones calientes.
//   2. En Supabase (`tutor_files`). Sobrevive a cold starts y entre instancias.
// Los file_uri caducan ~48h en Gemini.
//
// Los PDFs viven en `portal/.temario/<slug>/` (sincronizados desde
// `apps/<slug>/Temario UAL/` por scripts/sync-temario.mjs antes del build).
// Esto garantiza que Vercel los empaquete con el bundle de la función.

import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// portal/api/_lib → portal/.temario
const TEMARIO_ROOT = path.resolve(__dirname, '..', '..', '.temario');

async function listPdfs(slug) {
  const subjectDir = path.join(TEMARIO_ROOT, slug);
  const out = [];
  await walk(subjectDir, out, subjectDir);
  return out;
}

async function walk(dir, out, baseDir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return; }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out, baseDir);
    } else if (/\.pdf$/i.test(entry.name)) {
      const st = await stat(full);
      out.push({
        absPath: full,
        relPath: path.relative(baseDir, full).split(path.sep).join('/'),
        size: st.size,
        mtime: st.mtime
      });
    }
  }
}

// Sube un archivo a Gemini File API (resumable upload).
async function uploadToGemini(apiKey, { absPath, relPath, mimeType = 'application/pdf', displayName }) {
  const buffer = await readFile(absPath);

  // Step 1: start resumable upload
  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(buffer.byteLength),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file: { display_name: displayName || relPath } })
    }
  );
  if (!startRes.ok) {
    throw new Error(`Gemini upload start failed: ${startRes.status} ${await startRes.text()}`);
  }
  const uploadUrl = startRes.headers.get('x-goog-upload-url');
  if (!uploadUrl) throw new Error('Gemini upload start: missing upload URL');

  // Step 2: upload + finalize
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': String(buffer.byteLength),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize'
    },
    body: buffer
  });
  if (!uploadRes.ok) {
    throw new Error(`Gemini upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  }
  const json = await uploadRes.json();
  const file = json.file;
  if (!file?.uri) throw new Error('Gemini upload: missing file.uri');

  // Step 3: poll until ACTIVE (PDFs procesan en pocos segundos)
  const fileName = file.name; // ej: "files/abc-xyz"
  for (let i = 0; i < 12; i++) {
    const checkRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`
    );
    if (!checkRes.ok) break;
    const checkJson = await checkRes.json();
    if (checkJson.state === 'ACTIVE') {
      return {
        uri: checkJson.uri,
        mimeType: checkJson.mimeType || mimeType,
        expiresAt: checkJson.expirationTime
      };
    }
    if (checkJson.state === 'FAILED') {
      throw new Error('Gemini file processing failed');
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  // Fallback: devolvemos el uri inicial; expiramos en 24h conservador.
  return {
    uri: file.uri,
    mimeType: file.mimeType || mimeType,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * Devuelve los file_uri activos para una asignatura, subiendo lo que falte.
 *
 * @param {object} supabase - cliente service_role
 * @param {string} apiKey   - Gemini API key
 * @param {string} subjectSlug
 * @returns {Promise<Array<{ file_uri: string, mime_type: string, display_name: string }>>}
 */
// In-memory cache. Vive mientras la instancia de la lambda esté caliente.
// Estructura: subjectSlug -> { expiresAt, files: Array<{ file_uri, mime_type, display_name }> }
const memoryCache = new Map();

export function clearMemoryCache(subjectSlug) {
  if (subjectSlug) memoryCache.delete(subjectSlug);
  else memoryCache.clear();
}

export async function getSubjectFiles(supabase, apiKey, subjectSlug) {
  const now = Date.now();
  const buffer = 60 * 60 * 1000; // expirar 1h antes para evitar carreras

  // 1) Cache en memoria
  const mem = memoryCache.get(subjectSlug);
  if (mem && mem.expiresAt - now > buffer && mem.files.length) {
    return mem.files;
  }

  const pdfs = await listPdfs(subjectSlug);
  if (!pdfs.length) {
    console.warn(`[tutor] no PDFs found for subject ${subjectSlug} en ${TEMARIO_ROOT}/${subjectSlug}`);
    return [];
  }

  // 2) Cache en Supabase
  const { data: cached } = await supabase
    .from('tutor_files')
    .select('source_path, source_size, file_uri, mime_type, display_name, expires_at')
    .eq('subject_slug', subjectSlug);

  const cacheByPath = new Map((cached ?? []).map((r) => [r.source_path, r]));

  const result = [];
  let earliestExpiry = Number.POSITIVE_INFINITY;
  for (const pdf of pdfs) {
    const c = cacheByPath.get(pdf.relPath);
    const stillValid =
      c &&
      c.source_size === pdf.size &&
      c.expires_at &&
      new Date(c.expires_at).getTime() - now > buffer;

    if (stillValid) {
      const expiry = new Date(c.expires_at).getTime();
      if (expiry < earliestExpiry) earliestExpiry = expiry;
      result.push({
        file_uri: c.file_uri,
        mime_type: c.mime_type,
        display_name: c.display_name || pdf.relPath
      });
      continue;
    }

    try {
      const uploaded = await uploadToGemini(apiKey, {
        absPath: pdf.absPath,
        relPath: pdf.relPath,
        displayName: pdf.relPath
      });
      await supabase.from('tutor_files').upsert(
        {
          subject_slug: subjectSlug,
          source_path: pdf.relPath,
          source_size: pdf.size,
          source_mtime: pdf.mtime.toISOString(),
          file_uri: uploaded.uri,
          mime_type: uploaded.mimeType,
          display_name: pdf.relPath,
          expires_at: uploaded.expiresAt
        },
        { onConflict: 'subject_slug,source_path' }
      );
      const expiry = new Date(uploaded.expiresAt).getTime();
      if (expiry < earliestExpiry) earliestExpiry = expiry;
      result.push({
        file_uri: uploaded.uri,
        mime_type: uploaded.mimeType,
        display_name: pdf.relPath
      });
    } catch (err) {
      console.warn(`[tutor] upload failed for ${pdf.relPath}:`, err.message);
    }
  }

  // Refresca cache en memoria
  if (result.length && Number.isFinite(earliestExpiry)) {
    memoryCache.set(subjectSlug, { expiresAt: earliestExpiry, files: result });
  }

  return result;
}
