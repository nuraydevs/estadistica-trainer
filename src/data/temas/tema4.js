export const tema4 = {
  id: 4,
  title: 'Modelos de probabilidad',
  source: 'EINDUS-T4.pdf',
  sections: [
    {
      id: 't4-s1',
      title: 'Distribución de Bernoulli',
      content: `
        <p>Experimento de Bernoulli: dos resultados mutuamente excluyentes, éxito (A) y fracaso (Ā), con p = P(A), q = 1 − p.</p>
        <p>Si X = 1 si éxito, 0 si fracaso, X → Be(p) con:</p>
        <ul>
          <li>P(X = x) = pˣ · (1−p)¹⁻ˣ, x ∈ {0, 1}.</li>
          <li>E[X] = p, Var(X) = p(1−p).</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't4-s2',
      title: 'Distribución Binomial',
      content: `
        <p>X = número de éxitos en n ensayos de Bernoulli independientes con p constante. X → B(n, p).</p>
        <p style="text-align:center"><em>P(X = k) = C(n, k) · pᵏ · (1−p)ⁿ⁻ᵏ</em>, k = 0, 1, ..., n</p>
        <p>donde C(n, k) = n!/(k!·(n−k)!).</p>
        <ul>
          <li>E[X] = n·p, Var(X) = n·p·(1−p).</li>
          <li><strong>Reproductividad:</strong> X₁ + X₂ → B(n₁ + n₂, p) si tienen la misma p.</li>
          <li>En R: dbinom(k, n, p) puntual; pbinom(k, n, p) acumulada.</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't4-s3',
      title: 'Distribución de Poisson',
      content: `
        <p>X = número de sucesos en un intervalo de tiempo o región del espacio, con λ = media de sucesos. X → P(λ).</p>
        <p style="text-align:center"><em>P(X = k) = (λᵏ · e⁻λ) / k!</em>, k = 0, 1, 2, ...</p>
        <ul>
          <li>E[X] = Var(X) = λ. (Igualdad media-varianza es rasgo distintivo.)</li>
          <li><strong>Reproductividad:</strong> X₁ + X₂ → P(λ₁ + λ₂). Útil para escalar el intervalo.</li>
          <li><strong>Aproximación a Binomial:</strong> si n > 30 y p ≤ 0.1, B(n, p) ≈ P(λ = np).</li>
          <li>En R: dpois(k, λ), ppois(k, λ).</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't4-s4',
      title: 'Distribución Exponencial',
      content: `
        <p>Tiempo hasta el siguiente evento de Poisson, o tiempo de vida. X → Exp(λ).</p>
        <ul>
          <li>Densidad: f(x) = λ·e⁻λˣ para x ≥ 0.</li>
          <li>Distribución: F(x) = 1 − e⁻λˣ.</li>
          <li>E[X] = 1/λ, Var(X) = 1/λ². Media = desviación típica.</li>
        </ul>
        <p><strong>Falta de memoria:</strong> P(X > t₁ + t₂ | X > t₁) = P(X > t₂). El "pasado" no influye.</p>
        <p><strong>Relación con Poisson:</strong> si los conteos son P(λ), los tiempos entre sucesos son Exp(λ).</p>
        <p>En R: pexp(q, λ), qexp(p, λ).</p>
      `,
      examples: []
    },
    {
      id: 't4-s5',
      title: 'Distribución Normal',
      content: `
        <p>X → N(μ, σ). Es la distribución continua estrella, simétrica respecto a μ.</p>
        <p>Densidad: f(x) = (1/(σ·√(2π))) · exp(−(x−μ)²/(2σ²)).</p>
        <ul>
          <li>E[X] = μ, Var(X) = σ². Media = mediana = moda.</li>
          <li>Curva de campana, simétrica, asíntota horizontal el eje X.</li>
          <li>σ controla la forma: a mayor σ, más aplanada.</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't4-s6',
      title: 'Normal estándar y tipificación',
      content: `
        <p>La <strong>Normal estándar</strong> Z → N(0, 1) tiene μ = 0, σ = 1.</p>
        <p><strong>Tipificación:</strong> Z = (X − μ) / σ → N(0, 1).</p>
        <p>Las puntuaciones Z indican cuántas σ está X por encima (Z > 0) o por debajo (Z < 0) de la media. Permiten comparar valores de distintas distribuciones.</p>
        <p>En R: pnorm(q, μ, σ), qnorm(p, μ, σ).</p>

        <p><strong>Transformación lineal:</strong> Y = a + bX ⇒ Y → N(a + b·μ, |b|·σ).</p>
        <p><strong>Reproductividad:</strong> X₁ + X₂ → N(μ₁ + μ₂, √(σ₁² + σ₂²)) si independientes.</p>
      `,
      examples: []
    },
    {
      id: 't4-s7',
      title: 'Aproximaciones y Teorema Central del Límite',
      content: `
        <p><strong>Teorema Central del Límite (TCL):</strong> sea X₁, X₂, ... independientes idénticamente distribuidas con media μ y varianza σ². Cuando n → ∞:</p>
        <p style="text-align:center">Sₙ = X₁ + ... + Xₙ → N(n·μ, σ·√n)</p>

        <p><strong>Binomial → Normal:</strong> si np > 5 y p ≤ ½, B(n, p) ≈ N(np, √(np(1−p))). Aplica corrección por continuidad: P(X ≤ k) ≈ P(Y ≤ k + 0.5).</p>

        <p><strong>Poisson → Normal:</strong> si λ ≥ 10, P(λ) ≈ N(λ, √λ).</p>
      `,
      examples: []
    }
  ]
};
