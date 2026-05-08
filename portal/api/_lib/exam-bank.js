// Banco de preguntas tipo examen UAL.
// Distintas a los ejercicios del temario, inspiradas en el estilo del PDF
// EINDUS-T*.pdf. Cada pregunta lleva expectedSolution estructurada que el
// corrector Gemini compara con la respuesta del alumno.
//
// blocks → 'descriptiva' | 'probabilidad' | 'va_discreta' | 'va_continua' |
//          'distribuciones' | 'inferencia'

export const ESTADISTICA_EXAM_BANK = [
  // ─── Tema 1: Estadística descriptiva ───────────────────────
  {
    id: 'eb-est-001',
    block: 'descriptiva',
    concept: 'Medidas de centralización y dispersión',
    difficulty: 'fácil',
    points: 2.0,
    statement: `Los tiempos (en minutos) que tarda un proceso de control de calidad en una línea de envasado, medidos en 8 turnos, son:
4.2, 4.5, 4.1, 4.8, 4.3, 4.6, 4.0, 4.5

a) Calcula la media y la mediana.
b) Calcula la varianza muestral y la desviación típica.
c) Calcula el coeficiente de variación e interpreta su valor.`,
    expectedSolution: {
      a: { method: 'Media aritmética y mediana', steps: [
        'Suma = 35.0; n = 8; media = 35.0 / 8 = 4.375',
        'Ordenados: 4.0, 4.1, 4.2, 4.3, 4.5, 4.5, 4.6, 4.8',
        'Mediana = (4.3 + 4.5) / 2 = 4.4'
      ], answer: { media: 4.375, mediana: 4.4 } },
      b: { method: 'Varianza muestral (n-1)', steps: [
        'Σ(xᵢ - x̄)² = 0.5275',
        's² = 0.5275 / (8-1) = 0.0754',
        's = √0.0754 ≈ 0.275'
      ], answer: { var: 0.0754, sd: 0.275 } },
      c: { method: 'Coeficiente de variación', steps: [
        'CV = s / x̄ = 0.275 / 4.375 ≈ 0.0628 (6.28%)',
        'Interpretación: dispersión muy baja respecto a la media → proceso estable'
      ], answer: 0.0628 }
    }
  },

  // ─── Tema 2: Probabilidad — Bayes y total ─────────────────
  {
    id: 'eb-est-002',
    block: 'probabilidad',
    concept: 'Probabilidad total + Bayes',
    difficulty: 'medio',
    points: 2.5,
    statement: `Una empresa fabrica chips en tres plantas A, B y C, que producen el 50%, 30% y 20% respectivamente. La proporción de chips defectuosos es del 1% en A, 2% en B y 5% en C.

a) ¿Cuál es la probabilidad de que un chip elegido al azar sea defectuoso?
b) Si un chip resulta defectuoso, ¿cuál es la probabilidad de que provenga de la planta C?`,
    expectedSolution: {
      a: { method: 'Probabilidad total', steps: [
        'Sucesos: A, B, C (planta) y D = defectuoso',
        'P(D) = P(A)·P(D|A) + P(B)·P(D|B) + P(C)·P(D|C)',
        'P(D) = 0.50·0.01 + 0.30·0.02 + 0.20·0.05 = 0.005 + 0.006 + 0.010 = 0.021'
      ], answer: 0.021 },
      b: { method: 'Bayes', steps: [
        'P(C|D) = [P(C)·P(D|C)] / P(D) = (0.20·0.05) / 0.021',
        'P(C|D) = 0.010 / 0.021 ≈ 0.476'
      ], answer: 0.476 }
    }
  },
  {
    id: 'eb-est-003',
    block: 'probabilidad',
    concept: 'Independencia y probabilidad condicionada',
    difficulty: 'medio',
    points: 2.0,
    statement: `En un control de calidad de tornillos, se sabe que el 8% de la producción tiene defecto de longitud (L), el 6% defecto de cabeza (C) y el 2% ambos defectos.

a) Calcula la probabilidad de que un tornillo tenga al menos uno de los dos defectos.
b) ¿Son los sucesos L y C independientes? Justifícalo.
c) Sabiendo que un tornillo tiene defecto de longitud, ¿cuál es la probabilidad de que también tenga defecto de cabeza?`,
    expectedSolution: {
      a: { method: 'Unión de sucesos', steps: [
        'P(L ∪ C) = P(L) + P(C) - P(L ∩ C) = 0.08 + 0.06 - 0.02 = 0.12'
      ], answer: 0.12 },
      b: { method: 'Verificar independencia', steps: [
        'P(L)·P(C) = 0.08·0.06 = 0.0048',
        'P(L ∩ C) = 0.02 ≠ 0.0048',
        'No son independientes (de hecho hay dependencia positiva)'
      ], answer: false },
      c: { method: 'Probabilidad condicionada', steps: [
        'P(C|L) = P(L ∩ C) / P(L) = 0.02 / 0.08 = 0.25'
      ], answer: 0.25 }
    }
  },
  {
    id: 'eb-est-004',
    block: 'probabilidad',
    concept: 'Combinatoria + Laplace',
    difficulty: 'fácil',
    points: 2.0,
    statement: `Una caja contiene 12 piezas: 8 son válidas y 4 defectuosas. Se extraen 3 piezas sin reemplazamiento.

a) ¿Cuál es la probabilidad de que las 3 sean válidas?
b) ¿Cuál es la probabilidad de que al menos una sea defectuosa?`,
    expectedSolution: {
      a: { method: 'Hipergeométrica / combinatoria', steps: [
        'Casos favorables: C(8,3) = 56',
        'Casos posibles: C(12,3) = 220',
        'P = 56 / 220 = 14/55 ≈ 0.2545'
      ], answer: 0.2545 },
      b: { method: 'Complementario', steps: [
        'P(al menos 1 defectuosa) = 1 - P(las 3 válidas) = 1 - 0.2545 ≈ 0.7455'
      ], answer: 0.7455 }
    }
  },

  // ─── Tema 3: Variable aleatoria ────────────────────────────
  {
    id: 'eb-est-005',
    block: 'va_discreta',
    concept: 'Esperanza y varianza de una v.a. discreta',
    difficulty: 'medio',
    points: 2.0,
    statement: `Sea X la variable aleatoria que cuenta el número de averías diarias en una máquina, con la siguiente distribución:

  X = 0: P = 0.55
  X = 1: P = 0.25
  X = 2: P = 0.12
  X = 3: P = 0.06
  X = 4: P = 0.02

a) Verifica que la distribución es válida.
b) Calcula E(X) y Var(X).
c) Si cada avería supone un coste de 80€, calcula el coste medio diario y su desviación típica.`,
    expectedSolution: {
      a: { method: 'Suma de probabilidades', steps: [
        '0.55 + 0.25 + 0.12 + 0.06 + 0.02 = 1.00 ✓'
      ], answer: true },
      b: { method: 'Esperanza y varianza', steps: [
        'E(X) = 0·0.55 + 1·0.25 + 2·0.12 + 3·0.06 + 4·0.02 = 0.75',
        'E(X²) = 0 + 0.25 + 0.48 + 0.54 + 0.32 = 1.59',
        'Var(X) = E(X²) - E(X)² = 1.59 - 0.5625 = 1.0275'
      ], answer: { ex: 0.75, var: 1.0275 } },
      c: { method: 'Transformación lineal', steps: [
        'Y = 80·X → E(Y) = 80·E(X) = 60€',
        'Var(Y) = 80²·Var(X) = 6400·1.0275 = 6576',
        'σ(Y) = √6576 ≈ 81.10€'
      ], answer: { ey: 60, sdy: 81.10 } }
    }
  },

  // ─── Tema 4: Distribuciones discretas ─────────────────────
  {
    id: 'eb-est-006',
    block: 'distribuciones',
    concept: 'Distribución Binomial',
    difficulty: 'medio',
    points: 2.5,
    statement: `Una máquina produce piezas con una probabilidad del 4% de ser defectuosas, de forma independiente. Se toma una muestra de 25 piezas.

a) Calcula la probabilidad de que haya exactamente 2 piezas defectuosas.
b) Calcula la probabilidad de que haya como mucho 1 pieza defectuosa.
c) ¿Cuál es el número esperado de piezas defectuosas y su desviación típica?`,
    expectedSolution: {
      a: { method: 'B(25, 0.04)', steps: [
        'P(X=2) = C(25,2)·0.04²·0.96²³',
        'C(25,2) = 300; 0.04² = 0.0016; 0.96²³ ≈ 0.3939',
        'P(X=2) ≈ 300·0.0016·0.3939 ≈ 0.1891'
      ], answer: 0.1891 },
      b: { method: 'P(X≤1) = P(X=0) + P(X=1)', steps: [
        'P(X=0) = 0.96²⁵ ≈ 0.3604',
        'P(X=1) = 25·0.04·0.96²⁴ ≈ 0.3754',
        'P(X≤1) ≈ 0.7358'
      ], answer: 0.7358 },
      c: { method: 'Media y desviación típica binomial', steps: [
        'E(X) = n·p = 25·0.04 = 1.0',
        'Var(X) = n·p·(1-p) = 0.96; σ = √0.96 ≈ 0.98'
      ], answer: { mu: 1.0, sd: 0.98 } }
    }
  },
  {
    id: 'eb-est-007',
    block: 'distribuciones',
    concept: 'Distribución de Poisson',
    difficulty: 'medio',
    points: 2.5,
    statement: `El número de llamadas recibidas en una centralita sigue una distribución de Poisson con media de 6 llamadas cada 15 minutos.

a) ¿Cuál es la probabilidad de recibir exactamente 4 llamadas en 15 minutos?
b) ¿Cuál es la probabilidad de recibir más de 10 llamadas en 30 minutos?
c) Si entran más de 20 llamadas por hora se considera saturación. ¿Probabilidad de saturación?`,
    expectedSolution: {
      a: { method: 'Poisson λ=6', steps: [
        'P(X=4) = e⁻⁶ · 6⁴ / 4! = 0.002479 · 1296 / 24',
        'P(X=4) ≈ 0.1339'
      ], answer: 0.1339 },
      b: { method: 'Poisson λ=12 (30 min)', steps: [
        'En 30 min, λ = 12',
        'P(X>10) = 1 - P(X≤10) ≈ 1 - 0.3472 ≈ 0.6528'
      ], answer: 0.6528 },
      c: { method: 'Poisson λ=24 (60 min)', steps: [
        'En 1 h, λ = 24',
        'P(X>20) = 1 - P(X≤20) ≈ 1 - 0.2426 ≈ 0.7574'
      ], answer: 0.7574 }
    }
  },

  // ─── Tema 4: Distribuciones continuas ─────────────────────
  {
    id: 'eb-est-008',
    block: 'va_continua',
    concept: 'Distribución Normal — tipificación',
    difficulty: 'medio',
    points: 2.5,
    statement: `El diámetro de los pistones producidos por una máquina sigue una distribución Normal con media 50 mm y desviación típica 0.4 mm. Las especificaciones son 50 ± 0.8 mm.

a) ¿Qué porcentaje de pistones cumplen las especificaciones?
b) ¿Qué porcentaje de pistones tienen un diámetro mayor de 50.6 mm?
c) Si producen 1000 pistones al día, ¿cuántos esperarías rechazar por estar fuera de especificación?`,
    expectedSolution: {
      a: { method: 'Tipificación P(49.2 < X < 50.8)', steps: [
        'Z₁ = (49.2 - 50)/0.4 = -2; Z₂ = (50.8 - 50)/0.4 = 2',
        'P(-2 < Z < 2) = Φ(2) - Φ(-2) = 0.9772 - 0.0228 = 0.9544',
        '95.44%'
      ], answer: 0.9544 },
      b: { method: 'P(X > 50.6)', steps: [
        'Z = (50.6 - 50)/0.4 = 1.5',
        'P(Z > 1.5) = 1 - 0.9332 = 0.0668',
        '6.68%'
      ], answer: 0.0668 },
      c: { method: 'Esperado rechazados', steps: [
        'P(rechazo) = 1 - 0.9544 = 0.0456',
        '1000 · 0.0456 ≈ 46 pistones rechazados/día'
      ], answer: 46 }
    }
  },
  {
    id: 'eb-est-009',
    block: 'va_continua',
    concept: 'Distribución Exponencial',
    difficulty: 'medio',
    points: 2.0,
    statement: `El tiempo entre fallos consecutivos de un sistema sigue una distribución exponencial con media de 200 horas.

a) ¿Cuál es la probabilidad de que el sistema funcione más de 250 horas sin fallar?
b) Si el sistema lleva 100 horas funcionando sin fallos, ¿cuál es la probabilidad de que aguante otras 150 horas más sin fallar? Comenta el resultado.`,
    expectedSolution: {
      a: { method: 'Exponencial λ=1/200', steps: [
        'P(X > 250) = e^(-250/200) = e^(-1.25) ≈ 0.2865'
      ], answer: 0.2865 },
      b: { method: 'Falta de memoria', steps: [
        'P(X > 100+150 | X > 100) = P(X > 150) = e^(-150/200) = e^(-0.75) ≈ 0.4724',
        'Resultado: la exponencial NO tiene memoria → el haber funcionado 100h no aporta información'
      ], answer: 0.4724 }
    }
  },
  {
    id: 'eb-est-010',
    block: 'va_continua',
    concept: 'Aproximación Binomial → Normal',
    difficulty: 'avanzado',
    points: 2.5,
    statement: `En una empresa, el 30% de los trabajadores son mujeres. Se elige una muestra aleatoria de 100 trabajadores.

a) ¿Cuál es la distribución exacta del número de mujeres en la muestra?
b) Aproxima la probabilidad de que haya al menos 40 mujeres usando la Normal con corrección por continuidad.`,
    expectedSolution: {
      a: { method: 'Identificación', steps: [
        'X ~ B(100, 0.3)',
        'E(X) = 30; Var(X) = 100·0.3·0.7 = 21; σ = √21 ≈ 4.583'
      ], answer: 'B(100, 0.3)' },
      b: { method: 'Aproximación normal con continuidad', steps: [
        'Aprox: X ~ N(30, √21)',
        'Con corrección: P(X ≥ 40) ≈ P(Y ≥ 39.5)',
        'Z = (39.5 - 30)/4.583 ≈ 2.072',
        'P(Z ≥ 2.072) ≈ 1 - 0.9809 ≈ 0.0191'
      ], answer: 0.0191 }
    }
  },

  // ─── Tema 5: Inferencia ────────────────────────────────────
  {
    id: 'eb-est-011',
    block: 'inferencia',
    concept: 'Intervalo de confianza para la media',
    difficulty: 'medio',
    points: 2.5,
    statement: `Una muestra aleatoria de 36 piezas producidas por una máquina presenta una longitud media de 25.4 mm con desviación típica muestral 1.2 mm. Suponiendo que la longitud sigue una distribución Normal:

a) Construye un intervalo de confianza al 95% para la longitud media.
b) ¿Y al 99%?
c) ¿Qué tamaño muestral se necesitaría para que el error máximo del intervalo al 95% sea ≤ 0.3 mm?`,
    expectedSolution: {
      a: { method: 'IC 95% con t (n=36)', steps: [
        'Para 35 g.l., t₀.₀₂₅ ≈ 2.030 (en la práctica con n grande se aproxima por z=1.96)',
        'Error = 1.96 · 1.2/√36 = 1.96·0.2 = 0.392',
        'IC = 25.4 ± 0.392 → (25.008, 25.792)'
      ], answer: '[25.01, 25.79]' },
      b: { method: 'IC 99%', steps: [
        'z₀.₀₀₅ = 2.576',
        'Error = 2.576·0.2 = 0.515',
        'IC = (24.885, 25.915)'
      ], answer: '[24.89, 25.92]' },
      c: { method: 'Cálculo de n', steps: [
        'E ≤ z·σ/√n → n ≥ (z·σ/E)²',
        'n ≥ (1.96·1.2/0.3)² = 7.84² ≈ 61.5',
        'n = 62 (redondeo hacia arriba)'
      ], answer: 62 }
    }
  },
  {
    id: 'eb-est-012',
    block: 'inferencia',
    concept: 'Contraste de hipótesis para la media',
    difficulty: 'avanzado',
    points: 3.0,
    statement: `Un fabricante afirma que la duración media de sus baterías es de al menos 120 horas. Una muestra de 49 baterías arroja una media de 117.5 h con desviación típica muestral 8 h.

a) Plantea el contraste de hipótesis adecuado y la región crítica al 5%.
b) Calcula el estadístico de contraste y decide.
c) Calcula el p-valor del contraste.`,
    expectedSolution: {
      a: { method: 'Planteamiento', steps: [
        'H₀: μ ≥ 120  vs  H₁: μ < 120 (contraste unilateral inferior)',
        'Región crítica: rechazar H₀ si Z < -z₀.₀₅ = -1.645'
      ], answer: 'unilateral izquierdo, z<-1.645' },
      b: { method: 'Estadístico Z', steps: [
        'Z = (x̄ - μ₀) / (s/√n) = (117.5 - 120) / (8/√49)',
        'Z = -2.5 / (8/7) = -2.5 / 1.143 ≈ -2.188',
        '-2.188 < -1.645 → rechazamos H₀: hay evidencia de que μ < 120'
      ], answer: { z: -2.188, decision: 'rechazar H0' } },
      c: { method: 'p-valor', steps: [
        'p = P(Z < -2.188) ≈ 0.0143',
        'Como p < 0.05, rechazamos H₀'
      ], answer: 0.0143 }
    }
  },
  {
    id: 'eb-est-013',
    block: 'inferencia',
    concept: 'IC para una proporción',
    difficulty: 'medio',
    points: 2.0,
    statement: `Se quiere estimar la proporción de piezas defectuosas en una gran lote. En una muestra de 200 piezas se han encontrado 18 defectuosas.

a) Calcula el intervalo de confianza al 95% para la proporción de defectuosas en el lote.
b) Si se desea reducir el error a la mitad manteniendo el 95% de confianza, ¿cuántas piezas habría que muestrear?`,
    expectedSolution: {
      a: { method: 'IC proporción', steps: [
        'p̂ = 18/200 = 0.09',
        'Error = z·√[p̂·(1-p̂)/n] = 1.96·√(0.09·0.91/200) = 1.96·0.0202 ≈ 0.0397',
        'IC = (0.050, 0.130)'
      ], answer: '[0.050, 0.130]' },
      b: { method: 'Reducir error a la mitad', steps: [
        'Para reducir el error a la mitad → n se multiplica por 4',
        'n_nuevo = 200·4 = 800 piezas'
      ], answer: 800 }
    }
  }
];

// ─── Selección por modo de examen ──────────────────────────────

export function pickExamQuestions(mode, profile = null) {
  const pool = ESTADISTICA_EXAM_BANK;

  if (mode === 'completo') {
    // 4-5 preguntas cubriendo varios bloques. Garantizamos al menos uno
    // de cada gran bloque.
    const blocks = ['descriptiva', 'probabilidad', 'va_discreta', 'va_continua', 'inferencia'];
    const picked = [];
    for (const b of blocks) {
      const candidates = pool.filter((p) => p.block === b);
      if (candidates.length) picked.push(candidates[Math.floor(Math.random() * candidates.length)]);
    }
    if (picked.length < 4) {
      const extra = pool.filter((p) => !picked.includes(p));
      while (picked.length < 5 && extra.length) picked.push(extra.splice(Math.floor(Math.random() * extra.length), 1)[0]);
    }
    return picked.slice(0, 5);
  }

  if (mode === 'parcial') {
    // 2 preguntas centradas en conceptos débiles del perfil.
    const weak = profile
      ? [...(profile.concepts_broken || []), ...(profile.concepts_weak || [])].map((c) => (c.concept || c).toLowerCase())
      : [];
    const matches = pool.filter((p) => weak.some((w) => p.concept.toLowerCase().includes(w) || w.includes(p.concept.toLowerCase())));
    if (matches.length >= 2) return matches.slice(0, 2);
    // Fallback: bloques 2 y 4 (probabilidad y distribuciones)
    const fallback = pool.filter((p) => ['probabilidad', 'va_continua', 'distribuciones'].includes(p.block));
    return fallback.slice(0, 2);
  }

  if (mode === 'panico') {
    // 3 preguntas de lo que más cae: probabilidad + distribuciones + inferencia
    const heavy = pool.filter((p) => ['probabilidad', 'distribuciones', 'va_continua'].includes(p.block));
    return heavy.slice(0, 3);
  }

  return pool.slice(0, 2);
}

// Acceso a la solución esperada (sólo se usa server-side)
export function getExpectedSolution(questionId) {
  return ESTADISTICA_EXAM_BANK.find((q) => q.id === questionId)?.expectedSolution || null;
}

// Para enviar al cliente, omitimos la expectedSolution
export function publicQuestion(q) {
  if (!q) return null;
  const { expectedSolution, ...rest } = q;
  return rest;
}
