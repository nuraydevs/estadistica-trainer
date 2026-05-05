const TYPES = ['Binomial', 'Poisson', 'Normal', 'Exponencial'];

export const poissonBlock = {
  id: 'poisson',
  tema: 4,
  title: 'Bloque 4 · Distribución de Poisson',
  priority: 'high',
  priorityLabel: 'Casi siempre',
  why: 'Cuando cuentas eventos que ocurren a lo largo de un intervalo de tiempo o región (reclamaciones por día, llamadas por hora, defectos por metro), es Poisson. Identificar λ y trabajar con él es el patrón típico.',

  theory: {
    keyFormulas: [
      {
        label: 'Función de masa',
        latex: 'P(X = k) = (λᵏ · e⁻λ) / k!',
        note: 'X → P(λ), k = 0, 1, 2, ...'
      },
      {
        label: 'Esperanza y varianza',
        latex: 'E[X] = λ,    Var[X] = λ',
        note: 'la varianza coincide con la media (rasgo distintivo)'
      },
      {
        label: 'Reproductividad',
        latex: 'X₁ → P(λ₁), X₂ → P(λ₂)  ⇒  X₁ + X₂ → P(λ₁ + λ₂)',
        note: 'útil para escalar el intervalo (de 1 día a 1 semana, etc.)'
      },
      {
        label: 'En R',
        latex: 'dpois(k, λ)   ppois(k, λ)',
        note: 'puntual y acumulada'
      }
    ],

    identify: [
      {
        signal: 'Cuentas el número de veces que ocurre un suceso en un intervalo de tiempo o región',
        type: '→ Poisson'
      },
      {
        signal: '"Reclamaciones por día", "llamadas por hora", "fallos por kilómetro", "averías por mes"',
        type: '→ Poisson con λ = media en ese intervalo'
      },
      {
        signal: 'Te dan una media de eventos por unidad de tiempo y preguntan por una unidad distinta',
        type: '→ Poisson, escala λ multiplicando por el factor de tiempo'
      },
      {
        signal: 'Binomial con n grande y p pequeña (n > 30, p ≤ 0.1)',
        type: '→ Aproxima por Poisson con λ = np'
      }
    ],

    template: [
      'Identifica el suceso que cuentas y la unidad temporal o espacial.',
      'Calcula λ: el número medio de sucesos en esa unidad.',
      'Si te piden la probabilidad en una unidad distinta, escala λ proporcionalmente (reproductividad).',
      'Para P(X = k): aplica la fórmula puntual.',
      'Para P(X ≤ k) acumulada: suma o usa ppois.',
      'Para P(X ≥ k): usa 1 − P(X ≤ k − 1). En particular, P(X ≥ 1) = 1 − e⁻λ.'
    ],

    complete: `
      <p><strong>Experimento de Poisson.</strong> Modela el número de veces que ocurre un suceso en un intervalo de tiempo (o región del espacio), bajo tres condiciones:</p>
      <ul>
        <li>El número de sucesos en un intervalo es independiente del que ocurre en otro intervalo.</li>
        <li>La probabilidad de un solo suceso en un intervalo muy pequeño es proporcional al tamaño del intervalo.</li>
        <li>La probabilidad de más de un suceso en un intervalo muy pequeño es prácticamente nula.</li>
      </ul>

      <p><strong>Variable aleatoria de Poisson.</strong> X → P(λ) cuenta el número de sucesos. λ es el número medio de sucesos en el intervalo de referencia. Su soporte es {0, 1, 2, ...} (infinito numerable). La función de masa es:</p>
      <p style="text-align:center"><em>P(X = k) = λᵏ · e⁻λ / k!</em></p>

      <p><strong>Características.</strong> E[X] = λ, Var[X] = λ. La igualdad media = varianza es un sello del modelo.</p>

      <p><strong>Reproductividad.</strong> Si X₁ → P(λ₁) y X₂ → P(λ₂) son independientes, entonces X₁ + X₂ → P(λ₁ + λ₂). Útil para escalar: si recibes 2.5 reclamaciones por día, en una semana recibes en media 17.5.</p>

      <p><strong>Aproximación a la Binomial.</strong> Si X → B(n, p) con n > 30 y p ≤ 0.1, se aproxima por X ≈ P(λ = np). Útil cuando n es enorme y p es muy pequeña.</p>

      <p><strong>Aproximación a la Normal.</strong> Si X → P(λ) con λ ≥ 10, se aproxima por X ≈ N(μ = λ, σ = √λ).</p>
    `
  },

  exercises: [
    {
      id: 'b4-e1',
      statement: 'Una compañía de seguros recibe en media 2.5 reclamaciones diarias. Sea X la variable aleatoria que representa el número de reclamaciones que la compañía recibe en un día. Calcula la probabilidad de que en un día no se reciba ninguna reclamación.',
      sourceNote: 'Ejercicio 4 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Se cuenta el número de eventos (reclamaciones) en un intervalo de tiempo (1 día), conociendo la media. Es Poisson.',
      hints: [
        'Identifica λ: media de reclamaciones por día = 2.5. Luego X → P(2.5).',
        'Para P(X = 0) aplica la fórmula puntual: P(X = 0) = λ⁰ · e⁻λ / 0! = e⁻λ.',
        'Calcula e⁻²·⁵ con calculadora.'
      ],
      answer: 0.0821,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> identificación. X = "reclamaciones en un día". Media en 1 día = 2.5 ⇒ X → P(λ = 2.5).',
        '<strong>Paso 2:</strong> aplicamos la fórmula puntual con k = 0: P(X = 0) = (2.5⁰ · e⁻²·⁵) / 0!.',
        '<strong>Paso 3:</strong> 2.5⁰ = 1, 0! = 1, así que P(X = 0) = e⁻²·⁵.',
        '<strong>Paso 4:</strong> e⁻²·⁵ ≈ <strong>0.0821</strong>. En R: dpois(0, 2.5).'
      ]
    },

    {
      id: 'b4-e2',
      statement: 'Misma compañía de seguros (media 2.5 reclamaciones diarias). Calcula la probabilidad de que en un día se reciban más de 3 reclamaciones.',
      sourceNote: 'Ejercicio 5.3 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Sigue siendo Poisson con λ = 2.5. Pides una cola: P(X > 3).',
      hints: [
        '"Más de 3" significa X > 3, es decir P(X ≥ 4) = 1 − P(X ≤ 3).',
        'P(X ≤ 3) = P(X=0) + P(X=1) + P(X=2) + P(X=3).',
        'En R sería 1 − ppois(3, 2.5) o ppois(3, 2.5, lower.tail = FALSE).'
      ],
      answer: 0.2424,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → P(2.5). Buscamos P(X > 3) = 1 − P(X ≤ 3).',
        '<strong>Paso 2:</strong> calculamos cada término:<br>P(X=0) = e⁻²·⁵ ≈ 0.0821.<br>P(X=1) = 2.5·e⁻²·⁵ ≈ 0.2052.<br>P(X=2) = (2.5²/2)·e⁻²·⁵ ≈ 0.2565.<br>P(X=3) = (2.5³/6)·e⁻²·⁵ ≈ 0.2138.',
        '<strong>Paso 3:</strong> P(X ≤ 3) ≈ 0.0821 + 0.2052 + 0.2565 + 0.2138 ≈ 0.7576.',
        '<strong>Paso 4:</strong> P(X > 3) = 1 − 0.7576 ≈ <strong>0.2424</strong>.'
      ]
    },

    {
      id: 'b4-e3',
      statement: 'Misma compañía (media 2.5 reclamaciones diarias). Calcula la esperanza del número de reclamaciones recibidas en una semana.',
      sourceNote: 'Ejercicio 6.1 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Por la propiedad de reproductividad de la Poisson, λ se escala con el intervalo. En 7 días la media es 7·2.5.',
      hints: [
        'Si en 1 día E[X] = 2.5, en 7 días la media es 7 · 2.5 (las medias se suman).',
        'En general, si X_i → P(λ) son independientes, X₁ + X₂ + ... + X₇ → P(7λ).',
        'Calcula 7 · 2.5.'
      ],
      answer: 17.5,
      tolerance: 0.01,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> sea Y = "reclamaciones en una semana".',
        '<strong>Paso 2:</strong> por reproductividad de la Poisson, Y → P(7 · 2.5) = P(17.5).',
        '<strong>Paso 3:</strong> E[Y] = λ_Y = <strong>17.5</strong>. La varianza también es 17.5 (en Poisson E = Var).'
      ]
    },

    {
      id: 'b4-e4',
      statement: 'Misma compañía (media 2.5 reclamaciones diarias). Calcula la probabilidad de que en una semana se reciban menos de 15 reclamaciones.',
      sourceNote: 'Ejercicio 6.2 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Y → P(17.5) por la propiedad de reproductividad. Pides una probabilidad acumulada P(Y < 15) = P(Y ≤ 14).',
      hints: [
        'En 7 días Y → P(λ = 17.5).',
        '"Menos de 15" en una v.a. discreta significa Y ≤ 14.',
        'En R: ppois(14, 17.5). El cálculo a mano sumando 15 términos es tedioso, pero el resultado se aproxima usando el software.'
      ],
      answer: 0.2426,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> Y = "reclamaciones en una semana". Por reproductividad, Y → P(17.5).',
        '<strong>Paso 2:</strong> "menos de 15" en una v.a. discreta es P(Y < 15) = P(Y ≤ 14).',
        '<strong>Paso 3:</strong> P(Y ≤ 14) = Σ desde k = 0 hasta 14 de (17.5ᵏ · e⁻¹⁷·⁵) / k!.',
        '<strong>Paso 4:</strong> usando R (ppois(14, 17.5)) obtenemos P(Y < 15) ≈ <strong>0.2426</strong>.',
        '<strong>Interpretación:</strong> hay solo un 24% de probabilidad de recibir menos de 15 reclamaciones en una semana cuando la media es 17.5.'
      ]
    },

    {
      id: 'b4-e5',
      statement: 'El número de reparaciones a lo largo de la vida útil de un tipo de células fotovoltaicas sigue una distribución de Poisson con una media de 2 reparaciones. ¿Cuál es la probabilidad de que una célula sufra al menos una reparación?',
      sourceNote: 'Ejercicio 4.f del PDF de ejercicios Tema 4',
      types: TYPES,
      correctType: 1,
      typeExplanation: 'Cuentas eventos (reparaciones) en una "región" (vida útil de la célula). Es Poisson con λ = 2.',
      hints: [
        'X = "número de reparaciones". Media = 2, así que X → P(2).',
        '"Al menos una" significa X ≥ 1. Conviene calcular el complementario: P(X ≥ 1) = 1 − P(X = 0).',
        'P(X = 0) = e⁻². Calcula 1 − e⁻².'
      ],
      answer: 0.8647,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X = "número de reparaciones a lo largo de la vida útil". Media = 2 ⇒ X → P(2).',
        '<strong>Paso 2:</strong> "al menos una" ⇒ P(X ≥ 1) = 1 − P(X = 0).',
        '<strong>Paso 3:</strong> P(X = 0) = (2⁰ · e⁻²) / 0! = e⁻² ≈ 0.1353.',
        '<strong>Paso 4:</strong> P(X ≥ 1) = 1 − 0.1353 ≈ <strong>0.8647</strong>.',
        '<strong>Interpretación:</strong> casi el 87% de las células acabarán requiriendo al menos una reparación durante su vida útil.'
      ]
    }
  ]
};
