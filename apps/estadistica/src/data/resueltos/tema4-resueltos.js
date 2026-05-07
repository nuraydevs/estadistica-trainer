export const tema4Resueltos = [
  {
    id: 't4-r1',
    statement: 'Examen tipo test con 15 preguntas y 4 opciones cada una. Una persona responde al azar. X = "número de preguntas falladas". Calcula P(X = 10), P(X ≤ 8), media y desviación típica.',
    sourceNote: 'Ejercicios 2 y 3 del PDF teoría EINDUS-T4',
    type: 'Distribución Binomial',
    relatedConcepts: ['t4-s2'],
    solution: [
      { step: 1, title: 'Identificación', content: '<p>X cuenta éxitos (fallar) en 15 ensayos independientes con p = 3/4 = 0.75. X → B(15, 0.75).</p>' },
      { step: 2, title: 'P(X = 10)', content: '<p>P(X = 10) = C(15, 10) · 0.75¹⁰ · 0.25⁵ = 3003 · 0.0563 · 0.000977 ≈ <strong>0.1651</strong>.</p>' },
      { step: 3, title: 'P(X ≤ 8)', content: '<p>Sumando los términos puntuales desde k = 0 hasta 8 (o usando pbinom(8, 15, 0.75)): P(X ≤ 8) ≈ <strong>0.0566</strong>.</p>' },
      { step: 4, title: 'Media y σ', content: '<p>E[X] = n·p = 15·0.75 = <strong>11.25</strong>. σ = √(n·p·(1−p)) = √(2.8125) ≈ <strong>1.677</strong>.</p>' }
    ],
    finalAnswer: '<strong>P(X=10) ≈ 0.1651. P(X≤8) ≈ 0.0566. E[X] = 11.25. σ ≈ 1.677.</strong>',
    notes: null
  },
  {
    id: 't4-r2',
    statement: 'Una compañía de seguros recibe en media 2.5 reclamaciones diarias. (a) P(en un día se reciban 0 reclamaciones). (b) P(en un día más de 3). (c) Esperanza en una semana.',
    sourceNote: 'Ejercicios 4-6 del PDF teoría EINDUS-T4',
    type: 'Distribución de Poisson',
    relatedConcepts: ['t4-s3'],
    solution: [
      { step: 1, title: 'Identificación', content: '<p>X = "reclamaciones en un día", media = 2.5 ⇒ X → P(2.5).</p>' },
      { step: 2, title: '(a) P(X = 0)', content: '<p>P(X = 0) = e⁻²·⁵ ≈ <strong>0.0821</strong>.</p>' },
      { step: 3, title: '(b) P(X > 3)', content: '<p>P(X > 3) = 1 − P(X ≤ 3). Sumando P(X=0)+P(X=1)+P(X=2)+P(X=3) ≈ 0.7576. Por tanto P(X > 3) ≈ <strong>0.2424</strong>.</p>' },
      { step: 4, title: '(c) En una semana', content: '<p>Por reproductividad, Y → P(7·2.5) = P(17.5). E[Y] = <strong>17.5</strong>.</p>' }
    ],
    finalAnswer: '<strong>(a) 0.0821. (b) 0.2424. (c) E[Y] = 17.5.</strong>',
    notes: 'En Poisson, E[X] = Var(X) = λ.'
  },
  {
    id: 't4-r3',
    statement: 'Vida media de televisores Exp(1/7) en años. (a) P(falle después de 7 años). (b) Tiempo mínimo del 30% más duraderos.',
    sourceNote: 'Ejercicio 7 del PDF teoría EINDUS-T4',
    type: 'Distribución Exponencial',
    relatedConcepts: ['t4-s4'],
    solution: [
      { step: 1, title: '(a) P(X > 7)', content: '<p>X → Exp(1/7). P(X > x) = e⁻λˣ. P(X > 7) = e⁻¹ ≈ <strong>0.3678</strong>.</p>' },
      { step: 2, title: '(b) Percentil 70', content: '<p>P(X > q) = 0.30 ⇔ P(X ≤ q) = 0.70. De F(q) = 1 − e⁻q/⁷ = 0.70: e⁻q/⁷ = 0.30 ⇒ q = −7·ln(0.30) ≈ <strong>8.43 años</strong>.</p>' }
    ],
    finalAnswer: '<strong>(a) 0.3678. (b) 8.43 años.</strong>',
    notes: 'En Exp(λ), media = 1/λ.'
  },
  {
    id: 't4-r4',
    statement: 'Tipificación. Leyre Carrascosa (mujer) mide 201 cm con N(163, 6.5). Pau Gasol (hombre) mide 213 cm con N(180, 7.1). ¿Quién es más alto en términos relativos?',
    sourceNote: 'Ejercicio 10 del PDF teoría EINDUS-T4',
    type: 'Distribución Normal — tipificación',
    relatedConcepts: ['t4-s5', 't4-s6'],
    solution: [
      { step: 1, title: 'Z de Leyre', content: '<p>Z_Leyre = (201 − 163)/6.5 = 38/6.5 ≈ <strong>5.85</strong>.</p>' },
      { step: 2, title: 'Z de Pau', content: '<p>Z_Pau = (213 − 180)/7.1 = 33/7.1 ≈ <strong>4.65</strong>.</p>' },
      { step: 3, title: 'Conclusión', content: '<p>Z_Leyre > Z_Pau ⇒ Leyre está más desviaciones típicas por encima de la media de su población. <strong>Leyre es más alta en términos relativos.</strong></p>' }
    ],
    finalAnswer: '<strong>Leyre Carrascosa es más alta en términos relativos (Z ≈ 5.85 vs 4.65).</strong>',
    notes: 'La tipificación permite comparar valores de poblaciones distintas. El más relativo no es necesariamente el más alto en valor absoluto.'
  }
];
