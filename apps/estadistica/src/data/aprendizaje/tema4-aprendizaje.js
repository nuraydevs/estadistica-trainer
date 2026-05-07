export const tema4Aprendizaje = {
  tema: 4,
  units: [
    {
      id: 't4-u1',
      concept: 'Identificar Binomial',
      explanation: '<p>X → B(n, p) si: hay n ensayos independientes, cada uno con dos resultados (éxito/fracaso) y la misma probabilidad p de éxito. X cuenta los éxitos.</p>',
      example: 'Lanzar 10 veces una moneda y contar caras: B(10, 0.5). 50 piezas y contar defectuosas: B(50, p_defecto).',
      miniExercise: {
        question: '15 lanzamientos de moneda. P(salgan exactamente 8 caras). p = 0.5.',
        answer: 0.1964,
        tolerance: 0.005,
        feedback: { correct: 'C(15,8)·0.5⁸·0.5⁷ = 6435/32768 ≈ 0.1964.', wrong: 'Usa P(X=k) = C(n,k)·pᵏ·(1-p)^(n-k).' }
      }
    },
    {
      id: 't4-u2',
      concept: 'Identificar Poisson',
      explanation: '<p>X → P(λ) cuando cuentas el número de eventos en un intervalo de tiempo (o región). λ es la media de eventos. Reproductividad: P(λ₁) + P(λ₂) = P(λ₁+λ₂), útil para escalar.</p>',
      example: 'Compañía recibe 2.5 reclamaciones/día. En una semana, λ = 7·2.5 = 17.5.',
      miniExercise: {
        question: 'X ~ P(3). Calcula P(X = 0).',
        answer: 0.0498,
        tolerance: 0.001,
        feedback: { correct: 'P(X=0) = e⁻³ ≈ 0.0498.', wrong: 'P(X=0) = e^(-λ).' }
      }
    },
    {
      id: 't4-u3',
      concept: 'Identificar Exponencial',
      explanation: '<p>X → Exp(λ) modela tiempos de vida o esperas. Si te dan media μ, entonces λ = 1/μ. P(X > x) = e^(-λx). Tiene falta de memoria.</p>',
      example: 'Vida media TV = 7 años → Exp(1/7). P(dure > 7) = e⁻¹ ≈ 0.368.',
      miniExercise: {
        question: 'Tiempo entre llamadas Exp con media 5 min. P(no llegue llamada en 10 min).',
        answer: 0.1353,
        tolerance: 0.001,
        feedback: { correct: 'λ = 1/5. P(X>10) = e^(-10/5) = e⁻² ≈ 0.1353.', wrong: 'λ = 1/media. P(X > x) = e^(-λx).' }
      }
    },
    {
      id: 't4-u4',
      concept: 'Falta de memoria',
      explanation: '<p>P(X > t₁ + t₂ | X > t₁) = P(X > t₂). Si un componente Exp lleva funcionando t₁, la probabilidad de que dure t₂ más es la misma que si fuera nuevo. Se "olvida" el pasado.</p>',
      example: 'Producto Exp(1/8). Lleva 5 meses. P(dure 10 más) = P(X > 10) = e^(-10/8) = e^(-1.25) ≈ 0.2865.',
      miniExercise: {
        question: 'Componente Exp con media 4 horas. Lleva 2 horas. P(dure 3 más).',
        answer: 0.4724,
        tolerance: 0.005,
        feedback: { correct: 'Por falta de memoria: P(X > 3) = e^(-3/4) ≈ 0.4724.', wrong: 'Aplica P(X>t₂) = e^(-λt₂) con t₂=3.' }
      }
    },
    {
      id: 't4-u5',
      concept: 'Tipificación Normal',
      explanation: '<p>Para X → N(μ, σ): Z = (X − μ)/σ → N(0, 1). Tipificar permite usar tablas o software estándar y comparar valores de poblaciones distintas.</p>',
      example: 'X → N(60, 9). P(X < 66) = P(Z < (66-60)/9) = P(Z < 0.667) ≈ 0.7475.',
      miniExercise: {
        question: 'X → N(100, 15). Z para X = 130.',
        answer: 2,
        tolerance: 0.01,
        feedback: { correct: 'Z = (130-100)/15 = 2.', wrong: 'Z = (X − μ)/σ.' }
      }
    },
    {
      id: 't4-u6',
      concept: 'Cuantiles de la Normal',
      explanation: '<p>qnorm(p, μ, σ) devuelve q tal que P(X ≤ q) = p. Para "el 25% que más tarda", el percentil que separa es el 75 (P(X ≤ q) = 0.75).</p>',
      example: 'X → N(1, 0.8). qnorm(0.75, 1, 0.8) ≈ 1.54. El 25% más lento tarda más de 1.54 s.',
      miniExercise: {
        question: 'X → N(50, 10). El percentil 25 corresponde a Z ≈ −0.674. Calcula el valor.',
        answer: 43.26,
        tolerance: 0.5,
        feedback: { correct: 'X = μ + Z·σ = 50 + (-0.674)·10 = 43.26.', wrong: 'X = μ + Z·σ.' }
      }
    }
  ]
};
