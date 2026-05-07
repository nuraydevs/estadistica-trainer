const TYPES = ['Binomial', 'Poisson', 'Normal', 'Exponencial'];

export const normalBlock = {
  id: 'normal',
  tema: 4,
  title: 'Bloque 5 · Distribución Normal',
  priority: 'priority',
  priorityLabel: 'Cae siempre',
  why: 'La distribución continua estrella del examen. Aparece en problemas de medidas físicas (tiempos, longitudes, pesos), en aproximaciones a otras distribuciones, y como base de toda inferencia. Tienes que dominar tipificación Z = (X − μ)/σ y manejo de pnorm/qnorm.',

  theory: {
    keyFormulas: [
      {
        label: 'Función de densidad',
        latex: 'f(x) = (1 / (σ·√(2π))) · exp(−(x−μ)² / (2σ²))',
        note: 'X → N(μ, σ), x ∈ ℝ'
      },
      {
        label: 'Tipificación',
        latex: 'Z = (X − μ) / σ → N(0, 1)',
        note: 'Z mide cuántas σ está X por encima/debajo de la media'
      },
      {
        label: 'Esperanza, varianza, simetría',
        latex: 'E[X] = μ,  Var[X] = σ²,  Me = Mo = μ',
        note: 'media = mediana = moda. Curva simétrica'
      },
      {
        label: 'Reproductividad',
        latex: 'X₁ + X₂ → N(μ₁ + μ₂, √(σ₁² + σ₂²))',
        note: 'la suma de normales es normal'
      },
      {
        label: 'Transformación lineal',
        latex: 'Y = a + bX  ⇒  Y → N(a + b·μ, |b|·σ)',
        note: 'útil al cambiar de unidades'
      }
    ],

    identify: [
      {
        signal: 'Variable continua que toma valores con simetría alrededor de una media (alturas, tiempos, pesos, longitudes)',
        type: '→ Normal'
      },
      {
        signal: 'Te dan media y desviación típica (o varianza) y piden P(X < a), P(a < X < b), o un cuantil',
        type: '→ Normal: tipifica con Z = (X−μ)/σ'
      },
      {
        signal: 'Comparas dos valores que vienen de poblaciones distintas (alturas hombres vs mujeres)',
        type: '→ Tipifica los dos. El de mayor Z está más por encima de su media en términos relativos'
      },
      {
        signal: 'Te dan una probabilidad y un parámetro (μ o σ) y piden el otro',
        type: '→ Normal con incógnita: usa qnorm o despeja desde Z'
      }
    ],

    template: [
      'Identifica μ y σ.',
      'Reescribe lo que te piden en términos de probabilidad de X.',
      'Tipifica: Z = (X − μ) / σ. Convierte los límites de X en límites de Z.',
      'Para P(X < a): pnorm(a, μ, σ) o pnorm((a−μ)/σ, 0, 1).',
      'Para P(a < X < b): pnorm(b, μ, σ) − pnorm(a, μ, σ).',
      'Para "el k% supera el valor c" o cuantil: qnorm(p, μ, σ) con la p adecuada.',
      'En condicionadas, descompón usando P(A | B) = P(A ∩ B) / P(B).',
      'Recuerda la simetría: P(Z < −z) = 1 − P(Z < z) = P(Z > z).'
    ],

    complete: `
      <p><strong>Distribución Normal.</strong> Variable aleatoria continua caracterizada por dos parámetros: media μ y desviación típica σ. Notación X → N(μ, σ). Su función de densidad es:</p>
      <p style="text-align:center"><em>f(x) = (1 / (σ √(2π))) · exp(−(x − μ)² / (2σ²))</em></p>

      <p><strong>Propiedades de la curva.</strong></p>
      <ul>
        <li>Continua en toda la recta real.</li>
        <li>Simétrica respecto a μ. Por tanto media = mediana = moda.</li>
        <li>Tiene como asíntota horizontal el eje X (nunca lo toca).</li>
        <li>El parámetro σ controla la forma: a mayor σ, más aplanada.</li>
      </ul>

      <p><strong>Normal estándar (tipificada).</strong> Es la N(0, 1). La denotamos por Z. Cualquier X → N(μ, σ) se transforma en Z mediante:</p>
      <p style="text-align:center"><em>Z = (X − μ) / σ</em></p>
      <p>Las puntuaciones tipificadas indican cuántas desviaciones típicas está X por encima (Z &gt; 0) o por debajo (Z &lt; 0) de la media. Sirven para comparar valores de poblaciones con escala distinta.</p>

      <p><strong>Cálculo de probabilidades en R.</strong></p>
      <ul>
        <li><code>pnorm(q, mu, sd)</code> → P(X ≤ q).</li>
        <li><code>qnorm(p, mu, sd)</code> → cuantil q tal que P(X ≤ q) = p.</li>
      </ul>

      <p><strong>Aproximación Binomial → Normal.</strong> Si X → B(n, p) con np &gt; 5 y p ≤ ½, se aproxima por N(np, √(np(1−p))). Aplica corrección por continuidad: P(X ≤ k) ≈ P(Y ≤ k + 0.5).</p>

      <p><strong>Aproximación Poisson → Normal.</strong> Si X → P(λ) con λ ≥ 10, se aproxima por N(λ, √λ).</p>
    `
  },

  exercises: [
    {
      id: 'b5-e1',
      statement: 'La jugadora de baloncesto Leyre Carrascosa mide 201 cm, mientras que Pau Gasol mide 213 cm. Teniendo en cuenta que la altura de las mujeres españolas sigue una distribución N(163, 6.5) y que la altura de los hombres españoles sigue una N(180, 7.1), ¿quién de los dos es más alto en términos relativos?',
      sourceNote: 'Ejercicio 10 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 2,
      typeExplanation: 'Comparación entre dos valores de poblaciones distintas. Tipificas (Z) cada uno respecto a su propia distribución y comparas: el mayor Z indica el más alto en términos relativos.',
      hints: [
        'Calcula la puntuación tipificada de Leyre: Z_Leyre = (201 − 163) / 6.5.',
        'Calcula la puntuación tipificada de Pau: Z_Pau = (213 − 180) / 7.1.',
        'El que tenga mayor Z está más desviaciones típicas por encima de la media de su población. Ese es el más alto "en relativo".'
      ],
      answer: null,
      tolerance: null,
      textAnswer: 'Leyre Carrascosa es más alta en términos relativos. Z_Leyre = (201 − 163)/6.5 ≈ 5.85 desviaciones típicas por encima de la media femenina, mientras que Z_Pau = (213 − 180)/7.1 ≈ 4.65 desviaciones típicas por encima de la media masculina. Ambos son extremadamente altos para su población, pero Leyre está más desviada.',
      solution: [
        '<strong>Paso 1:</strong> tipificamos cada altura respecto a la distribución de su población.',
        '<strong>Paso 2:</strong> Z_Leyre = (201 − 163) / 6.5 = 38 / 6.5 ≈ <strong>5.85</strong>.',
        '<strong>Paso 3:</strong> Z_Pau = (213 − 180) / 7.1 = 33 / 7.1 ≈ <strong>4.65</strong>.',
        '<strong>Paso 4:</strong> Z_Leyre &gt; Z_Pau, así que Leyre está más desviaciones típicas por encima de la media de las mujeres que Pau de la de los hombres.',
        '<strong>Conclusión:</strong> Leyre Carrascosa es más alta en términos relativos.'
      ]
    },

    {
      id: 'b5-e2',
      statement: 'La componente C3 de un circuito tiene un tiempo de funcionamiento que se distribuye según una normal de media 12 horas y desviación típica 2.2 horas. Determina la probabilidad de que la componente C3, que lleva funcionando 8 horas, no llegue a funcionar 3 horas más.',
      sourceNote: 'Ejercicio 6.a del PDF de ejercicios Tema 4',
      types: TYPES,
      correctType: 2,
      typeExplanation: 'Tiempo continuo modelado por Normal con μ y σ conocidas. Pides una probabilidad condicionada que se reduce a un cociente de probabilidades de N(12, 2.2).',
      hints: [
        'X = "tiempo de funcionamiento de C3", X → N(12, 2.2). Te piden P(X ≤ 11 | X > 8).',
        'P(X ≤ 11 | X > 8) = P(8 < X ≤ 11) / P(X > 8).',
        'El PDF da: pnorm((11−12)/2.2) = pnorm(−0.4545) = 0.3247 y pnorm((8−12)/2.2) = pnorm(−1.8182) = 0.0345.'
      ],
      answer: 0.3006,
      tolerance: 0.005,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → N(12, 2.2). "Lleva 8 horas" ⇒ X > 8. "No llegue a 3 horas más" ⇒ X ≤ 11. Buscamos P(X ≤ 11 | X > 8).',
        '<strong>Paso 2:</strong> aplicamos la definición de condicionada: P(X ≤ 11 | X > 8) = P(8 < X ≤ 11) / P(X > 8).',
        '<strong>Paso 3:</strong> tipificamos. P(X ≤ 11) = P(Z ≤ (11−12)/2.2) = P(Z ≤ −0.4545) = 0.3247.',
        '<strong>Paso 4:</strong> P(X ≤ 8) = P(Z ≤ −1.8182) = 0.0345. Luego P(X > 8) = 1 − 0.0345 = 0.9655.',
        '<strong>Paso 5:</strong> P(8 < X ≤ 11) = 0.3247 − 0.0345 = 0.2902.',
        '<strong>Paso 6:</strong> P(X ≤ 11 | X > 8) = 0.2902 / 0.9655 ≈ <strong>0.3006</strong>.'
      ]
    },

    {
      id: 'b5-e3',
      statement: 'El tiempo de saturación (en segundos) de una reacción química en presencia de una sustancia B se distribuye según una normal con media de 1s y desviación típica de 0.8s. Determina el tiempo de reacción del 25% de las reacciones que más tardan en saturarse.',
      sourceNote: 'Ejercicio 2.b (parte B) del PDF de ejercicios Tema 4',
      types: TYPES,
      correctType: 2,
      typeExplanation: 'Te piden un cuantil de una N(1, 0.8): el valor que deja a su derecha el 25% más alto, es decir, el percentil 75.',
      hints: [
        'X → N(1, 0.8). "El 25% que más tardan" están por encima del percentil 75 (P(X ≤ q) = 0.75).',
        'Buscas q tal que P(X ≤ q) = 0.75. En R: qnorm(0.75, 1, 0.8).',
        'El PDF te da el dato directo: qnorm(0.75, 1, 0.8) = 1.54.'
      ],
      answer: 1.54,
      tolerance: 0.01,
      textAnswer: null,
      solution: [
        '<strong>Paso 1:</strong> X → N(μ = 1, σ = 0.8). Buscamos el percentil 75, es decir, q con P(X ≤ q) = 0.75.',
        '<strong>Paso 2:</strong> el 25% que más tardan están por encima de q, así que el área a la izquierda es 0.75.',
        '<strong>Paso 3:</strong> usando software: q = qnorm(0.75, 1, 0.8) = <strong>1.54 s</strong>.',
        '<strong>Interpretación:</strong> el 25% de las reacciones más lentas tardan al menos 1.54 segundos en saturarse.'
      ]
    },

    {
      id: 'b5-e4',
      statement: 'El tiempo, en minutos, que tardan unos ciclistas de un determinado club en realizar un recorrido completo sigue una distribución Normal con media 60 minutos y varianza 81. ¿Qué probabilidad hay de que un ciclista de ese club tarde entre 54 y 66 minutos en realizar el recorrido?',
      sourceNote: 'Ejercicio 9.1 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 2,
      typeExplanation: 'Probabilidad de un intervalo en una Normal. Tipificas los dos límites y restas las probabilidades acumuladas.',
      hints: [
        'X → N(μ = 60, σ = √81 = 9). Buscas P(54 < X < 66).',
        'Tipifica: Z₁ = (54 − 60)/9 = −0.667, Z₂ = (66 − 60)/9 = 0.667.',
        'P(54 < X < 66) = P(−0.667 < Z < 0.667) = pnorm(0.667) − pnorm(−0.667).'
      ],
      answer: null,
      tolerance: null,
      textAnswer: 'Pendiente — resuélvelo tú y contrástalo aquí. El PDF teórico no incluye la solución desarrollada. Pasos: tipifica X → N(60, 9), calcula Z₁ = −2/3 y Z₂ = 2/3, y aplica P(54 < X < 66) = pnorm(2/3) − pnorm(−2/3).',
      solution: [
        '<strong>Paso 1:</strong> X → N(μ = 60, σ = 9) (porque varianza = 81 ⇒ σ = 9).',
        '<strong>Paso 2:</strong> tipifica los dos límites. Z₁ = (54 − 60)/9 = −2/3 ≈ −0.667. Z₂ = (66 − 60)/9 = 2/3 ≈ 0.667.',
        '<strong>Paso 3:</strong> P(54 &lt; X &lt; 66) = P(−0.667 &lt; Z &lt; 0.667) = pnorm(0.667) − pnorm(−0.667).',
        '<strong>Nota:</strong> el PDF de teoría no incluye el resultado desarrollado para este apartado. Termina el cálculo con tus tablas o con R y registra el valor.'
      ]
    },

    {
      id: 'b5-e5',
      statement: 'Se sabe que el tiempo, en horas, que los estudiantes universitarios pasan estudiando cada día sigue una distribución Normal con media μ = 3.5 horas. Si el 33% de los estudiantes estudia menos de 3 horas al día, ¿cuál es la desviación típica de esta distribución?',
      sourceNote: 'Ejercicio 11 del PDF teoría Tema 4',
      types: TYPES,
      correctType: 2,
      typeExplanation: 'Tienes una probabilidad y la media: el incógnita es σ. Despejas a partir de la tipificación.',
      hints: [
        'X → N(3.5, σ). Sabes P(X < 3) = 0.33. Tipifica: P(Z < (3 − 3.5)/σ) = 0.33.',
        '(3 − 3.5)/σ = qnorm(0.33). Calcula qnorm(0.33) (≈ −0.4399).',
        'Despeja σ desde la igualdad −0.5/σ = qnorm(0.33).'
      ],
      answer: null,
      tolerance: null,
      textAnswer: 'Pendiente — resuélvelo tú y contrástalo aquí. El PDF teórico no incluye la solución desarrollada. Plantea P(Z < −0.5/σ) = 0.33 y despeja σ usando qnorm(0.33).',
      solution: [
        '<strong>Paso 1:</strong> X → N(3.5, σ), σ desconocida. Sabemos P(X &lt; 3) = 0.33.',
        '<strong>Paso 2:</strong> tipificamos: P(Z &lt; (3 − 3.5)/σ) = P(Z &lt; −0.5/σ) = 0.33.',
        '<strong>Paso 3:</strong> de la tabla de la N(0,1) o con qnorm(0.33), buscamos el cuantil 0.33: z₀ ≈ −0.4399.',
        '<strong>Paso 4:</strong> igualamos: −0.5/σ = −0.4399 ⇒ σ = 0.5 / 0.4399 ≈ <strong>1.137 horas</strong>.',
        '<strong>Nota:</strong> el PDF de teoría deja la solución como cuadro vacío. Contrasta este resultado con tu cálculo.'
      ]
    }
  ]
};
