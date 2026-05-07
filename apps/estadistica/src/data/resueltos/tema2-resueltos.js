export const tema2Resueltos = [
  {
    id: 't2-r1',
    statement: 'Electrodomésticos con defectos A o B. P(A)=0.70, P(B)=0.40, P(A∩B)=0.30. (a) P(A | B̄). (b) P(B | defectuoso). (c) ¿Son independientes o incompatibles?',
    sourceNote: 'Ejercicio 2 PDF EINDUS-T2-ejercicios',
    type: 'Condicionada / dependencia',
    relatedConcepts: ['t2-s5', 't2-s6'],
    solution: [
      { step: 1, title: '(a) P(A | B̄)', content: '<p>P(A ∩ B̄) = P(A) − P(A ∩ B) = 0.70 − 0.30 = 0.40. P(B̄) = 0.60. Por tanto P(A | B̄) = 0.40/0.60 = <strong>0.6667</strong>.</p>' },
      { step: 2, title: '(b) P(B | A∪B)', content: '<p>"Defectuoso" significa A∪B. P(A∪B) = 0.70+0.40−0.30 = 0.80. P(B ∩ (A∪B)) = P(B) = 0.40. Por tanto P(B | def) = 0.40/0.80 = <strong>0.5</strong>.</p>' },
      { step: 3, title: '(c) Dependencia e incompatibilidad', content: '<p>Independientes ⇔ P(A)·P(B) = P(A∩B). Aquí 0.70·0.40 = 0.28 ≠ 0.30. NO son independientes. Como P(A∩B) = 0.30 ≠ 0, tampoco son incompatibles.</p>' }
    ],
    finalAnswer: '<strong>(a) 0.6667. (b) 0.5. (c) Ni independientes ni incompatibles.</strong>',
    notes: null
  },
  {
    id: 't2-r2',
    statement: 'Lavadoras de marca producidas en A y B. 20% de la marca son defectuosas, 30% de las B son defectuosas, A produce el doble que B. (a) P(no def y de B). (b) P(def y de A). (c) P(B | def). (d) En 4 lavadoras, P(al menos una def).',
    sourceNote: 'Ejercicio 5 PDF EINDUS-T2-ejercicios',
    type: 'Probabilidad total y Bayes',
    relatedConcepts: ['t2-s7'],
    solution: [
      { step: 1, title: 'Probabilidades de origen', content: '<p>A produce el doble que B: P(A) = 2/3, P(B) = 1/3.</p>' },
      { step: 2, title: 'Despejar P(D|A) por probabilidad total', content: '<p>P(D) = P(A)·P(D|A) + P(B)·P(D|B) ⇒ 0.20 = (2/3)·P(D|A) + (1/3)·0.30 ⇒ (2/3)·P(D|A) = 0.10 ⇒ P(D|A) = 0.15.</p>' },
      { step: 3, title: '(a) P(D̄ ∩ B)', content: '<p>P(D̄ ∩ B) = P(B)·P(D̄|B) = (1/3)·0.70 ≈ <strong>0.233</strong>.</p>' },
      { step: 4, title: '(b) P(D ∩ A)', content: '<p>P(D ∩ A) = P(A)·P(D|A) = (2/3)·0.15 = <strong>0.10</strong>.</p>' },
      { step: 5, title: '(c) P(B | D) por Bayes', content: '<p>P(B|D) = P(B)·P(D|B) / P(D) = (1/3·0.30)/0.20 = 0.10/0.20 = <strong>0.5</strong>.</p>' },
      { step: 6, title: '(d) P(al menos una def en 4)', content: '<p>1 − P(las 4 no defectuosas) = 1 − 0.80⁴ = 1 − 0.4096 = <strong>0.5904</strong>.</p>' }
    ],
    finalAnswer: '<strong>(a) 0.233. (b) 0.10. (c) 0.5. (d) 0.5904.</strong>',
    notes: 'Para la parte (d) se asume que cada lavadora es Bernoulli independiente con p = P(defectuosa) = 0.20.'
  },
  {
    id: 't2-r3',
    statement: 'Test médico: sensibilidad 99%, especificidad 95%, prevalencia 1%. Si una persona da positivo, ¿probabilidad de que esté realmente enferma?',
    sourceNote: 'Bayes clásico, en el bloque de práctica',
    type: 'Bayes',
    relatedConcepts: ['t2-s7'],
    solution: [
      { step: 1, title: 'Sucesos', content: '<p>E = enfermo, S = sano, + = test positivo.</p>' },
      { step: 2, title: 'Datos', content: '<p>P(E) = 0.01, P(S) = 0.99. P(+|E) = 0.99 (sensibilidad). P(+|S) = 1 − especificidad = 0.05.</p>' },
      { step: 3, title: 'Probabilidad total', content: '<p>P(+) = P(E)·P(+|E) + P(S)·P(+|S) = 0.01·0.99 + 0.99·0.05 = 0.0099 + 0.0495 = 0.0594.</p>' },
      { step: 4, title: 'Bayes', content: '<p>P(E | +) = P(E)·P(+|E) / P(+) = 0.0099 / 0.0594 ≈ <strong>0.1667</strong>.</p>' },
      { step: 5, title: 'Interpretación', content: '<p>Solo el 16.7% de los positivos están realmente enfermos, pese a un test "muy preciso". Falla la intuición porque la enfermedad es muy rara y los falsos positivos en la población sana son muchos.</p>' }
    ],
    finalAnswer: '<strong>P(enfermo | positivo) ≈ 0.1667 (16.7%).</strong>',
    notes: 'Caso paradigmático para entender la importancia de la prevalencia.'
  }
];
