export const tema2Resumen = {
  id: 2,
  title: 'Probabilidad — Resumen',
  blocks: [
    {
      title: 'Lo esencial',
      type: 'text',
      content: '<p>Sucesos en un espacio muestral, operaciones (∪, ∩, ⁻), axiomas de Kolmogorov, regla de Laplace. Probabilidad condicionada P(A|B), independencia P(A∩B) = P(A)·P(B), y los teoremas de Probabilidad Total y Bayes para invertir condicionadas.</p>'
    },
    {
      title: 'Conceptos clave',
      type: 'list',
      items: [
        'P(A∪B) = P(A) + P(B) − P(A∩B). Si incompatibles, P(A∩B) = 0',
        'P(Ā) = 1 − P(A). De Morgan: (A∪B)ᶜ = Ā ∩ B̄',
        'Condicionada: P(A|B) = P(A∩B)/P(B). P(A|B) ≠ P(A|B̄)',
        'Independencia: P(A∩B) = P(A)·P(B). NO confundir con incompatibilidad',
        'Probabilidad Total: P(B) = Σ P(Aᵢ)·P(B|Aᵢ)',
        'Bayes: P(Aᵢ|B) = [P(Aᵢ)·P(B|Aᵢ)] / P(B)'
      ]
    },
    {
      title: 'Árbol de decisión',
      type: 'svg',
      svg: `<svg viewBox="0 0 700 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Árbol de decisión Tema 2">
        <style>
          .node { fill: #1c1e21; stroke: #2e3033; stroke-width: 1; }
          .node-accent { fill: #1a2540; stroke: #4a7cf7; stroke-width: 1; }
          .node-success { fill: #0f2a1e; stroke: #3d9970; stroke-width: 1; }
          .label { fill: #e8e9ea; font: 500 12px -apple-system, sans-serif; text-anchor: middle; }
          .sublabel { fill: #9b9ea3; font: 400 11px -apple-system, sans-serif; text-anchor: middle; }
          .line { stroke: #2e3033; stroke-width: 1; fill: none; }
        </style>
        <rect class="node-accent" x="260" y="10" width="180" height="40" rx="6"/>
        <text class="label" x="350" y="35">¿Qué te preguntan?</text>

        <line class="line" x1="350" y1="50" x2="120" y2="100"/>
        <line class="line" x1="350" y1="50" x2="350" y2="100"/>
        <line class="line" x1="350" y1="50" x2="580" y2="100"/>

        <rect class="node" x="30" y="100" width="180" height="40" rx="6"/>
        <text class="label" x="120" y="125">P(A∪B), P(A̅)</text>

        <rect class="node" x="260" y="100" width="180" height="40" rx="6"/>
        <text class="label" x="350" y="125">P(A | B)</text>

        <rect class="node" x="490" y="100" width="180" height="40" rx="6"/>
        <text class="label" x="580" y="125">P(causa | efecto)</text>

        <line class="line" x1="120" y1="140" x2="120" y2="180"/>
        <line class="line" x1="350" y1="140" x2="350" y2="180"/>
        <line class="line" x1="580" y1="140" x2="580" y2="180"/>

        <rect class="node-success" x="30" y="180" width="180" height="46" rx="6"/>
        <text class="label" x="120" y="201">Fórmulas básicas</text>
        <text class="sublabel" x="120" y="218">unión, complementario</text>

        <rect class="node-success" x="260" y="180" width="180" height="46" rx="6"/>
        <text class="label" x="350" y="201">Condicionada</text>
        <text class="sublabel" x="350" y="218">P(A∩B) / P(B)</text>

        <rect class="node-success" x="490" y="180" width="180" height="46" rx="6"/>
        <text class="label" x="580" y="201">Bayes</text>
        <text class="sublabel" x="580" y="218">P(Aᵢ)·P(B|Aᵢ) / P(B)</text>

        <rect class="node-accent" x="200" y="280" width="300" height="40" rx="6"/>
        <text class="label" x="350" y="305">¿Hay varias "fuentes" o causas?</text>
        <line class="line" x1="350" y1="320" x2="350" y2="350"/>
        <text class="sublabel" x="350" y="365">Sí → Probabilidad Total / Bayes</text>
      </svg>`
    },
    {
      title: 'Errores típicos',
      type: 'warnings',
      items: [
        'Confundir independencia con incompatibilidad. Dos sucesos con probabilidad positiva incompatibles NUNCA son independientes',
        'P(A|B̄) NO es 1 − P(A|B). Hay que recalcular la condicionada',
        'En Bayes, olvidar que P(B) hay que calcularla con probabilidad total',
        'Sumar probabilidades de sucesos no excluyentes sin restar la intersección'
      ]
    }
  ]
};
