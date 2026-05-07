export const tema1Aprendizaje = {
  tema: 1,
  units: [
    {
      id: 't1-u1',
      concept: 'Media aritmética',
      explanation: '<p>La media aritmética es la suma de todos los valores dividida por el número total de datos. Es una medida de centralización que tiene en cuenta cada uno de los valores. Su mayor inconveniente: es muy sensible a valores extremos (outliers).</p><p style="text-align:center"><em>x̄ = (Σ xᵢ · nᵢ) / N</em></p>',
      example: 'Si los datos son [3, 5, 7, 9], la media es (3+5+7+9)/4 = 24/4 = 6.',
      miniExercise: {
        question: 'Calcula la media de los valores [10, 20, 30, 40, 50].',
        answer: 30,
        tolerance: 0.01,
        feedback: { correct: '(10+20+30+40+50)/5 = 150/5 = 30.', wrong: 'Suma todos y divide entre 5.' }
      }
    },
    {
      id: 't1-u2',
      concept: 'Mediana',
      explanation: '<p>La mediana es el valor central tras ordenar los datos. Si N es impar, es el valor de la posición (N+1)/2. Si N es par, es la media de los dos valores centrales. Es robusta frente a outliers.</p>',
      example: 'En [1, 3, 5, 7, 9] la mediana es 5 (posición 3 de 5). En [1, 3, 5, 7] la mediana es (3+5)/2 = 4.',
      miniExercise: {
        question: 'Mediana de [2, 5, 8, 12, 100].',
        answer: 8,
        tolerance: 0.01,
        feedback: { correct: 'Posición central de 5 valores ordenados es la 3ª: 8.', wrong: 'Tras ordenar, busca el valor del centro.' }
      }
    },
    {
      id: 't1-u3',
      concept: 'Varianza y desviación típica',
      explanation: '<p>La varianza S² mide cuán dispersos están los datos respecto a la media. La desviación típica es S = √S². Una fórmula práctica: S² = (Σxᵢ²·nᵢ)/N − x̄².</p>',
      example: 'Para [2, 4, 6]: x̄ = 4. S² = ((4 + 16 + 36)/3) − 16 = 18.67 − 16 = 2.67. S ≈ 1.63.',
      miniExercise: {
        question: 'Varianza de [1, 2, 3].',
        answer: 0.667,
        tolerance: 0.01,
        feedback: { correct: 'x̄ = 2. S² = ((1+4+9)/3) − 4 = 4.667 − 4 = 0.667.', wrong: 'Calcula la media (2). Suma cuadrados/N. Resta x̄².' }
      }
    },
    {
      id: 't1-u4',
      concept: 'Coeficiente de variación',
      explanation: '<p>CV = S/|x̄|. Es adimensional, así que sirve para comparar dispersión entre distribuciones con escalas distintas. A mayor CV, menor representatividad de la media.</p>',
      example: 'Empresa A: x̄=6, S=1 → CV ≈ 0.167. Empresa B: x̄=6.5, S=1.3 → CV = 0.2. A es más homogénea.',
      miniExercise: {
        question: 'CV de una distribución con media 50 y σ = 5.',
        answer: 0.1,
        tolerance: 0.01,
        feedback: { correct: 'CV = 5/50 = 0.10 (10%).', wrong: 'CV = σ / media. Sustituye y divide.' }
      }
    },
    {
      id: 't1-u5',
      concept: 'Cuartiles y percentiles',
      explanation: '<p>Los cuantiles dividen la distribución ordenada en partes iguales. Q₁ deja el 25% por debajo, Q₂ (mediana) el 50%, Q₃ el 75%. La posición se calcula con N·i/4 (cuartiles) o N·i/100 (percentiles).</p>',
      example: 'En 200 datos, P75 está en posición 200·75/100 = 150. Si es entero, se promedia con la posición 151.',
      miniExercise: {
        question: 'En una muestra de N=100 datos ordenados, ¿en qué posición está el percentil 25?',
        answer: 25,
        tolerance: 0.5,
        feedback: { correct: 'p = N·25/100 = 25. Si es entero, se promedia con la 26.', wrong: 'Aplica p = N·i/100.' }
      }
    },
    {
      id: 't1-u6',
      concept: 'Asimetría',
      explanation: '<p>El coeficiente de asimetría de Fisher g₁ = m₃/S³ indica el sesgo. g₁ = 0: simétrica; g₁ > 0: cola larga a la derecha; g₁ < 0: cola larga a la izquierda. Cuando g₁ > 0: x̄ > Me > Mo.</p>',
      example: 'En distribución de salarios suele aparecer g₁ > 0 (pocos ganan mucho, muchos ganan poco). La media es mayor que la mediana.',
      miniExercise: {
        question: 'Si g₁ = −0.5, ¿qué tipo de asimetría tiene?',
        answer: null,
        textAnswer: 'Asimetría negativa: cola larga a la izquierda, x̄ < Me < Mo.',
        feedback: { correct: '', wrong: '' }
      }
    }
  ]
};
