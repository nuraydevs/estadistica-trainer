export const tema5Resumen = {
  id: 5,
  title: 'Inferencia estadística — Resumen',
  blocks: [
    {
      title: 'Lo esencial',
      type: 'text',
      content: '<p>De la muestra a la población. Tres herramientas: <strong>estimación puntual</strong> (un valor para el parámetro), <strong>intervalos de confianza</strong> (rango con probabilidad), y <strong>contrastes de hipótesis</strong> (decidir entre H₀ y H₁).</p>'
    },
    {
      title: 'Conceptos clave',
      type: 'list',
      items: [
        'Población vs muestra. Parámetro vs estadístico',
        'Distribuciones para inferencia: χ² (varianzas), t-Student (media con σ desconocida)',
        'IC para μ con σ conocida: X̄ ± z_{α/2}·σ/√n',
        'IC para μ con σ desconocida: X̄ ± t_{n−1, α/2}·S/√n',
        'IC para p: p̂ ± z_{α/2}·√(p̂(1−p̂)/n)',
        'Contraste: H₀, H₁, estadístico, región crítica, p-valor',
        'Si p-valor < α, se rechaza H₀'
      ]
    },
    {
      title: 'Flujo de inferencia',
      type: 'svg',
      svg: `<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Flujo de inferencia">
        <style>
          .node { fill: #1c1e21; stroke: #2e3033; stroke-width: 1; }
          .node-accent { fill: #1a2540; stroke: #4a7cf7; stroke-width: 1; }
          .label { fill: #e8e9ea; font: 500 12px -apple-system, sans-serif; text-anchor: middle; }
          .sublabel { fill: #9b9ea3; font: 400 11px -apple-system, sans-serif; text-anchor: middle; }
          .line { stroke: #2e3033; stroke-width: 1; fill: none; }
          .arrow { fill: #5c5f63; }
        </style>
        <rect class="node" x="40" y="20" width="140" height="50" rx="6"/>
        <text class="label" x="110" y="42">Población</text>
        <text class="sublabel" x="110" y="58">parámetros desconocidos</text>

        <line class="line" x1="180" y1="45" x2="270" y2="45"/>
        <polygon class="arrow" points="265,40 275,45 265,50"/>
        <text class="sublabel" x="225" y="38">muestreo</text>

        <rect class="node" x="280" y="20" width="140" height="50" rx="6"/>
        <text class="label" x="350" y="42">Muestra (X₁,...,Xₙ)</text>
        <text class="sublabel" x="350" y="58">datos observados</text>

        <line class="line" x1="420" y1="45" x2="510" y2="45"/>
        <polygon class="arrow" points="505,40 515,45 505,50"/>
        <text class="sublabel" x="465" y="38">estadísticos</text>

        <rect class="node-accent" x="520" y="20" width="140" height="50" rx="6"/>
        <text class="label" x="590" y="42">Inferencia</text>
        <text class="sublabel" x="590" y="58">sobre el parámetro</text>

        <line class="line" x1="590" y1="80" x2="350" y2="130"/>
        <line class="line" x1="590" y1="80" x2="590" y2="130"/>
        <line class="line" x1="590" y1="80" x2="200" y2="130"/>

        <rect class="node" x="120" y="130" width="160" height="50" rx="6"/>
        <text class="label" x="200" y="152">Estimación puntual</text>
        <text class="sublabel" x="200" y="168">θ̂ = un valor</text>

        <rect class="node" x="270" y="130" width="160" height="50" rx="6"/>
        <text class="label" x="350" y="152">Intervalo de confianza</text>
        <text class="sublabel" x="350" y="168">(T₁, T₂) al 1−α</text>

        <rect class="node" x="510" y="130" width="160" height="50" rx="6"/>
        <text class="label" x="590" y="152">Contraste hipótesis</text>
        <text class="sublabel" x="590" y="168">¿Rechazo H₀?</text>

        <text class="label" x="350" y="240">Errores</text>
        <text class="sublabel" x="200" y="265">Tipo I: rechazar H₀ siendo cierta. P = α</text>
        <text class="sublabel" x="500" y="265">Tipo II: no rechazar H₀ siendo falsa. P = β</text>
        <text class="sublabel" x="350" y="290">Potencia = 1 − β. p-valor &lt; α ⇒ se rechaza H₀</text>
      </svg>`
    },
    {
      title: 'Errores típicos',
      type: 'warnings',
      items: [
        'Usar Z (Normal) cuando σ es desconocida y n es pequeña: hay que usar t-Student',
        'Rechazar H₀ porque "p > α": no rechazar NO significa que H₀ sea cierta',
        'Confundir nivel de confianza (1 − α) con nivel de significación (α)',
        'Usar σ muestral S directamente como σ poblacional cuando n es pequeña',
        'En contrastes bilaterales, comparar el estadístico con z_α en lugar de z_{α/2}'
      ]
    }
  ]
};
