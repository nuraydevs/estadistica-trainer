export const tema4Resumen = {
  id: 4,
  title: 'Modelos de probabilidad — Resumen',
  blocks: [
    {
      title: 'Lo esencial',
      type: 'text',
      content: '<p>Cuatro distribuciones clave: <strong>Binomial</strong> y <strong>Poisson</strong> (discretas), <strong>Exponencial</strong> y <strong>Normal</strong> (continuas). Saber identificar cuál aplicar a partir del enunciado es la mitad del trabajo.</p>'
    },
    {
      title: 'Cómo identificar la distribución',
      type: 'list',
      items: [
        'Binomial B(n, p): n ensayos independientes con dos resultados y misma p',
        'Poisson P(λ): cuentas eventos en un intervalo, λ = media',
        'Exponencial Exp(λ): tiempo hasta el siguiente evento, falta de memoria',
        'Normal N(μ, σ): variables continuas simétricas (alturas, tiempos, errores)'
      ]
    },
    {
      title: 'Mapa de decisión',
      type: 'svg',
      svg: `<svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa de decisión Tema 4">
        <style>
          .node { fill: #1c1e21; stroke: #2e3033; stroke-width: 1; }
          .node-q { fill: #1a2540; stroke: #4a7cf7; stroke-width: 1; }
          .node-leaf { fill: #0f2a1e; stroke: #3d9970; stroke-width: 1; }
          .label { fill: #e8e9ea; font: 500 12px -apple-system, sans-serif; text-anchor: middle; }
          .sublabel { fill: #9b9ea3; font: 400 11px -apple-system, sans-serif; text-anchor: middle; }
          .line { stroke: #2e3033; stroke-width: 1; fill: none; }
          .yes { fill: #3d9970; font: 500 10px -apple-system, sans-serif; }
          .no { fill: #c94a4a; font: 500 10px -apple-system, sans-serif; }
        </style>
        <rect class="node-q" x="270" y="10" width="160" height="40" rx="6"/>
        <text class="label" x="350" y="35">¿X es discreta?</text>

        <line class="line" x1="280" y1="50" x2="180" y2="90"/>
        <line class="line" x1="420" y1="50" x2="520" y2="90"/>
        <text class="yes" x="220" y="75">Sí</text>
        <text class="no" x="470" y="75">No</text>

        <rect class="node-q" x="80" y="90" width="200" height="40" rx="6"/>
        <text class="label" x="180" y="115">¿n fijo y p constante?</text>

        <rect class="node-q" x="420" y="90" width="200" height="40" rx="6"/>
        <text class="label" x="520" y="115">¿Tiempo entre eventos?</text>

        <line class="line" x1="130" y1="130" x2="80" y2="180"/>
        <line class="line" x1="230" y1="130" x2="290" y2="180"/>
        <line class="line" x1="470" y1="130" x2="420" y2="180"/>
        <line class="line" x1="570" y1="130" x2="630" y2="180"/>
        <text class="yes" x="100" y="155">Sí</text>
        <text class="no" x="270" y="155">No</text>
        <text class="yes" x="440" y="155">Sí</text>
        <text class="no" x="610" y="155">No</text>

        <rect class="node-leaf" x="20" y="180" width="120" height="50" rx="6"/>
        <text class="label" x="80" y="201">Binomial</text>
        <text class="sublabel" x="80" y="218">B(n, p)</text>

        <rect class="node-leaf" x="220" y="180" width="140" height="50" rx="6"/>
        <text class="label" x="290" y="201">Poisson</text>
        <text class="sublabel" x="290" y="218">P(λ) = media</text>

        <rect class="node-leaf" x="360" y="180" width="120" height="50" rx="6"/>
        <text class="label" x="420" y="201">Exponencial</text>
        <text class="sublabel" x="420" y="218">Exp(λ)</text>

        <rect class="node-leaf" x="560" y="180" width="120" height="50" rx="6"/>
        <text class="label" x="620" y="201">Normal</text>
        <text class="sublabel" x="620" y="218">N(μ, σ)</text>

        <text class="sublabel" x="80" y="270">éxitos en n pruebas</text>
        <text class="sublabel" x="290" y="270">eventos en intervalo</text>
        <text class="sublabel" x="420" y="270">vida útil, espera</text>
        <text class="sublabel" x="620" y="270">medidas continuas</text>

        <text class="sublabel" x="350" y="320" font-style="italic">Atención a aproximaciones: B → N (np > 5), P → N (λ ≥ 10)</text>
      </svg>`
    },
    {
      title: 'Errores típicos',
      type: 'warnings',
      items: [
        'Confundir Binomial con Poisson cuando n es grande y p pequeña: técnicamente puedes aproximar P(λ=np) si n>30 y p≤0.1',
        'Olvidar la falta de memoria en Exponencial: P(X > t₁+t₂ | X > t₁) = P(X > t₂)',
        'No tipificar antes de buscar en la tabla normal: Z = (X − μ)/σ',
        'Confundir P(X ≥ k) con P(X > k) en discretas. En B(n, p): P(X ≥ k) = 1 − P(X ≤ k − 1)',
        'En Normal, asumir que la media coincide con el valor más probable y olvidar que la densidad NO es probabilidad'
      ]
    }
  ]
};
