#!/usr/bin/env node
// Crea (o actualiza) un usuario admin en Supabase usando la service_role key.
//
// Uso:
//   1. Asegúrate de tener portal/.env.local con SUPABASE_SERVICE_ROLE_KEY y VITE_SUPABASE_URL.
//   2. Desde la raíz del repo:
//        node scripts/create-admin.mjs <email> <password> "Nombre Apellido"
//      o sin args (te pedirá los datos por prompt).
//
// Requiere: npm install @supabase/supabase-js dotenv (ya están en portal/)

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', 'portal', '.env.local');

let env = {};
try {
  const raw = readFileSync(envPath, 'utf8');
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim();
    env[k] = v;
  });
} catch (err) {
  console.error(`No se pudo leer ${envPath}.`);
  console.error('Crea portal/.env.local copiando portal/.env.example.');
  process.exit(1);
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en portal/.env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
let email = args[0];
let password = args[1];
let fullName = args[2];

if (!email || !password) {
  const rl = readline.createInterface({ input, output });
  if (!email) email = (await rl.question('Email: ')).trim();
  if (!password) password = (await rl.question('Password (mín 6 caracteres): ')).trim();
  if (!fullName) fullName = (await rl.question('Nombre completo: ')).trim();
  rl.close();
}

const subjectsArg = args[3] || 'estadistica';
const subjects = subjectsArg.split(',').map((s) => s.trim()).filter(Boolean);

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log(`Creando usuario ${email}…`);
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName }
});

let userId;
if (createErr) {
  if (!/already registered|exists/i.test(createErr.message)) {
    console.error('Error creando usuario en auth:', createErr.message);
    process.exit(1);
  }
  console.log('Usuario ya existe en auth, lo recupero…');
  const { data: list } = await supabase.auth.admin.listUsers();
  const found = list.users.find((u) => u.email === email);
  if (!found) {
    console.error('No encontré el usuario por email. Abortando.');
    process.exit(1);
  }
  userId = found.id;
} else {
  userId = created.user.id;
}

console.log(`Marco como admin y activo en public.users (id ${userId})…`);
const { error: profErr } = await supabase
  .from('users')
  .upsert(
    { id: userId, email, full_name: fullName, is_admin: true, active: true },
    { onConflict: 'id' }
  );
if (profErr) {
  console.error('Error en public.users:', profErr.message);
  process.exit(1);
}

if (subjects.length) {
  console.log(`Desbloqueando asignaturas: ${subjects.join(', ')}`);
  for (const slug of subjects) {
    const { error } = await supabase.from('user_subjects').upsert(
      { user_id: userId, subject_slug: slug, granted_by: userId },
      { onConflict: 'user_id,subject_slug' }
    );
    if (error) console.warn(`  ⚠ ${slug}: ${error.message}`);
  }
}

console.log('\n✓ Listo.');
console.log(`  Email: ${email}`);
console.log(`  Password: ${password}`);
console.log('  Ya puedes entrar al portal.');
