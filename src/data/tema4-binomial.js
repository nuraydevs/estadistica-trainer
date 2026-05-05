const TYPES = ['Binomial', 'Poisson', 'Normal', 'Exponencial'];

export const binomialBlock = {
  id: 'binomial',
  tema: 4,
  title: 'Bloque 3 · Distribución Binomial',
  priority: 'priority',
  priorityLabel: 'Cae siempre',
  why: 'La distribución discreta más típica del examen. La identificas si hay n ensayos independientes con dos resultados (éxito/fracaso) y misma probabilidad. Suele venir mezclada con preguntas tipo "al menos uno", "como máximo k", o cálculo de media/varianza.',

  theory: {
    keyFormulas: [
      {
        label: 'Función de masa',
        latex: 'P(X = k) = C(n, k) · pᵏ · (1−p)ⁿ⁻ᵏ',
        note: 'X → B(n, p), k = 0, 1, ..., n'
      },
      {
        label: 'Esperanza',
        latex: 'E[X] = n · p',
        note: 'número medio de éxitos'
      },
      {
        label: 'Varianza',
        latex: 'Var[X] = n · p · (1 − p)',
        note: 'desviación típica = √(n·p·q)'
      },
      {
        label: 'En R',
        latex: 'dbinom(k, n, p)   pbinom(k, n, p)',
        note: 'puntual P(X=k) y acumulada P(X≤k)'
      }
    ],

    identify: [
      {
        signal: 'Repites un experimento n veces de forma independiente con la misma p',
        type: '→ Binomial'
      },
      {
        signal: 'Cada repetición tiene exactamente dos resultados (éxito/fracaso, sí/no, defectuoso/bueno)',
        type: '→ Binomial'
      },
      {
        signal: '"De las 10 piezas, ¿cuántas defectuosas?" o "lanza la moneda n veces"',
        type: '→ Binomial con éxito = "defectuosa" o "cara"'
      },
      {
        signal: '"Al menos una", "como mucho k", "exactamente k éxitos"',
        type: '→ Binomial. Ojo con la cota: "al menos 1" = 1 − P(X=0)'
      }
    ],

    template: [
      'Identifica el experimento de Bernoulli y define el "éxito" claramente (no tiene por qué ser algo bueno).',
      'Calcula n (número de repeticiones) y p (probabilidad de éxito en una repetición).',
      'Escribe X → B(n, p).',
      'Si te piden P(X = k): aplica la fórmula puntual.',
      'Si te piden P(X ≤ k): suma o usa pbinom.',
      'Si te piden P(X ≥ k): usa P(X ≥ k) = 1 − P(X ≤ k − 1).',
      'Para "al menos uno": P(X ≥ 1) = 1 − P(X = 0) = 1 − (1−p)ⁿ.',
      'Para media: E[X] = np. Varianza: np(1−p).'
    ],

    complete: `
      <p><strong>Ensayo de Bernoulli.</strong> Experimento aleatorio con dos posibles resultados, mutuamente excluyentes y exhaustivos: éxito (A) y fracaso (Ā). Se denota p = P(A) y q = 1 − p = P(Ā). La v.a. de Bernoulli toma valor 1 si ocurre éxito y 0 si fracaso, y se escribe X → Be(p).</p>

      <p><strong>Distribución binomial.</strong> Si repetimos n ensayos de Bernoulli independientes, con p constante, y definimos X = número total de éxitos, entonces X → B(n, p). Su soporte es {0, 1, ..., n} y su función de masa de probabilidad es:</p>
      <p style="text-align:center"><em>P(X = k) = C(n, k) · pᵏ · (1−p)ⁿ⁻ᵏ</em>, con k = 0, 1, ..., n</p>
      <p>donde C(n, k) = n! / (k!·(n−k)!) es el número combinatorio (cuenta las formas de colocar k éxitos en n posiciones).</p>

      <p><strong>Características.</strong> E[X] = np, Var[X] = np(1−p), σ[X] = √(np(1−p)).</p>

      <p><strong>Reproductividad.</strong> Si X₁ → B(n₁, p), X₂ → B(n₂, p), independientes, entonces X₁ + X₂ → B(n₁ + n₂, p). La p tiene que ser la misma.</p>

      <p><strong>Aproximación a Normal.</strong> Si X → B(n, p) con np > 5 y p ≤ ½ (o n grande), se puede aproximar por Y → N(μ = np, σ = √(np(1−p))). Conviene aplicar corrección por continuidad: P(X ≤ k) ≈ P(Y ≤ k + 0.5).</p>
    `
  },

  exercises: [
    {
      id: 'b3-e1',
      statement: 'Un examen tipo test consta de 15 preguntas con 4 posibles respuestas cada una. Una persona responde al azar todas las preguntas y nos interesa la variable X = "número de preguntas que fallará en todo el examen". Calcula la probabilidad de que falle exactamente 10 preguntas.',
      sourceNote: 'Ejercicio 2.1 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 0,
      typeExplanation: 'n = 15 preguntas independientes, dos resultados por pregunta (fallar/acertar) con misma probabilidad. Es Binomial.',
      hints: [
        'Define el éxito como "fallar la pregunta" (es lo que cuenta X). p = 3/4 = 0.75 (3 respuestas erróneas de 4). n = 15.',
        'X → B(15, 0.75). Aplica la fórmula puntual: P(X = 10) = C(15, 10) · 0.75¹⁰ · 0.25⁵.',
        'C(15, 10) = 3003. 0.75¹⁰ ≈ 0.0563. 0.25⁵ ≈ 0.000977.'
      ],
      answer: 0.1651,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> identificación. Cada pregunta es un ensayo de Bernoulli con éxito = "fallar". p = 3/4 = 0.75 (1 acierto entre 4 posibilidades, así que 3/4 son fallos).',
        '<strong>Paso 2:</strong> n = 15 preguntas independientes con la misma p ⇒ X → B(15, 0.75).',
        '<strong>Paso 3:</strong> aplicamos la fórmula puntual: P(X = 10) = C(15, 10) · 0.75¹⁰ · 0.25⁵.',
        '<strong>Paso 4:</strong> C(15, 10) = 3003. 0.75¹⁰ ≈ 0.05631. 0.25⁵ ≈ 0.000977.',
        '<strong>Paso 5:</strong> P(X = 10) = 3003 · 0.05631 · 0.000977 ≈ <strong>0.1651</strong>. En R: dbinom(10, 15, 0.75).'
      ]
    },

    {
      id: 'b3-e2',
      statement: 'Mismo examen tipo test del ejercicio anterior (15 preguntas, p = 0.75 de fallar). Calcula la probabilidad de que falle como máximo 8 preguntas.',
      sourceNote: 'Ejercicio 2.2 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 0,
      typeExplanation: 'Sigue siendo X → B(15, 0.75), pero ahora pides una probabilidad acumulada P(X ≤ 8) en lugar de puntual.',
      hints: [
        '"Como máximo 8" significa P(X ≤ 8) = P(X = 0) + P(X = 1) + ... + P(X = 8).',
        'En la práctica se usa pbinom(8, 15, 0.75) en R, que devuelve directamente la probabilidad acumulada.',
        'Es un valor pequeño: con p = 0.75 lo más probable es fallar muchas preguntas, así que fallar pocas (≤8) es raro.'
      ],
      answer: 0.0566,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → B(15, 0.75). Buscamos P(X ≤ 8).',
        '<strong>Paso 2:</strong> P(X ≤ 8) = Σ desde k = 0 hasta 8 de C(15, k) · 0.75ᵏ · 0.25¹⁵⁻ᵏ.',
        '<strong>Paso 3:</strong> sumando los términos (o con pbinom(8, 15, 0.75) en R) obtenemos P(X ≤ 8) ≈ <strong>0.0566</strong>.',
        '<strong>Interpretación:</strong> con respuestas al azar, la probabilidad de fallar 8 o menos de 15 preguntas es del 5.66%. Con p = 0.75 la mayoría de las veces fallarás bastantes más.'
      ]
    },

    {
      id: 'b3-e3',
      statement: 'Mismo examen tipo test (15 preguntas, p = 0.75 de fallar). Calcula la probabilidad de fallar como mínimo 13 preguntas.',
      sourceNote: 'Ejercicio 2.3 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 0,
      typeExplanation: 'X → B(15, 0.75) y "como mínimo 13" es P(X ≥ 13). Lo calculas con la cola: 1 − P(X ≤ 12).',
      hints: [
        'P(X ≥ 13) = P(X = 13) + P(X = 14) + P(X = 15) = 1 − P(X ≤ 12).',
        'En R: 1 − pbinom(12, 15, 0.75) o bien pbinom(12, 15, 0.75, lower.tail = FALSE).',
        'Con p alta (0.75) los valores cercanos a n son los más probables, así que la cola superior pesa.'
      ],
      answer: 0.2361,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → B(15, 0.75). Buscamos P(X ≥ 13).',
        '<strong>Paso 2:</strong> P(X ≥ 13) = 1 − P(X ≤ 12).',
        '<strong>Paso 3:</strong> calculamos cada término. P(X=13) = C(15,13)·0.75¹³·0.25² ≈ 0.1559. P(X=14) ≈ 0.0668. P(X=15) ≈ 0.0134.',
        '<strong>Paso 4:</strong> P(X ≥ 13) ≈ 0.1559 + 0.0668 + 0.0134 ≈ <strong>0.2361</strong>.'
      ]
    },

    {
      id: 'b3-e4',
      statement: 'Mismo examen tipo test (X = "número de preguntas que fallará", 15 preguntas, p = 0.75). Calcula el número medio de preguntas que fallará.',
      sourceNote: 'Ejercicio 3 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 0,
      typeExplanation: 'Distribución Binomial. La media (esperanza) es directamente n · p.',
      hints: [
        'Para una v.a. Binomial X → B(n, p), la media es E[X] = n · p.',
        'En este caso n = 15, p = 0.75.',
        'Sustituye y calcula.'
      ],
      answer: 11.25,
      tolerance: 0.01,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → B(15, 0.75).',
        '<strong>Paso 2:</strong> para una Binomial, E[X] = n · p.',
        '<strong>Paso 3:</strong> E[X] = 15 · 0.75 = <strong>11.25</strong>.',
        '<strong>Interpretación:</strong> respondiendo al azar, en promedio fallará 11.25 preguntas de las 15. La desviación típica es σ = √(15·0.75·0.25) = √2.8125 ≈ 1.67.'
      ]
    },

    {
      id: 'b3-e5',
      statement: 'La probabilidad de encontrar aparcamiento delante del Aulario-I cualquier día, de lunes a viernes, es de 0.25. Para una semana lectiva de cinco días, calcula la probabilidad de que encuentre aparcamiento al menos tres días.',
      sourceNote: 'Ejercicio 5.c del PDF de ejercicios Tema 4',
      types: TYPES,
      correctType: 0,
      typeExplanation: 'Cinco días independientes con la misma p = 0.25 de encontrar aparcamiento. Cuentas el número de días con aparcamiento ⇒ Binomial.',
      hints: [
        'X = "número de días con aparcamiento en una semana". n = 5, p = 0.25, X → B(5, 0.25).',
        '"Al menos tres días" = P(X ≥ 3) = P(X=3) + P(X=4) + P(X=5).',
        'P(X=3) = C(5,3)·0.25³·0.75² = 10·0.015625·0.5625. P(X=4) = 5·0.00391·0.75. P(X=5) = 0.25⁵.'
      ],
      answer: 0.1035,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X = "número de días con aparcamiento en la semana". Cada día es Bernoulli con éxito = "encuentra aparcamiento", p = 0.25.',
        '<strong>Paso 2:</strong> 5 días independientes con la misma p ⇒ X → B(5, 0.25).',
        '<strong>Paso 3:</strong> "al menos 3" ⇒ P(X ≥ 3) = P(X=3) + P(X=4) + P(X=5).',
        '<strong>Paso 4:</strong> P(X=3) = C(5,3) · 0.25³ · 0.75² = 10 · 0.015625 · 0.5625 ≈ 0.0879.',
        '<strong>Paso 5:</strong> P(X=4) = C(5,4) · 0.25⁴ · 0.75 = 5 · 0.003906 · 0.75 ≈ 0.0146. P(X=5) = 0.25⁵ ≈ 0.00098.',
        '<strong>Paso 6:</strong> P(X ≥ 3) ≈ 0.0879 + 0.0146 + 0.00098 ≈ <strong>0.1035</strong>.'
      ]
    }
  ]
};
