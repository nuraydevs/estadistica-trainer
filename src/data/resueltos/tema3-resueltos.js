export const tema3Resueltos = [
  {
    id: 't3-r1',
    statement: 'Empleados con sueldo fijo 400€ + 100€ por seguro vendido. P(X) para X = seguros vendidos: 0.10, 0.30, 0.30, p, 0.10, 0.05. (a) P(X ≥ 3). (b) Número medio de seguros. (c) Remuneración media y σ.',
    sourceNote: 'Ejercicio 1 PDF EINDUS-T3-ejercicios',
    type: 'V.A. discreta',
    relatedConcepts: ['t3-s2', 't3-s4'],
    solution: [
      { step: 1, title: 'Calcular p', content: '<p>Σ P(X) = 1 ⇒ 0.10 + 0.30 + 0.30 + p + 0.10 + 0.05 = 1 ⇒ p = 0.15.</p>' },
      { step: 2, title: '(a) P(X ≥ 3)', content: '<p>P(X ≥ 3) = P(X = 3) + P(X = 4) + P(X = 5) = 0.15 + 0.10 + 0.05 = <strong>0.30</strong>.</p>' },
      { step: 3, title: '(b) Esperanza E[X]', content: '<p>E[X] = 0·0.10 + 1·0.30 + 2·0.30 + 3·0.15 + 4·0.10 + 5·0.05 = 0 + 0.30 + 0.60 + 0.45 + 0.40 + 0.25 = <strong>2</strong> seguros.</p>' },
      { step: 4, title: '(c) Remuneración media', content: '<p>Y = 400 + 100·X. E[Y] = 400 + 100·E[X] = 400 + 100·2 = <strong>600 €</strong>.</p>' },
      { step: 5, title: '(c) Desviación típica', content: '<p>E[X²] = 0 + 0.30 + 1.20 + 1.35 + 1.60 + 1.25 = 5.70. Var(X) = 5.70 − 4 = 1.70. σ(Y) = 100·σ(X) = 100·√1.70 ≈ <strong>130 €</strong>.</p>' }
    ],
    finalAnswer: '<strong>(a) 0.30. (b) 2 seguros. (c) Media 600€, σ ≈ 130€.</strong>',
    notes: null
  },
  {
    id: 't3-r2',
    statement: 'Radiación solar diaria (cientos de calorías) con f(x) = (3/32)·(x−2)·(6−x), 2 ≤ x ≤ 6. (a) Radiación media. (b) P(< 500 cal | > media). (c) Moda.',
    sourceNote: 'Ejercicio 3 PDF EINDUS-T3-ejercicios',
    type: 'V.A. continua',
    relatedConcepts: ['t3-s4', 't3-s5', 't3-s6'],
    solution: [
      { step: 1, title: '(a) Esperanza', content: '<p>E[X] = ∫₂⁶ x · (3/32)(x−2)(6−x) dx. La densidad es simétrica respecto al punto medio del intervalo (4). Por simetría, E[X] = <strong>4</strong> (cientos de calorías = 400 cal).</p>' },
      { step: 2, title: '(b) Probabilidad condicionada', content: '<p>P(X < 5 | X > 4) = P(4 < X < 5)/P(X > 4). Por simetría, P(X > 4) = 0.5. P(4 < X < 5) se calcula integrando f en [4,5]: por simetría también P(4 < X < 5) = P(3 < X < 4). Calculando: ∫₄⁵ (3/32)(x−2)(6−x) dx = (3/32)[−x³/3 + 4x² − 12x]₄⁵ = (3/32)·(11/3) ≈ 0.34375. Por tanto P = 0.34375/0.5 = <strong>0.6875</strong>.</p>' },
      { step: 3, title: '(c) Moda', content: '<p>La moda es el x que maximiza f(x). f(x) = (3/32)(x−2)(6−x). Derivamos: f\'(x) = (3/32)(8 − 2x). Igualamos a 0: 8 − 2x = 0 ⇒ x = <strong>4</strong>.</p>' }
    ],
    finalAnswer: '<strong>(a) 4 cientos de cal = 400 cal. (b) 0.6875. (c) Moda = 4.</strong>',
    notes: 'Por la simetría de la parábola en [2, 6], media = mediana = moda = 4.'
  },
  {
    id: 't3-r3',
    statement: 'Ventas mensuales con media 120 y σ = 10 (distribución desconocida). Probabilidad de que estén entre 100 y 140.',
    sourceNote: 'Ejercicio 12 PDF EINDUS-T3-ejercicios',
    type: 'Desigualdad de Chebyshev',
    relatedConcepts: ['t3-s7'],
    solution: [
      { step: 1, title: 'Identificar el intervalo respecto a la media', content: '<p>El intervalo [100, 140] es [μ − 20, μ + 20], es decir, μ ± 2σ (porque 20 = 2·10).</p>' },
      { step: 2, title: 'Aplicar Chebyshev', content: '<p>P(|X − μ| < k·σ) ≥ 1 − 1/k². Con k = 2: P(|X − 120| < 20) ≥ 1 − 1/4 = <strong>0.75</strong>.</p>' },
      { step: 3, title: 'Interpretación', content: '<p>Sin asumir ninguna distribución concreta, podemos afirmar que <em>al menos</em> el 75% de los meses las ventas estarán entre 100 y 140 unidades.</p>' }
    ],
    finalAnswer: '<strong>P(100 < X < 140) ≥ 0.75 (cota inferior por Chebyshev).</strong>',
    notes: 'Si supiéramos que X es Normal, la probabilidad sería ≈ 0.954. Chebyshev da una cota mucho más conservadora pero válida sin saber la distribución.'
  }
];
