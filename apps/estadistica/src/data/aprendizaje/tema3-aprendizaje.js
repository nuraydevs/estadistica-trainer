export const tema3Aprendizaje = {
  tema: 3,
  units: [
    {
      id: 't3-u1',
      concept: 'Variable aleatoria discreta',
      explanation: '<p>Una v.a. discreta X toma un número numerable de valores. Su distribución se describe con la función masa de probabilidad p(xᵢ) = P(X = xᵢ), que cumple Σ p(xᵢ) = 1.</p>',
      example: 'X = "número de caras al lanzar 2 monedas" tiene soporte {0, 1, 2} con p(0)=0.25, p(1)=0.5, p(2)=0.25.',
      miniExercise: {
        question: 'Si P(X=0)=0.2, P(X=1)=0.3, P(X=2)=p, P(X=3)=0.1. Calcula p.',
        answer: 0.4,
        tolerance: 0.001,
        feedback: { correct: 'Σp = 1 ⇒ 0.2+0.3+p+0.1 = 1 ⇒ p = 0.4.', wrong: 'Las probabilidades deben sumar 1.' }
      }
    },
    {
      id: 't3-u2',
      concept: 'Esperanza de una v.a. discreta',
      explanation: '<p>E[X] = Σ xᵢ · P(X = xᵢ). Es el promedio ponderado de los valores con sus probabilidades. Representa el valor que "esperarías" obtener en media.</p>',
      example: 'X = nº de seguros con P(0)=0.10, P(1)=0.30, P(2)=0.30, P(3)=0.15, P(4)=0.10, P(5)=0.05. E[X] = 0+0.30+0.60+0.45+0.40+0.25 = 2.',
      miniExercise: {
        question: 'X tiene P(X=1)=0.5 y P(X=3)=0.5. Calcula E[X].',
        answer: 2,
        tolerance: 0.01,
        feedback: { correct: '1·0.5 + 3·0.5 = 2.', wrong: 'Suma cada xᵢ·P(X=xᵢ).' }
      }
    },
    {
      id: 't3-u3',
      concept: 'V.a. continua y función de densidad',
      explanation: '<p>Una v.a. continua tiene soporte un intervalo de ℝ. La función de densidad f(x) cumple f(x) ≥ 0 y ∫f = 1. La probabilidad de un intervalo es el área bajo f. Importante: P(X = a) = 0 siempre.</p>',
      example: 'Si f(x) = 1/2 en [0, 2] y 0 fuera, P(0.5 ≤ X ≤ 1) = (1−0.5)·(1/2) = 0.25.',
      miniExercise: {
        question: 'Si f(x) = k para 0 ≤ x ≤ 5, ¿cuánto vale k?',
        answer: 0.2,
        tolerance: 0.01,
        feedback: { correct: 'Área = 5·k = 1 ⇒ k = 0.2.', wrong: 'El área total bajo f debe ser 1. Aquí es un rectángulo.' }
      }
    },
    {
      id: 't3-u4',
      concept: 'Función de distribución',
      explanation: '<p>F(x) = P(X ≤ x) acumula probabilidad hasta x. En continuas F\'(x) = f(x). Útil: P(a < X ≤ b) = F(b) − F(a).</p>',
      example: 'Si F(x) es 0 para x<0, x²/4 para 0≤x<2 y 1 para x≥2: P(1 ≤ X ≤ 1.5) = F(1.5) − F(1) = 2.25/4 − 1/4 = 0.3125.',
      miniExercise: {
        question: 'F(x) tiene F(2) = 0.4 y F(5) = 0.9. ¿Cuánto vale P(2 < X ≤ 5)?',
        answer: 0.5,
        tolerance: 0.001,
        feedback: { correct: 'F(5) − F(2) = 0.9 − 0.4 = 0.5.', wrong: 'P(a < X ≤ b) = F(b) − F(a).' }
      }
    },
    {
      id: 't3-u5',
      concept: 'Varianza',
      explanation: '<p>Var(X) = E[X²] − (E[X])² = E[(X − μ)²]. Mide la dispersión esperada respecto a la media. La desviación típica σ = √Var es más interpretable porque tiene las mismas unidades que X.</p>',
      example: 'X con P(X=0)=0.5, P(X=2)=0.5. E[X] = 1, E[X²] = 2. Var(X) = 2 − 1 = 1. σ = 1.',
      miniExercise: {
        question: 'Si E[X] = 5 y E[X²] = 30, calcula Var(X).',
        answer: 5,
        tolerance: 0.01,
        feedback: { correct: 'Var(X) = E[X²] − E[X]² = 30 − 25 = 5.', wrong: 'Aplica Var(X) = E[X²] − (E[X])².' }
      }
    },
    {
      id: 't3-u6',
      concept: 'Desigualdad de Chebyshev',
      explanation: '<p>P(|X − μ| < kσ) ≥ 1 − 1/k². Sin saber la distribución, da una cota mínima de probabilidad alrededor de la media. Con k=2: ≥75%; k=3: ≥88.9%.</p>',
      example: 'Ventas con μ=120 y σ=10. P(100 < X < 140) corresponde a k=2 ⇒ ≥ 0.75.',
      miniExercise: {
        question: '¿Cota mínima por Chebyshev de P(|X − μ| < 3σ)?',
        answer: 0.889,
        tolerance: 0.005,
        feedback: { correct: '1 − 1/9 ≈ 0.889.', wrong: 'Aplica 1 − 1/k² con k=3.' }
      }
    }
  ]
};
