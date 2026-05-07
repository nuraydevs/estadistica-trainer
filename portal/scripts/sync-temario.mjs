#!/usr/bin/env node
// Copia los PDFs del temario de cada asignatura a portal/.temario/<slug>/
// para que (a) Vercel pueda incluirlos en el bundle de la función serverless
// (vía includeFiles en vercel.json) y (b) la cwd del runtime sea consistente
// entre dev y prod.

import { readdir, stat, mkdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portalDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(portalDir, '..');
const targetRoot = path.join(portalDir, '.temario');

const SUBJECTS = [
  { slug: 'estadistica', source: 'apps/estadistica/Temario UAL' }
];

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function copyPdfs(srcAbs, dstAbs) {
  let entries = [];
  try { entries = await readdir(srcAbs, { withFileTypes: true }); }
  catch { return 0; }
  let count = 0;
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const srcPath = path.join(srcAbs, entry.name);
    const dstPath = path.join(dstAbs, entry.name);
    if (entry.isDirectory()) {
      await mkdir(dstPath, { recursive: true });
      count += await copyPdfs(srcPath, dstPath);
    } else if (/\.pdf$/i.test(entry.name)) {
      await mkdir(path.dirname(dstPath), { recursive: true });
      await copyFile(srcPath, dstPath);
      count += 1;
    }
  }
  return count;
}

let total = 0;
for (const subject of SUBJECTS) {
  const srcAbs = path.join(repoRoot, subject.source);
  const dstAbs = path.join(targetRoot, subject.slug);
  if (!(await exists(srcAbs))) {
    console.log(`[sync-temario] ${subject.slug}: sin carpeta de origen, skip`);
    continue;
  }
  await rm(dstAbs, { recursive: true, force: true });
  await mkdir(dstAbs, { recursive: true });
  const n = await copyPdfs(srcAbs, dstAbs);
  console.log(`[sync-temario] ${subject.slug}: ${n} PDFs copiados`);
  total += n;
}

if (total === 0) {
  console.log('[sync-temario] no se copió nada (OK si aún no hay material).');
}
