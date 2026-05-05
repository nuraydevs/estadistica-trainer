// Bloques antiguos de práctica (BlockView original)
import { bayesBlock } from './tema2-bayes.js';
import { condicionadaBlock } from './tema2-condicionada.js';
import { binomialBlock } from './tema4-binomial.js';
import { poissonBlock } from './tema4-poisson.js';
import { normalBlock } from './tema4-normal.js';
import { exponencialBlock } from './tema4-exponencial.js';

// Temas (teoría completa)
import { tema1 } from './temas/tema1.js';
import { tema2 } from './temas/tema2.js';
import { tema3 } from './temas/tema3.js';
import { tema4 } from './temas/tema4.js';
import { tema5 } from './temas/tema5.js';

// Resúmenes
import { tema1Resumen } from './resumenes/tema1-resumen.js';
import { tema2Resumen } from './resumenes/tema2-resumen.js';
import { tema3Resumen } from './resumenes/tema3-resumen.js';
import { tema4Resumen } from './resumenes/tema4-resumen.js';
import { tema5Resumen } from './resumenes/tema5-resumen.js';

// Ejercicios
import { tema1Ejercicios } from './ejercicios/tema1-ejercicios.js';
import { tema2Ejercicios } from './ejercicios/tema2-ejercicios.js';
import { tema3Ejercicios } from './ejercicios/tema3-ejercicios.js';
import { tema4Ejercicios } from './ejercicios/tema4-ejercicios.js';
import { tema5Ejercicios } from './ejercicios/tema5-ejercicios.js';

// Resueltos
import { tema1Resueltos } from './resueltos/tema1-resueltos.js';
import { tema2Resueltos } from './resueltos/tema2-resueltos.js';
import { tema3Resueltos } from './resueltos/tema3-resueltos.js';
import { tema4Resueltos } from './resueltos/tema4-resueltos.js';
import { tema5Resueltos } from './resueltos/tema5-resueltos.js';

// Aprendizaje
import { tema1Aprendizaje } from './aprendizaje/tema1-aprendizaje.js';
import { tema2Aprendizaje } from './aprendizaje/tema2-aprendizaje.js';
import { tema3Aprendizaje } from './aprendizaje/tema3-aprendizaje.js';
import { tema4Aprendizaje } from './aprendizaje/tema4-aprendizaje.js';
import { tema5Aprendizaje } from './aprendizaje/tema5-aprendizaje.js';

// Quiz
import { tema1Quiz } from './quiz/tema1-quiz.js';
import { tema2Quiz } from './quiz/tema2-quiz.js';
import { tema3Quiz } from './quiz/tema3-quiz.js';
import { tema4Quiz } from './quiz/tema4-quiz.js';
import { tema5Quiz } from './quiz/tema5-quiz.js';

// Formulario
import { FORMULAS } from './formulario.js';

// ─── Bloques de práctica (legacy / BlockView)
export const BLOCKS = [
  bayesBlock,
  condicionadaBlock,
  binomialBlock,
  poissonBlock,
  normalBlock,
  exponencialBlock
];

export function getBlocksByTema(tema) {
  return BLOCKS.filter((b) => b.tema === tema);
}

export function getBlockById(id) {
  return BLOCKS.find((b) => b.id === id);
}

// ─── Temas
export const TEMAS = [tema1, tema2, tema3, tema4, tema5];
export function getTemaById(id) {
  return TEMAS.find((t) => t.id === id);
}

// ─── Resúmenes
export const RESUMENES = [tema1Resumen, tema2Resumen, tema3Resumen, tema4Resumen, tema5Resumen];
export function getResumenByTema(tema) {
  return RESUMENES.find((r) => r.id === tema);
}

// ─── Ejercicios (todos los del PDF)
export const EJERCICIOS_BY_TEMA = {
  1: tema1Ejercicios,
  2: tema2Ejercicios,
  3: tema3Ejercicios,
  4: tema4Ejercicios,
  5: tema5Ejercicios
};

export const ALL_EJERCICIOS = [
  ...tema1Ejercicios.map((e) => ({ ...e, tema: 1 })),
  ...tema2Ejercicios.map((e) => ({ ...e, tema: 2 })),
  ...tema3Ejercicios.map((e) => ({ ...e, tema: 3 })),
  ...tema4Ejercicios.map((e) => ({ ...e, tema: 4 })),
  ...tema5Ejercicios.map((e) => ({ ...e, tema: 5 }))
];

// ─── Resueltos (con solución paso a paso)
export const RESUELTOS_BY_TEMA = {
  1: tema1Resueltos,
  2: tema2Resueltos,
  3: tema3Resueltos,
  4: tema4Resueltos,
  5: tema5Resueltos
};

export const ALL_RESUELTOS = [
  ...tema1Resueltos.map((e) => ({ ...e, tema: 1 })),
  ...tema2Resueltos.map((e) => ({ ...e, tema: 2 })),
  ...tema3Resueltos.map((e) => ({ ...e, tema: 3 })),
  ...tema4Resueltos.map((e) => ({ ...e, tema: 4 })),
  ...tema5Resueltos.map((e) => ({ ...e, tema: 5 }))
];

// ─── Aprendizaje
export const APRENDIZAJE_BY_TEMA = {
  1: tema1Aprendizaje,
  2: tema2Aprendizaje,
  3: tema3Aprendizaje,
  4: tema4Aprendizaje,
  5: tema5Aprendizaje
};

// ─── Quiz
export const QUIZ_BY_TEMA = {
  1: tema1Quiz,
  2: tema2Quiz,
  3: tema3Quiz,
  4: tema4Quiz,
  5: tema5Quiz
};

export const ALL_QUIZ = [
  ...tema1Quiz, ...tema2Quiz, ...tema3Quiz, ...tema4Quiz, ...tema5Quiz
];

// ─── Formulario
export { FORMULAS };
