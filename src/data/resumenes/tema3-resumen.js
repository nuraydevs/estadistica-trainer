export const tema3Resumen = {
  id: 3,
  title: 'Variable aleatoria — Resumen',
  blocks: [
    {
      title: 'Lo esencial',
      type: 'text',
      content: '<p>Variable aleatoria = función X: Ω → ℝ. Discreta (soporte numerable, función masa) o continua (soporte intervalo, función densidad). Función de distribución F(x) = P(X ≤ x) acumulada. Características: esperanza, varianza, mediana, moda, cuantiles.</p>'
    },
    {
      title: 'Conceptos clave',
      type: 'list',
      items: [
        'Discreta: f.m.p. p(x) con Σ p(xᵢ) = 1',
        'Continua: f.d. f(x) ≥ 0 con ∫f = 1. P(X = a) = 0',
        'Probabilidad de intervalo (continua): área bajo f',
        'F(x) = P(X ≤ x). P(a < X ≤ b) = F(b) − F(a)',
        'E[X] = Σ xᵢ·pᵢ (discreta) o ∫ x·f(x) dx (continua)',
        'Var(X) = E[X²] − E[X]². σ = √Var',
        'Chebyshev: P(|X − μ| < kσ) ≥ 1 − 1/k², sin asumir distribución'
      ]
    },
    {
      title: 'Discreta vs Continua',
      type: 'svg',
      svg: `<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Comparación discreta vs continua">
        <style>
          .axis { stroke: #5c5f63; stroke-width: 1; fill: none; }
          .bar { fill: #4a7cf7; }
          .curve { stroke: #4a7cf7; stroke-width: 2; fill: none; }
          .area { fill: #1a2540; opacity: 0.6; }
          .label { fill: #e8e9ea; font: 600 13px -apple-system, sans-serif; text-anchor: middle; }
          .axis-label { fill: #9b9ea3; font: 400 11px -apple-system, sans-serif; }
        </style>
        <text class="label" x="160" y="30">DISCRETA — f.m.p. P(X = xᵢ)</text>
        <line class="axis" x1="40" y1="200" x2="320" y2="200"/>
        <line class="axis" x1="40" y1="200" x2="40" y2="60"/>
        <rect class="bar" x="80" y="170" width="20" height="30"/>
        <rect class="bar" x="120" y="120" width="20" height="80"/>
        <rect class="bar" x="160" y="100" width="20" height="100"/>
        <rect class="bar" x="200" y="140" width="20" height="60"/>
        <rect class="bar" x="240" y="180" width="20" height="20"/>
        <text class="axis-label" x="40" y="220">0</text>
        <text class="axis-label" x="200" y="220">x</text>
        <text class="axis-label" x="50" y="65">P(X=x)</text>

        <text class="label" x="540" y="30">CONTINUA — f.d. f(x)</text>
        <line class="axis" x1="400" y1="200" x2="680" y2="200"/>
        <line class="axis" x1="400" y1="200" x2="400" y2="60"/>
        <path class="area" d="M 460 200 L 460 130 Q 540 70 620 130 L 620 200 Z"/>
        <path class="curve" d="M 410 200 Q 460 200 460 130 Q 540 70 620 130 Q 620 200 670 200"/>
        <text class="axis-label" x="400" y="220">0</text>
        <text class="axis-label" x="540" y="220">x</text>
        <text class="axis-label" x="410" y="65">f(x)</text>
        <text class="axis-label" x="540" y="170" text-anchor="middle">P(a≤X≤b) = ∫f</text>

        <text class="label" x="350" y="280">P(X = a) > 0  ↔  P(X = a) = 0</text>
        <text class="axis-label" x="350" y="300" text-anchor="middle">en discreta los puntos tienen probabilidad; en continua no</text>
      </svg>`
    },
    {
      title: 'Errores típicos',
      type: 'warnings',
      items: [
        'En continua, calcular P(X = a) ≠ 0',
        'En discreta, olvidar que P(X < a) ≠ P(X ≤ a)',
        'Confundir f(x) con probabilidad: la densidad puede ser > 1',
        'Aplicar Chebyshev creyendo que da la probabilidad exacta (es solo cota inferior)'
      ]
    }
  ]
};
