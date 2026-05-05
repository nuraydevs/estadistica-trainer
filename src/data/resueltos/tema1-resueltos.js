export const tema1Resueltos = [
  {
    id: 't1-r1',
    statement: 'Departamento de calidad: 145 cajas con fusibles defectuosos x = 0,1,2,3,4,5 y frecuencias 68,34,22,12,8,1. Calcula media, varianza, desviación típica, coeficiente de variación y P75.',
    sourceNote: 'Ejercicio 2 PDF EINDUS-T1-ejercicios',
    type: 'Estadísticos descriptivos',
    relatedConcepts: ['t1-s5', 't1-s7'],
    solution: [
      { step: 1, title: 'Suma total', content: '<p>N = 68 + 34 + 22 + 12 + 8 + 1 = 145.</p>' },
      { step: 2, title: 'Media', content: '<p>x̄ = (0·68 + 1·34 + 2·22 + 3·12 + 4·8 + 5·1) / 145 = (0 + 34 + 44 + 36 + 32 + 5)/145 = 151/145 ≈ <strong>1.041</strong>.</p>' },
      { step: 3, title: 'Suma de cuadrados', content: '<p>Σ xᵢ² · nᵢ = 0·68 + 1·34 + 4·22 + 9·12 + 16·8 + 25·1 = 0 + 34 + 88 + 108 + 128 + 25 = 383.</p>' },
      { step: 4, title: 'Varianza', content: '<p>S² = (Σ xᵢ²·nᵢ)/N − x̄² = 383/145 − 1.041² ≈ 2.641 − 1.084 ≈ <strong>1.557</strong>.</p>' },
      { step: 5, title: 'Desviación típica y CV', content: '<p>S = √1.557 ≈ <strong>1.25</strong>. CV = S / x̄ = 1.25/1.041 ≈ <strong>1.198</strong>.</p>' },
      { step: 6, title: 'Percentil 75', content: '<p>Posición 145·0.75 = 108.75 → tomamos la posición 109. Frecuencias acumuladas: 68 (x=0), 102 (x=1), 124 (x=2)... La posición 109 cae en x=2. <strong>P75 = 2</strong>.</p>' }
    ],
    finalAnswer: '<strong>x̄ = 1.041, S² = 1.557, S = 1.25, CV = 1.198, P75 = 2.</strong>',
    notes: 'Trampa típica: usar la fórmula simple S² = (1/N) Σ (xᵢ−x̄)²·nᵢ es correcto, pero la fórmula alternativa (Σxᵢ²·nᵢ)/N − x̄² simplifica el cálculo.'
  },
  {
    id: 't1-r2',
    statement: 'Tres empresas A, B, C fabrican ejes con tamaños 30, 40, 50; longitudes medias 6.0, 6.5, 5.0; varianzas 1.00, 1.69, 0.81. (a) Longitud media total. (b) ¿Cuál es la más homogénea según el CV?',
    sourceNote: 'Ejercicio 3 PDF EINDUS-T1-ejercicios',
    type: 'Media de varios grupos y CV',
    relatedConcepts: ['t1-s5', 't1-s7'],
    solution: [
      { step: 1, title: 'Media total', content: '<p>x̄ = (Σ x̄ᵢ·nᵢ) / Σ nᵢ = (6·30 + 6.5·40 + 5·50)/120 = (180 + 260 + 250)/120 = 690/120 = <strong>5.75</strong>.</p>' },
      { step: 2, title: 'Coeficientes de variación', content: '<p>V_A = √1.00 / 6.0 = 1/6 ≈ <strong>0.1667</strong>. V_B = √1.69 / 6.5 = 1.3/6.5 = <strong>0.2</strong>. V_C = √0.81 / 5.0 = 0.9/5 = <strong>0.18</strong>.</p>' },
      { step: 3, title: 'Conclusión', content: '<p>El menor CV indica más homogeneidad. V_A ≈ 0.167 es el menor, así que <strong>la empresa A produce los ejes más homogéneos</strong>.</p>' }
    ],
    finalAnswer: '<strong>(a) x̄ = 5.75 cm. (b) Empresa A es la más homogénea (CV ≈ 0.167).</strong>',
    notes: 'El CV es adimensional, así que sirve para comparar dispersión entre conjuntos de datos con escalas y unidades distintas.'
  },
  {
    id: 't1-r3',
    statement: 'Variable X con 10 valores. Media 3, suma de cuadrados 122, suma de diferencias al cubo respecto a la media 54. Calcula CV de Pearson y coeficiente de asimetría de Fisher.',
    sourceNote: 'Ejercicio 5 PDF EINDUS-T1-ejercicios',
    type: 'CV y asimetría',
    relatedConcepts: ['t1-s7', 't1-s8'],
    solution: [
      { step: 1, title: 'Varianza y desviación típica', content: '<p>S² = (Σxᵢ²)/N − x̄² = 122/10 − 9 = 12.2 − 9 = 3.2. S = √3.2 ≈ 1.789.</p>' },
      { step: 2, title: 'CV', content: '<p>V_x = S / x̄ = 1.789 / 3 ≈ <strong>0.596</strong>.</p>' },
      { step: 3, title: 'Momento de orden 3', content: '<p>m₃ = (1/N) Σ (xᵢ−x̄)³ = 54/10 = 5.4.</p>' },
      { step: 4, title: 'Asimetría de Fisher', content: '<p>g₁ = m₃ / S³ = 5.4 / (1.789)³ = 5.4 / 5.724 ≈ <strong>0.943</strong>.</p>' },
      { step: 5, title: 'Interpretación', content: '<p>g₁ &gt; 0 indica asimetría positiva (sesgo a la derecha): la cola larga está a valores grandes.</p>' }
    ],
    finalAnswer: '<strong>V_x = 0.596 (alta dispersión relativa). g₁ = 0.943 (asimetría positiva).</strong>',
    notes: null
  }
];
