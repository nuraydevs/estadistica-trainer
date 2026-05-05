const TYPES = ['Binomial', 'Poisson', 'Normal', 'Exponencial'];

export const exponencialBlock = {
  id: 'exponencial',
  tema: 4,
  title: 'Bloque 6 · Distribución Exponencial',
  priority: 'high',
  priorityLabel: 'Cae casi siempre',
  why: 'Se usa para tiempos de vida o de espera entre sucesos: vida útil de un dispositivo, tiempo hasta el siguiente fallo. Su rasgo distintivo es la falta de memoria: el "pasado" no influye, lo que aparece tal cual en muchos enunciados.',

  theory: {
    keyFormulas: [
      {
        label: 'Función de densidad',
        latex: 'f(x) = λ · e^(−λx)   para x ≥ 0',
        note: 'X → Exp(λ), λ > 0'
      },
      {
        label: 'Función de distribución',
        latex: 'F(x) = 1 − e^(−λx)   para x ≥ 0',
        note: 'F(x) = P(X ≤ x). P(X > x) = e^(−λx)'
      },
      {
        label: 'Esperanza y varianza',
        latex: 'E[X] = 1/λ,   Var[X] = 1/λ²',
        note: 'media = desviación típica'
      },
      {
        label: 'Falta de memoria',
        latex: 'P(X > t₁ + t₂ | X > t₁) = P(X > t₂)',
        note: 'el pasado no influye en el futuro'
      },
      {
        label: 'En R',
        latex: 'pexp(q, rate = λ)   qexp(p, rate = λ)',
        note: 'acumulada y cuantil'
      }
    ],

    identify: [
      {
        signal: '"Tiempo de vida", "duración", "tiempo hasta que falle"',
        type: '→ Exponencial'
      },
      {
        signal: '"Tiempo entre dos sucesos consecutivos" (entre llamadas, entre clientes, entre fallos)',
        type: '→ Exponencial. Si el conteo es Poisson, el tiempo entre eventos es Exp(λ)'
      },
      {
        signal: '"Lleva funcionando X horas, probabilidad de que dure Y más"',
        type: '→ Falta de memoria: P(X > x+y | X > x) = P(X > y)'
      },
      {
        signal: 'Te dan la vida media (μ) y X es continua positiva',
        type: '→ Exponencial con λ = 1/μ'
      }
    ],

    template: [
      'Identifica la magnitud temporal: vida útil, tiempo de espera, tiempo entre eventos.',
      'Calcula λ. Si te dan la media μ, entonces λ = 1/μ.',
      'Para P(X > x): aplica e^(−λx).',
      'Para P(X ≤ x): aplica F(x) = 1 − e^(−λx).',
      'Para P(a < X < b): F(b) − F(a) = e^(−λa) − e^(−λb).',
      'Para condicionadas tipo P(X > x+y | X > x), usa la propiedad de falta de memoria: se reduce a P(X > y).',
      'Para cuantiles: si P(X ≤ q) = p, entonces q = −ln(1 − p) / λ.'
    ],

    complete: `
      <p><strong>Distribución exponencial.</strong> Modela tiempos transcurridos hasta que ocurre un suceso, o tiempos de vida. Notación X → Exp(λ), donde λ > 0 es la tasa de ocurrencia (eventos por unidad de tiempo). La función de densidad es:</p>
      <p style="text-align:center"><em>f(x) = λ · e^(−λx)</em> para x ≥ 0, y 0 si x &lt; 0.</p>

      <p><strong>Función de distribución.</strong> F(x) = P(X ≤ x) = 1 − e^(−λx) para x ≥ 0.</p>

      <p><strong>Características.</strong> E[X] = 1/λ, Var[X] = 1/λ², σ[X] = 1/λ. Por tanto media = desviación típica.</p>

      <p><strong>Relación con Poisson.</strong> Si el número de sucesos en un intervalo de tiempo sigue una P(λ), entonces el tiempo entre dos sucesos consecutivos sigue una Exp(λ). λ representa los eventos por unidad de tiempo en ambos modelos.</p>

      <p><strong>Propiedad de falta de memoria.</strong> Para cualesquiera t₁, t₂ ≥ 0:</p>
      <p style="text-align:center"><em>P(X > t₁ + t₂ | X > t₁) = P(X > t₂)</em></p>
      <p>Es decir, si un dispositivo lleva funcionando t₁ unidades de tiempo, la probabilidad de que dure t₂ más es la misma que si fuese nuevo. La distribución "olvida" lo que ya ha pasado.</p>

      <p><strong>Cuantiles.</strong> Si quieres q tal que P(X ≤ q) = p, entonces 1 − e^(−λq) = p ⇒ q = −ln(1 − p) / λ. En R: qexp(p, λ).</p>
    `
  },

  exercises: [
    {
      id: 'b6-e1',
      statement: 'La vida media de una determinada marca de televisores es de 7 años. Si esta vida puede considerarse como una variable aleatoria distribuida en forma exponencial, calcula la probabilidad de que un televisor de este tipo falle después del séptimo año.',
      sourceNote: 'Ejercicio 7.3 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 3,
      typeExplanation: 'Tiempo de vida ⇒ Exponencial. Te dan la vida media, así que λ = 1/μ = 1/7.',
      hints: [
        'X = "vida del televisor en años". Vida media = 7 ⇒ X → Exp(λ = 1/7).',
        '"Falle después del 7º año" ⇒ P(X > 7).',
        'P(X > x) = e^(−λx). Sustituye λ = 1/7 y x = 7.'
      ],
      answer: 0.3678,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X = "tiempo de vida del televisor en años". Vida media = 7, así que λ = 1/7. Luego X → Exp(1/7).',
        '<strong>Paso 2:</strong> "falle después del 7º año" significa P(X > 7).',
        '<strong>Paso 3:</strong> aplicamos P(X > x) = e^(−λx) con x = 7:<br>P(X > 7) = e^(−(1/7) · 7) = e^(−1).',
        '<strong>Paso 4:</strong> e^(−1) ≈ <strong>0.3678</strong>.'
      ]
    },

    {
      id: 'b6-e2',
      statement: 'Misma marca de televisores (vida media de 7 años, distribución exponencial). ¿Cuál es el tiempo mínimo de duración tal que el 30% de estos televisores duran más que ese valor?',
      sourceNote: 'Ejercicio 7.5 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 3,
      typeExplanation: 'Te piden un cuantil: el valor q tal que P(X > q) = 0.30, equivalentemente P(X ≤ q) = 0.70 (percentil 70).',
      hints: [
        'P(X > q) = 0.30 ⇔ P(X ≤ q) = 0.70. Buscas el percentil 70.',
        'De F(q) = 1 − e^(−λq) = 0.70, despeja q = −ln(0.30) / λ.',
        'λ = 1/7. Calcula q = −7 · ln(0.30).'
      ],
      answer: 8.43,
      tolerance: 0.01,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → Exp(1/7). Buscamos q con P(X > q) = 0.30, es decir P(X ≤ q) = 0.70.',
        '<strong>Paso 2:</strong> aplicamos la función de distribución: 1 − e^(−q/7) = 0.70 ⇒ e^(−q/7) = 0.30.',
        '<strong>Paso 3:</strong> tomando logaritmos: −q/7 = ln(0.30) ⇒ q = −7 · ln(0.30) = 7 · ln(10/3).',
        '<strong>Paso 4:</strong> q ≈ 7 · 1.20397 ≈ <strong>8.43 años</strong>.',
        '<strong>Interpretación:</strong> el 30% de los televisores más duraderos sobrevive más de 8.43 años.'
      ]
    },

    {
      id: 'b6-e3',
      statement: 'El tiempo en que un producto está de moda en su mercado se distribuye como una exponencial de media 8 meses. Si sabemos que ya lleva 5 meses de moda, ¿cuál es la probabilidad de que dure 10 meses más?',
      sourceNote: 'Ejercicio 8 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 3,
      typeExplanation: 'Probabilidad condicionada en una exponencial: aplica la propiedad de falta de memoria, que reduce el cálculo a P(X > 10).',
      hints: [
        'X → Exp(1/8). Buscas P(X > 5 + 10 | X > 5).',
        'Por la falta de memoria de la exponencial: P(X > t₁ + t₂ | X > t₁) = P(X > t₂). Aquí t₁ = 5, t₂ = 10.',
        'Calcula directamente P(X > 10) = e^(−10/8) = e^(−1.25).'
      ],
      answer: 0.2865,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → Exp(λ = 1/8). Queremos P(X > 15 | X > 5).',
        '<strong>Paso 2:</strong> aplicamos la falta de memoria: P(X > 5 + 10 | X > 5) = P(X > 10).',
        '<strong>Paso 3:</strong> P(X > 10) = e^(−10/8) = e^(−1.25).',
        '<strong>Paso 4:</strong> e^(−1.25) ≈ <strong>0.2865</strong>.',
        '<strong>Comentario:</strong> es la misma probabilidad que tendría un producto que acabara de salir al mercado de durar 10 meses. La exponencial "olvida" los 5 meses ya pasados.'
      ]
    },

    {
      id: 'b6-e4',
      statement: 'El tiempo de vida (en miles de horas) de un componente eléctrico es una variable aleatoria con densidad de probabilidad f(x) = 2e^(−2x) para x > 0. ¿Cuál es la vida media del componente?',
      sourceNote: 'Ejercicio 3.a del PDF de ejercicios Tema 4',
      types: TYPES,
      correctType: 3,
      typeExplanation: 'Reconoces la densidad de una Exponencial con λ = 2 (el coeficiente del exponente). La media es 1/λ.',
      hints: [
        'f(x) = λ · e^(−λx). Por comparación con f(x) = 2e^(−2x), λ = 2.',
        'En la exponencial, E[X] = 1/λ.',
        'La unidad es miles de horas: convertir según el contexto si fuese necesario.'
      ],
      answer: 0.5,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> identificamos la densidad. f(x) = 2e^(−2x) ⇒ X → Exp(λ = 2).',
        '<strong>Paso 2:</strong> la vida media es E[X] = 1/λ = 1/2.',
        '<strong>Paso 3:</strong> E[X] = <strong>0.5 miles de horas</strong>, es decir 500 horas.'
      ]
    },

    {
      id: 'b6-e5',
      statement: 'Mismo componente del ejercicio anterior, con f(x) = 2e^(−2x) para x > 0 (tiempo de vida en miles de horas). ¿Cuál es la probabilidad de que el componente funcione más de 600 horas?',
      sourceNote: 'Ejercicio 3.b del PDF de ejercicios Tema 4',
      types: TYPES,
      correctType: 3,
      typeExplanation: 'Probabilidad de cola en una Exp(2). Cuidado con las unidades: x está en miles de horas, así que 600 horas = 0.6.',
      hints: [
        'X → Exp(λ = 2). Como x se mide en miles de horas, 600 horas equivalen a x = 0.6.',
        'P(X > 0.6) = e^(−λ · 0.6) = e^(−2 · 0.6) = e^(−1.2).',
        'Calcula e^(−1.2).'
      ],
      answer: 0.3012,
      tolerance: 0.001,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → Exp(2). Cuidado con unidades: 600 horas = 0.6 (miles de horas).',
        '<strong>Paso 2:</strong> P(X > 0.6) = e^(−λ · 0.6) = e^(−2 · 0.6) = e^(−1.2).',
        '<strong>Paso 3:</strong> e^(−1.2) ≈ <strong>0.3012</strong>.',
        '<strong>Interpretación:</strong> aproximadamente el 30% de los componentes superan las 600 horas de funcionamiento.'
      ]
    }
  ]
};
