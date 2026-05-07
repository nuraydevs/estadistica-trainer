export const tema1Resumen = {
  id: 1,
  title: 'Estadística descriptiva — Resumen',
  blocks: [
    {
      title: 'Lo esencial',
      type: 'text',
      content: '<p>Describir un conjunto de datos: centralización (media, mediana, moda), dispersión (varianza, desviación típica, CV), posición (cuartiles, percentiles) y forma (asimetría, curtosis). Para dos variables, tablas bidimensionales y dependencia.</p>'
    },
    {
      title: 'Conceptos clave',
      type: 'list',
      items: [
        'Variable cualitativa (nominal/ordinal) vs cuantitativa (discreta/continua)',
        'Frecuencias: nᵢ (absoluta), fᵢ = nᵢ/N (relativa), Nᵢ y Fᵢ acumuladas',
        'Histograma: la altura es la densidad si los intervalos son distintos',
        'Boxplot: caja entre Q₁ y Q₃, mediana en el centro, atípicos fuera de Q ± 1.5·RI',
        'CV = S/x̄: adimensional, sirve para comparar dispersiones entre escalas distintas',
        'g₁ > 0: sesgo a la derecha. g₂ > 0: leptocúrtica (apuntada)'
      ]
    },
    {
      title: 'Mapa mental',
      type: 'svg',
      svg: `<svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa mental Tema 1">
        <style>
          .node { fill: #1c1e21; stroke: #2e3033; stroke-width: 1; }
          .node-accent { fill: #1a2540; stroke: #4a7cf7; stroke-width: 1; }
          .label { fill: #e8e9ea; font: 500 13px -apple-system, sans-serif; text-anchor: middle; }
          .sublabel { fill: #9b9ea3; font: 400 11px -apple-system, sans-serif; text-anchor: middle; }
          .line { stroke: #2e3033; stroke-width: 1; fill: none; }
        </style>
        <rect class="node-accent" x="280" y="20" width="140" height="42" rx="6"/>
        <text class="label" x="350" y="46">Datos descriptivos</text>

        <line class="line" x1="350" y1="62" x2="100" y2="120"/>
        <line class="line" x1="350" y1="62" x2="270" y2="120"/>
        <line class="line" x1="350" y1="62" x2="430" y2="120"/>
        <line class="line" x1="350" y1="62" x2="600" y2="120"/>

        <rect class="node" x="40" y="120" width="120" height="38" rx="6"/>
        <text class="label" x="100" y="143">Centralización</text>

        <rect class="node" x="210" y="120" width="120" height="38" rx="6"/>
        <text class="label" x="270" y="143">Dispersión</text>

        <rect class="node" x="370" y="120" width="120" height="38" rx="6"/>
        <text class="label" x="430" y="143">Posición</text>

        <rect class="node" x="540" y="120" width="120" height="38" rx="6"/>
        <text class="label" x="600" y="143">Forma</text>

        <text class="sublabel" x="100" y="195">Media, mediana, moda</text>
        <text class="sublabel" x="270" y="195">Varianza, σ, CV, RI</text>
        <text class="sublabel" x="430" y="195">Cuartiles, percentiles</text>
        <text class="sublabel" x="600" y="195">Asimetría, curtosis</text>

        <rect class="node-accent" x="280" y="240" width="140" height="42" rx="6"/>
        <text class="label" x="350" y="266">Bidimensional</text>

        <line class="line" x1="350" y1="282" x2="220" y2="320"/>
        <line class="line" x1="350" y1="282" x2="480" y2="320"/>

        <text class="sublabel" x="220" y="335">Tablas conjuntas y marginales</text>
        <text class="sublabel" x="480" y="335">Independencia: fᵢⱼ = fᵢ·f.ⱼ</text>
      </svg>`
    },
    {
      title: 'Errores típicos',
      type: 'warnings',
      items: [
        'Calcular la media cuando hay outliers fuertes (mejor mediana)',
        'Confundir varianza muestral S² (denominador N) con cuasivarianza (denominador N−1)',
        'Hacer histograma con altura = frecuencia cuando los intervalos no son del mismo ancho — debe ser densidad',
        'Comparar dispersiones de variables con escalas distintas usando S en lugar de CV'
      ]
    }
  ]
};
