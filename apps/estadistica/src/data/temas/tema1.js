export const tema1 = {
  id: 1,
  title: 'Análisis descriptivo de datos',
  source: 'EINDUS-T1.pdf',
  sections: [
    {
      id: 't1-s1',
      title: 'Introducción y conceptos',
      content: `
        <p>La <strong>Estadística</strong> es la ciencia que estudia métodos para recoger, organizar, resumir y analizar datos, así como obtener conclusiones válidas sobre la población objeto de estudio.</p>
        <ul>
          <li><strong>Población:</strong> conjunto de elementos que cumplen una característica determinada.</li>
          <li><strong>Muestra:</strong> subconjunto formado por elementos de la población.</li>
          <li><strong>Parámetro:</strong> medida numérica que describe una característica de la población.</li>
          <li><strong>Estadístico:</strong> medida numérica que describe una característica de la muestra.</li>
        </ul>
        <p>La <em>Estadística Descriptiva</em> describe numéricamente un conjunto de elementos sin ir más allá de los datos. La <em>Inferencia Estadística</em> obtiene conclusiones sobre la población a partir de la muestra (Tema 5).</p>
      `,
      examples: []
    },
    {
      id: 't1-s2',
      title: 'Tipos de variables',
      content: `
        <p>Una <strong>variable</strong> es la característica de la muestra o población que varía entre individuos. Se denota por letras mayúsculas (X, Y, Z) y sus valores por minúsculas.</p>
        <ul>
          <li><strong>Cualitativas</strong> (cualidad)
            <ul>
              <li><em>Nominales</em>: categorías sin orden (tipos de publicación en RRSS).</li>
              <li><em>Ordinales</em>: categorías ordenables (nivel de inglés: ninguno, bajo, medio, alto, bilingüe).</li>
            </ul>
          </li>
          <li><strong>Cuantitativas</strong> (cantidad)
            <ul>
              <li><em>Discretas</em>: cantidad numerable de valores (nº quejas diarias).</li>
              <li><em>Continuas</em>: cantidad infinita no numerable (temperatura, salario).</li>
            </ul>
          </li>
        </ul>
        <p>Las cualitativas se pueden codificar numéricamente, pero NO se pueden hacer operaciones algebraicas con ellas. Las cuantitativas se pueden discretizar (perdiendo información).</p>
      `,
      examples: []
    },
    {
      id: 't1-s3',
      title: 'Distribuciones de frecuencias',
      content: `
        <ul>
          <li><strong>Frecuencia absoluta (nᵢ):</strong> número de veces que se repite el valor xᵢ.</li>
          <li><strong>Frecuencia relativa (fᵢ):</strong> proporción, fᵢ = nᵢ/N.</li>
          <li><strong>Frecuencia absoluta acumulada (Nᵢ):</strong> Nᵢ = n₁ + n₂ + ... + nᵢ.</li>
          <li><strong>Frecuencia relativa acumulada (Fᵢ):</strong> Fᵢ = Nᵢ/N = f₁ + ... + fᵢ.</li>
        </ul>
        <p>Las frecuencias acumuladas solo tienen sentido para variables cuantitativas o cualitativas ordinales.</p>
        <p>Si la variable cuantitativa toma muchos valores distintos, los datos suelen agruparse en intervalos.</p>
      `,
      examples: []
    },
    {
      id: 't1-s4',
      title: 'Representaciones gráficas',
      content: `
        <ul>
          <li><strong>Diagrama de barras:</strong> rectángulo por cada valor con altura igual a su frecuencia. Para variables cualitativas o discretas con pocos valores.</li>
          <li><strong>Diagrama de sectores:</strong> circular, área proporcional a la frecuencia.</li>
          <li><strong>Histograma:</strong> rectángulos con áreas iguales a la frecuencia relativa. La altura es la <em>densidad</em>. Si los intervalos son del mismo ancho, la altura coincide con la frecuencia. Si no, hay que usar densidad.</li>
          <li><strong>Diagrama de cajas y bigotes (boxplot):</strong> caja entre Q₁ y Q₃ con la mediana, bigotes hasta Q₁ − 1.5·RI y Q₃ + 1.5·RI. Los puntos fuera son atípicos (outliers).</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't1-s5',
      title: 'Medidas de tendencia central',
      content: `
        <p><strong>Media aritmética</strong> (x̄) = (Σ xᵢ · nᵢ) / N. Tiene en cuenta todos los valores. Sensible a valores extremos.</p>
        <p><strong>Mediana</strong> (Me): valor central tras ordenar los datos. Si N es par, media de los dos centrales. Robusta frente a outliers.</p>
        <p><strong>Moda</strong> (Mo): valor más frecuente. Puede no ser única. Sirve para cualquier tipo de variable.</p>

        <p><strong>Propiedades de la media:</strong></p>
        <ul>
          <li>Σ (xᵢ − x̄) · nᵢ = 0.</li>
          <li>Cambio de origen: si Y = X + k entonces ȳ = x̄ + k.</li>
          <li>Cambio de escala: si Y = k·X entonces ȳ = k·x̄.</li>
          <li>Media de varios grupos: x̄ = (Σ x̄ᵢ · nᵢ) / Σ nᵢ.</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't1-s6',
      title: 'Medidas de posición',
      content: `
        <p>Los <strong>cuantiles</strong> dividen la distribución ordenada en partes de igual frecuencia.</p>
        <ul>
          <li><strong>Cuartiles</strong> (Q₁, Q₂, Q₃): la dividen en 4 partes. Q₁ se obtiene en posición p = N/4.</li>
          <li><strong>Deciles</strong> (D₁, ..., D₉): la dividen en 10 partes. Posición p = N·i/10.</li>
          <li><strong>Percentiles</strong> (P₁, ..., P₉₉): en 100 partes. Posición p = N·i/100.</li>
        </ul>
        <p>Si p es entero, se promedian los valores en posiciones p y p+1. Si no, se toma la posición superior.</p>
      `,
      examples: []
    },
    {
      id: 't1-s7',
      title: 'Medidas de dispersión',
      content: `
        <p><strong>Rango</strong> R = max − min. Sensible a outliers.</p>
        <p><strong>Rango intercuartílico</strong> RI = Q₃ − Q₁. Robusto.</p>
        <p><strong>Varianza</strong> S² = Σ (xᵢ − x̄)² · nᵢ / N = (Σ xᵢ² · nᵢ / N) − x̄². Mide la dispersión respecto a la media. Sus unidades están al cuadrado.</p>
        <p><strong>Desviación típica</strong> S = √(S²). Mismas unidades que la variable.</p>
        <p><strong>Coeficiente de variación de Pearson</strong> Vₓ = Sₓ / |x̄|. Adimensional. Permite comparar dispersión entre distribuciones con escalas distintas. Si Vₓ es alto, la media es poco representativa.</p>

        <p><strong>Propiedades de la varianza:</strong></p>
        <ul>
          <li>S² ≥ 0 siempre.</li>
          <li>No queda afectada por cambios de origen: si Y = X + k entonces Sᵧ² = Sₓ².</li>
          <li>Sí queda afectada por cambios de escala: si Y = k·X entonces Sᵧ² = k²·Sₓ².</li>
        </ul>
      `,
      examples: []
    },
    {
      id: 't1-s8',
      title: 'Medidas de forma: simetría y curtosis',
      content: `
        <p><strong>Coeficiente de asimetría de Fisher</strong> g₁ = m₃ / S³, donde m₃ = (1/N) Σ (xᵢ − x̄)³.</p>
        <ul>
          <li>g₁ = 0: distribución simétrica.</li>
          <li>g₁ > 0: asimetría positiva (sesgada a la derecha): x̄ > Me > Mo.</li>
          <li>g₁ < 0: asimetría negativa (sesgada a la izquierda): x̄ < Me < Mo.</li>
        </ul>

        <p><strong>Coeficiente de curtosis</strong> g₂ = m₄ / S⁴ − 3, donde m₄ = (1/N) Σ (xᵢ − x̄)⁴.</p>
        <ul>
          <li>g₂ = 0: <em>mesocúrtica</em> (apuntamiento similar a la normal).</li>
          <li>g₂ > 0: <em>leptocúrtica</em> (más apuntada que la normal).</li>
          <li>g₂ < 0: <em>platicúrtica</em> (menos apuntada que la normal).</li>
        </ul>
        <p>Solo se aplica a distribuciones unimodales y simétricas (o con ligera asimetría).</p>
      `,
      examples: []
    },
    {
      id: 't1-s9',
      title: 'Variables bidimensionales',
      content: `
        <p>Estudio conjunto de dos variables (X, Y).</p>
        <p>La <strong>tabla de frecuencias bidimensional</strong> recoge nᵢⱼ = número de veces que aparece el par (xᵢ, yⱼ). Las marginales nᵢ. y n.ⱼ son las sumas por filas y columnas.</p>

        <p><strong>Distribuciones marginales:</strong> distribuciones de cada variable por separado, ignorando la otra.</p>
        <p><strong>Distribuciones condicionadas:</strong> distribución de Y para un valor fijo de X (o viceversa).</p>
        <p><strong>Independencia estadística:</strong> X e Y son independientes si fᵢⱼ = fᵢ. · f.ⱼ para todo i, j (la frecuencia relativa conjunta es el producto de las marginales).</p>
      `,
      examples: []
    }
  ]
};
