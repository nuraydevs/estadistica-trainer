export const tema2 = {
  id: 2,
  title: 'Probabilidad',
  source: 'EINDUS-T2.pdf',
  sections: [
    {
      id: 't2-s1',
      title: 'Espacios muestrales y sucesos',
      content: `
        <p>Un <strong>experimento aleatorio</strong> verifica que: se conocen los resultados posibles, se puede repetir bajo las mismas condiciones, no se conoce el resultado de antemano, y aparece una regularidad estadística al repetirlo muchas veces.</p>
        <ul>
          <li><strong>Espacio muestral (Ω):</strong> conjunto de todos los resultados posibles.</li>
          <li><strong>Suceso:</strong> subconjunto de Ω. Se denota con mayúsculas.</li>
          <li><strong>Suceso elemental:</strong> un solo punto muestral.</li>
          <li><strong>Suceso imposible (∅)</strong> y <strong>suceso seguro (Ω).</strong></li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't2-s2',
      title: 'Operaciones con sucesos',
      content: `
        <ul>
          <li><strong>Unión</strong> (A ∪ B): ocurre A o B (o ambos).</li>
          <li><strong>Intersección</strong> (A ∩ B): ocurren A y B simultáneamente.</li>
          <li><strong>Complementario</strong> (Ā): puntos de Ω que no están en A.</li>
          <li><strong>Diferencia</strong> (A − B = A ∩ B̄): puntos de A que no están en B.</li>
          <li><strong>Disjuntos / incompatibles</strong>: A ∩ B = ∅.</li>
        </ul>
        <p><strong>Leyes de De Morgan:</strong> el complementario de la unión es la intersección de los complementarios y viceversa.</p>
      `,
      examples: []
    },
    {
      id: 't2-s3',
      title: 'Definición axiomática de probabilidad (Kolmogorov)',
      content: `
        <p>La probabilidad P es una función P: 𝒜 → ℝ que cumple:</p>
        <ul>
          <li>No negatividad: P(A) ≥ 0.</li>
          <li>Suceso seguro: P(Ω) = 1.</li>
          <li>Aditividad: si A ∩ B = ∅ entonces P(A ∪ B) = P(A) + P(B).</li>
        </ul>
        <p><strong>Propiedades:</strong></p>
        <ul>
          <li>0 ≤ P(A) ≤ 1.</li>
          <li>P(∅) = 0, P(Ā) = 1 − P(A).</li>
          <li>Si A y B son compatibles: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).</li>
          <li>P(A − B) = P(A) − P(A ∩ B).</li>
        </ul>
        <p><strong>Regla de Laplace</strong> (espacios finitos y equiprobables): P(A) = casos favorables / casos posibles.</p>
      `,
      examples: []
    },
    {
      id: 't2-s4',
      title: 'Combinatoria',
      content: `
        <p>Para contar casos posibles. Se distinguen variaciones, permutaciones y combinaciones, con/sin repetición.</p>
        <ul>
          <li><strong>Permutaciones sin repetición</strong> (orden importa, todos los elementos): Pₘ = m!.</li>
          <li><strong>Variaciones sin repetición</strong> (orden importa, no todos): V(m,n) = m! / (m−n)!.</li>
          <li><strong>Combinaciones sin repetición</strong> (orden no importa, no todos): C(m,n) = m! / (n!·(m−n)!).</li>
          <li><strong>Variaciones con repetición</strong>: VR(m,n) = mⁿ.</li>
          <li><strong>Permutaciones con repetición</strong>: PR(m; α,β,...) = m! / (α!·β!·...).</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't2-s5',
      title: 'Probabilidad condicionada',
      content: `
        <p>Probabilidad de A sabiendo que ha ocurrido B, con P(B) > 0:</p>
        <p style="text-align:center"><em>P(A | B) = P(A ∩ B) / P(B)</em></p>
        <p>La probabilidad condicionada cumple los axiomas de Kolmogorov. Atención: P(Ā | B) = 1 − P(A | B), pero P(A | B̄) NO es 1 − P(A | B).</p>
        <p><strong>Regla del producto:</strong> P(A ∩ B) = P(A) · P(B|A) = P(B) · P(A|B).</p>
        <p><strong>Regla de la cadena:</strong> P(A ∩ B ∩ C) = P(A) · P(B|A) · P(C|A ∩ B).</p>
      `,
      examples: []
    },
    {
      id: 't2-s6',
      title: 'Independencia de sucesos',
      content: `
        <p>A y B son <strong>estadísticamente independientes</strong> si y solo si:</p>
        <p style="text-align:center"><em>P(A ∩ B) = P(A) · P(B)</em></p>
        <p>Equivale a P(A | B) = P(A): saber que ha ocurrido B no aporta información sobre A.</p>
        <p><strong>Importante:</strong> independientes ≠ incompatibles. Dos sucesos incompatibles con probabilidad positiva NUNCA son independientes.</p>
        <p>La independencia se generaliza a 3 sucesos exigiendo independencia 2 a 2 más P(A ∩ B ∩ C) = P(A) · P(B) · P(C).</p>
      `,
      examples: []
    },
    {
      id: 't2-s7',
      title: 'Probabilidad total y Teorema de Bayes',
      content: `
        <p>Sea {A₁, ..., Aₙ} una partición de Ω (excluyentes, exhaustivos, P(Aᵢ) > 0).</p>

        <p><strong>Teorema de la Probabilidad Total:</strong></p>
        <p style="text-align:center"><em>P(B) = Σ P(Aᵢ) · P(B | Aᵢ)</em></p>

        <p><strong>Teorema de Bayes:</strong></p>
        <p style="text-align:center"><em>P(Aᵢ | B) = [P(Aᵢ) · P(B | Aᵢ)] / P(B)</em></p>
        <p>donde P(B) se calcula con probabilidad total. Bayes permite "invertir" la condicionada y actualizar creencias a la luz de evidencias.</p>

        <p><strong>A priori vs. a posteriori:</strong> P(Aᵢ) es la probabilidad a priori (antes de observar B). P(Aᵢ | B) es la a posteriori (tras observar B).</p>
      `,
      examples: []
    }
  ]
};
