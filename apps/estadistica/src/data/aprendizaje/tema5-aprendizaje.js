export const tema5Aprendizaje = {
  tema: 5,
  units: [
    {
      id: 't5-u1',
      concept: 'Población vs muestra',
      explanation: '<p>La <strong>población</strong> es el conjunto completo. La <strong>muestra</strong> es un subconjunto. Los <em>parámetros</em> describen la población (μ, σ², p) y los <em>estadísticos</em> describen la muestra (X̄, S², p̂). El objetivo de la inferencia es estimar parámetros a partir de estadísticos.</p>',
      example: 'Para conocer la duración media de baterías de litio (parámetro μ desconocido), tomamos una muestra de 36 baterías y calculamos X̄ = 78 min.',
      miniExercise: {
        question: 'Tienes una muestra de 50 piezas con media de longitud 25.4 mm. ¿Esto es μ o X̄?',
        answer: null,
        textAnswer: 'X̄ (estadístico muestral). μ es el parámetro poblacional, normalmente desconocido.',
        feedback: { correct: '', wrong: '' }
      }
    },
    {
      id: 't5-u2',
      concept: 'Estimadores',
      explanation: '<p>Un estimador es un estadístico que aproxima un parámetro. Buenos estimadores son: insesgados (E[θ̂] = θ), eficientes (mínima varianza), consistentes (θ̂ → θ con n) y suficientes. La cuasivarianza S² = Σ(Xᵢ−X̄)²/(n−1) es estimador insesgado de σ².</p>',
      example: 'Para estimar μ usamos X̄. Para estimar σ² usamos S² (con denominador n−1, no n).',
      miniExercise: {
        question: 'Muestra: [3, 5, 7, 9, 11]. Calcula la media muestral.',
        answer: 7,
        tolerance: 0.01,
        feedback: { correct: '(3+5+7+9+11)/5 = 7.', wrong: 'Suma y divide entre n.' }
      }
    },
    {
      id: 't5-u3',
      concept: 'IC para la media con σ conocida',
      explanation: '<p>X̄ ± z_{α/2} · σ/√n. Para el 95%, z_{0.025} = 1.96. Para 99%, z_{0.005} = 2.576.</p>',
      example: 'X̄=78, σ=6, n=36. IC 95%: 78 ± 1.96·1 = (76.04, 79.96).',
      miniExercise: {
        question: 'X̄=100, σ=15, n=25. Margen de error al 95% (usa z=1.96).',
        answer: 5.88,
        tolerance: 0.05,
        feedback: { correct: 'z·σ/√n = 1.96·15/5 = 5.88.', wrong: 'Multiplica z por σ/√n.' }
      }
    },
    {
      id: 't5-u4',
      concept: 'IC para la media con σ desconocida',
      explanation: '<p>Cuando σ es desconocida y n es pequeña, usamos t-Student con n−1 g.l.: X̄ ± t_{n−1, α/2} · S/√n. A medida que n crece, t se parece a Z.</p>',
      example: 'n=16, X̄=25.4, S=0.6. IC 99%: t_{15, 0.005} ≈ 2.947. Error = 2.947·0.6/4 ≈ 0.442. IC = (24.96, 25.84).',
      miniExercise: {
        question: 'n=16, X̄=50, S=4. Calcula el error al 95% (t_{15, 0.025} = 2.131).',
        answer: 2.131,
        tolerance: 0.01,
        feedback: { correct: '2.131·4/4 = 2.131.', wrong: 't · S/√n.' }
      }
    },
    {
      id: 't5-u5',
      concept: 'Contraste de hipótesis sobre μ',
      explanation: '<p>H₀: μ = μ₀ vs H₁: μ ≠ μ₀ (bilateral) o μ &gt; μ₀ / μ &lt; μ₀ (unilateral). Estadístico Z = (X̄−μ₀)/(σ/√n). Si |Z| > z_{α/2} (bilateral) ⇒ rechazar H₀.</p>',
      example: 'H₀: μ=1000, X̄=985, σ=35, n=49. Z = -3. Como |−3| > 1.96 al 95%, se rechaza H₀.',
      miniExercise: {
        question: 'X̄=52, μ₀=50, σ=10, n=100. Calcula Z.',
        answer: 2,
        tolerance: 0.01,
        feedback: { correct: 'Z = (52-50)/(10/10) = 2.', wrong: 'Z = (X̄−μ₀)/(σ/√n).' }
      }
    },
    {
      id: 't5-u6',
      concept: 'p-valor',
      explanation: '<p>El p-valor es la probabilidad, asumiendo H₀ cierta, de observar algo tan o más extremo que lo que hemos observado. Decisión: si p &lt; α, se rechaza H₀.</p>',
      example: 'Z = -3 en bilateral: p ≈ 2·P(Z<-3) ≈ 0.0027. Como 0.0027 < 0.05, se rechaza H₀.',
      miniExercise: {
        question: 'p-valor = 0.08, α = 0.05. ¿Se rechaza H₀? (1 = sí, 0 = no)',
        answer: 0,
        tolerance: 0.5,
        feedback: { correct: 'No, porque p > α.', wrong: 'Solo se rechaza H₀ cuando p < α.' }
      }
    }
  ]
};
