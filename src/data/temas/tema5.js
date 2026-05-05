export const tema5 = {
  id: 5,
  title: 'Inferencia estadística',
  source: 'EINDUS-T5.pdf',
  sections: [
    {
      id: 't5-s1',
      title: 'Introducción a la inferencia',
      content: `
        <p>La <strong>Inferencia Estadística</strong> obtiene conclusiones sobre una población a partir de los datos de una muestra.</p>
        <p>Cuando conocemos la forma exacta de la distribución de probabilidad, podemos calcular probabilidades. Cuando NO la conocemos completamente (por ejemplo, sabemos que X → P(λ) pero desconocemos λ), usamos inferencia para estimar los parámetros.</p>
        <p>Tipos:</p>
        <ul>
          <li><strong>Estimación puntual:</strong> un valor numérico para el parámetro.</li>
          <li><strong>Intervalos de confianza:</strong> rango de valores con cierta probabilidad de contener el parámetro.</li>
          <li><strong>Contrastes de hipótesis:</strong> decidir si una hipótesis sobre el parámetro se rechaza o no.</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't5-s2',
      title: 'Conceptos básicos: muestra, estadístico',
      content: `
        <ul>
          <li><strong>Población:</strong> conjunto sobre el que se estudian características. Tamaño N.</li>
          <li><strong>Muestra:</strong> subconjunto extraído de la población. Tamaño n.</li>
          <li><strong>Parámetro:</strong> medida numérica de la población (μ, σ², p, λ...).</li>
        </ul>

        <p>Una <strong>muestra aleatoria simple</strong> (m.a.s.) es (X₁, ..., Xₙ) con las Xᵢ independientes y con la misma distribución que la población X.</p>

        <p>Un <strong>estadístico</strong> T(X₁, ..., Xₙ) es una función de la muestra que NO depende de parámetros desconocidos. Tiene su propia distribución, llamada <strong>distribución muestral</strong>.</p>
      `,
      examples: []
    },
    {
      id: 't5-s3',
      title: 'Distribuciones para inferencia: Chi-cuadrado y t-Student',
      content: `
        <p><strong>Chi-cuadrado de Pearson</strong> (χ²ₙ): si X₁, ..., Xₙ son N(0,1) independientes, entonces X₁² + X₂² + ... + Xₙ² → χ²ₙ con n grados de libertad. Usada para inferencia sobre varianzas y tablas de contingencia. E[χ²ₙ] = n.</p>

        <p><strong>t de Student</strong> (tₙ): si Z → N(0,1) y X → χ²ₙ son independientes, T = Z / √(X/n) → tₙ. Usada para inferencia sobre medias cuando σ² es desconocida. Es simétrica, parecida a la N(0,1) pero con colas más anchas. E[tₙ] = 0.</p>
      `,
      examples: []
    },
    {
      id: 't5-s4',
      title: 'Estimación puntual: estimadores',
      content: `
        <p>Un <strong>estimador</strong> θ̂ es un estadístico que se usa para estimar un parámetro θ.</p>

        <p><strong>Propiedades deseables:</strong></p>
        <ul>
          <li><em>Insesgado</em>: E[θ̂] = θ.</li>
          <li><em>Eficiente</em>: tiene la menor varianza posible.</li>
          <li><em>Consistente</em>: θ̂ → θ cuando n → ∞.</li>
          <li><em>Suficiente</em>: usa toda la información de la muestra sobre θ.</li>
        </ul>

        <p><strong>Estimadores típicos:</strong></p>
        <ul>
          <li>Media poblacional μ → media muestral X̄ = (1/n) Σ Xᵢ.</li>
          <li>Varianza poblacional σ² → cuasivarianza muestral S² = (1/(n−1)) Σ (Xᵢ − X̄)².</li>
          <li>Proporción p → proporción muestral p̂ = X/n.</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't5-s5',
      title: 'Intervalos de confianza',
      content: `
        <p>Un <strong>intervalo de confianza</strong> (IC) al nivel 1 − α es un par de estadísticos (T₁, T₂) tal que P(T₁ ≤ θ ≤ T₂) = 1 − α.</p>
        <p>Niveles típicos: 90% (α = 0.10), 95% (α = 0.05), 99% (α = 0.01).</p>

        <p><strong>IC para la media μ con σ conocida</strong> (o n grande):</p>
        <p style="text-align:center">X̄ ± z_{α/2} · σ/√n</p>

        <p><strong>IC para la media μ con σ desconocida</strong> (n &lt; 30, población normal):</p>
        <p style="text-align:center">X̄ ± t_{n−1, α/2} · S/√n</p>

        <p><strong>IC para una proporción p</strong>:</p>
        <p style="text-align:center">p̂ ± z_{α/2} · √(p̂(1−p̂)/n)</p>

        <p><strong>IC para varianza σ²</strong> (población normal):</p>
        <p style="text-align:center">((n−1)S²/χ²_{n−1, α/2},  (n−1)S²/χ²_{n−1, 1−α/2})</p>
      `,
      examples: []
    },
    {
      id: 't5-s6',
      title: 'Contrastes de hipótesis',
      content: `
        <p>Un <strong>contraste de hipótesis</strong> decide entre dos afirmaciones sobre un parámetro:</p>
        <ul>
          <li><strong>Hipótesis nula H₀:</strong> la afirmación que se acepta de partida.</li>
          <li><strong>Hipótesis alternativa H₁:</strong> lo contrario.</li>
        </ul>

        <p>Se calcula un <strong>estadístico de contraste</strong> y se compara con la región crítica (al nivel α).</p>

        <p><strong>Tipos de error:</strong></p>
        <ul>
          <li><em>Error tipo I</em>: rechazar H₀ siendo cierta. Probabilidad α.</li>
          <li><em>Error tipo II</em>: no rechazar H₀ siendo falsa. Probabilidad β.</li>
          <li><em>Potencia del contraste</em>: 1 − β.</li>
        </ul>

        <p><strong>p-valor:</strong> probabilidad, asumiendo H₀ cierta, de obtener un valor del estadístico tan o más extremo que el observado. Si p &lt; α, se rechaza H₀.</p>

        <p><strong>Contrastes comunes:</strong></p>
        <ul>
          <li>Sobre la media (Z o T según σ conocida o no).</li>
          <li>Sobre la proporción.</li>
          <li>Sobre la varianza (χ²).</li>
          <li>Sobre la diferencia de dos medias o dos proporciones.</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't5-s7',
      title: 'Contrastes de normalidad',
      content: `
        <p>Antes de aplicar inferencia paramétrica conviene comprobar que los datos siguen una distribución normal.</p>
        <p>Métodos:</p>
        <ul>
          <li><strong>Gráficos:</strong> histograma con curva normal superpuesta, gráfico Q-Q.</li>
          <li><strong>Tests:</strong>
            <ul>
              <li>Shapiro-Wilk (recomendado para n &lt; 50).</li>
              <li>Kolmogorov-Smirnov-Lilliefors.</li>
              <li>Anderson-Darling.</li>
            </ul>
          </li>
        </ul>
        <p>En todos: H₀ = "los datos son normales". Se rechaza H₀ si p-valor &lt; α.</p>
      `,
      examples: []
    }
  ]
};
